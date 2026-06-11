import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function POST(request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ success: false, error: 'La URL es requerida' }, { status: 400 });
    }

    let provider = 'Desconocido';
    if (url.includes('aliexpress.com')) {
      provider = 'AliExpress';
    } else if (url.includes('temu.com')) {
      provider = 'Temu';
    } else if (url.includes('shein.com')) {
      provider = 'Shein';
    }

    // Cabeceras simulando un navegador real
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      'Upgrade-Insecure-Requests': '1'
    };

    // Intentar realizar el scraping básico mediante fetch
    const response = await fetch(url, { headers, next: { revalidate: 0 } });

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        error: `El proveedor devolvió un código de error: ${response.status}. Por favor, ingresa los datos de forma manual.`,
        fallback: true,
        provider,
        url
      });
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Intentar extraer metadatos Open Graph (muy comunes en e-commerce)
    let title = $('meta[property="og:title"]').attr('content') || 
                $('meta[name="twitter:title"]').attr('content') || 
                $('title').text() || '';
                
    let description = $('meta[property="og:description"]').attr('content') || 
                      $('meta[name="description"]').attr('content') || 
                      $('meta[name="twitter:description"]').attr('content') || '';
                      
    let image = $('meta[property="og:image"]').attr('content') || 
                $('meta[name="twitter:image"]').attr('content') || '';

    // Limpieza de títulos de e-commerce
    if (title) {
      title = title.replace(/\| AliExpress| - AliExpress/gi, '')
                   .replace(/\| Temu| - Temu/gi, '')
                   .replace(/\| Shein| - Shein/gi, '')
                   .trim();
    }

    // Intentar buscar precios estructurados
    let price = '';
    
    // 1. Intentar buscar JSON-LD (Schema.org)
    $('script[type="application/ld+json"]').each((_, element) => {
      try {
        const json = JSON.parse($(element).html() || '{}');
        // Buscar tipo Product
        const findProduct = (obj) => {
          if (obj['@type'] === 'Product') return obj;
          if (obj['@graph']) {
            return obj['@graph'].find(item => item['@type'] === 'Product');
          }
          return null;
        };
        
        const productObj = findProduct(json);
        if (productObj) {
          if (productObj.name && !title) title = productObj.name;
          if (productObj.description && !description) description = productObj.description;
          if (productObj.image && !image) {
            image = Array.isArray(productObj.image) ? productObj.image[0] : productObj.image;
          }
          if (productObj.offers) {
            const offers = productObj.offers;
            if (Array.isArray(offers)) {
              price = offers[0].price || offers[0].lowPrice || '';
            } else {
              price = offers.price || offers.lowPrice || '';
            }
          }
        }
      } catch (e) {
        // Ignorar fallos de parsing de scripts JSON sucios
      }
    });

    // 2. Si no se encuentra precio en JSON-LD, buscar metadatos de precios
    if (!price) {
      price = $('meta[property="product:price:amount"]').attr('content') || 
              $('meta[property="og:price:amount"]').attr('content') || 
              $('meta[name="twitter:label1"]').filter(function() {
                return $(this).attr('content') === 'Price';
              }).next().attr('content') || '';
    }

    // Limpiar precio si tiene símbolos de moneda
    if (price && typeof price === 'string') {
      price = price.replace(/[^0-9.]/g, '');
    }
    
    const parsedPrice = price ? parseFloat(price) : null;

    // Si todo está vacío, es probable que haya habido un bloqueo o renderizado JS obligatorio
    if (!title && !image) {
      return NextResponse.json({
        success: false,
        error: 'El sitio web del proveedor requiere interactividad del navegador o nos ha bloqueado. Puedes ingresar los campos manualmente.',
        fallback: true,
        provider,
        url
      });
    }

    return NextResponse.json({
      success: true,
      product: {
        title: title || '',
        description: description || '',
        price: parsedPrice || '',
        original_price: parsedPrice ? Math.round(parsedPrice * 1.8 * 100) / 100 : '', // Auto-generar precio de anclaje (anclaje psicológico 80% más caro)
        image: image || '',
        provider_url: url,
        provider,
        stock: 5 // Stock por defecto para escasez
      }
    });

  } catch (error) {
    console.error('Error en importación de producto:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Error interno del servidor al procesar el enlace. Puedes rellenar los datos manualmente.',
      fallback: true
    }, { status: 500 });
  }
}
