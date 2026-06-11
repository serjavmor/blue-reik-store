import path from 'path';

let dbInstance = null;

// Implementación de Base de Datos Mock para entornos Serverless como Vercel
class MockDb {
  constructor() {
    this.products = [
      {
        id: 1,
        title: 'Vestido Midi Satinado SatinFlow™ Champagne',
        description: 'Eleva tu estilo con el vestido SatinFlow™. Confeccionado en un satén de seda premium que ofrece una caída fluida y un brillo sutil espectacular. Cuenta con tirantes finos ajustables, cuello drapeado y una silueta favorecedora que abraza tus curvas con suavidad. Ideal para noches especiales, eventos o looks elegantes de verano.',
        price: 34990,
        original_price: 69990,
        image: '/images/satin_flow_dress.png',
        provider_url: 'https://es.aliexpress.com/item/100500123456789.html',
        provider: 'AliExpress',
        stock: 5,
        rating: 4.9,
        reviews_count: 3,
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        title: 'Jersey de Punto Trenzado SoftCloud™',
        description: 'La definición de confort premium. SoftCloud™ es un jersey de punto grueso confeccionado con un hilado de algodón ultra-suave que no pica. Presenta una silueta holgada oversize muy en tendencia, mangas caídas y puños acanalados. Perfecto para abrigarte con estilo durante los días frescos sin perder ligereza ni transpirabilidad.',
        price: 29990,
        original_price: 59990,
        image: '/images/softcloud_sweater.png',
        provider_url: 'https://www.temu.com/goods-mock-12345.html',
        provider: 'Temu',
        stock: 3,
        rating: 4.8,
        reviews_count: 3,
        created_at: new Date().toISOString()
      },
      {
        id: 3,
        title: 'Conjunto Deportivo Seamless AeroFit™ 2 Piezas',
        description: 'Domina tus entrenamientos y tu día a día. El conjunto AeroFit™ incluye un top deportivo de sujeción media con tirantes cruzados y leggings de tiro alto con tecnología anticelulítica y control de abdomen. Confeccionado en tejido elástico en cuatro direcciones sin costuras, súper suave y transpirable que evacua el sudor de forma rápida.',
        price: 39990,
        original_price: 79990,
        image: '/images/aerofit_sportset.png',
        provider_url: 'https://es.aliexpress.com/item/100500987654321.html',
        provider: 'AliExpress',
        stock: 4,
        rating: 4.9,
        reviews_count: 3,
        created_at: new Date().toISOString()
      }
    ];

    this.orders = [];
    this.reviews = [];

    // Llenar reseñas mock para cada producto
    this.products.forEach(p => {
      this.reviews.push(
        {
          id: this.reviews.length + 1,
          product_id: p.id,
          author: 'Camila V.',
          rating: 5,
          comment: '¡Queda hermoso puesto! Horma de maravilla en el cuerpo y el diseño es súper novedoso y atrevido. Todo el proceso de pago con Webpay estuvo correcto y rápido. Al consultar por WhatsApp por la talla me respondieron de inmediato y de forma muy amable. El seguimiento del envío por Starken no tuvo ningún problema y llegó en 5 días a mi casa en Santiago. ¡Recomendado!'
        },
        {
          id: this.reviews.length + 1,
          product_id: p.id,
          author: 'Javiera P.',
          rating: 5,
          comment: 'La prenda me quedó pintada, el calce es perfecto y la tela es exquisita. Me encanta que Blue Reik traiga diseños tan novedosos que no se ven en ninguna otra tienda de Chile. Todo estuvo súper correcto en la compra y cuando hice el seguimiento del envío en CorreosChile con el código que me dieron, no tuve ningún problema. Soporte de 10.'
        },
        {
          id: this.reviews.length + 1,
          product_id: p.id,
          author: 'Isidora M.',
          rating: 4,
          comment: 'Diseño súper novedoso y atrevido, destaca un montón. Tenía dudas con el calce pero me respondieron al correo súper rápido asesorándome con la talla correcta y me quedó perfecto. El pago con Webpay fue muy fluido. Hice el seguimiento de Starken sin ningún inconveniente en su web hasta que llegó a Viña. Súper conforme.'
        }
      );
    });
  }

  async exec(sql) {
    return this;
  }

  async run(sql, params = []) {
    if (sql.includes('INSERT INTO orders')) {
      const newOrder = {
        id: this.orders.length + 1,
        customer_name: params[0],
        customer_email: params[1],
        customer_phone: params[2],
        address: params[3],
        city: params[4],
        country: params[5],
        product_id: params[6],
        quantity: params[7],
        total_price: 0,
        status: 'Pendiente',
        shipping_status: 'No Enviado',
        tracking_number: '',
        created_at: new Date().toISOString()
      };
      
      const product = this.products.find(p => p.id === newOrder.product_id);
      if (product) {
        newOrder.total_price = product.price * newOrder.quantity;
      }
      this.orders.push(newOrder);
      return { lastID: newOrder.id };
    }

    if (sql.includes('INSERT INTO products')) {
      const newProduct = {
        id: this.products.length + 1,
        title: params[0],
        description: params[1],
        price: params[2],
        original_price: params[3],
        image: params[4],
        provider_url: params[5],
        provider: params[6],
        stock: params[7] || 10,
        rating: params[8] || 4.5,
        reviews_count: params[9] || 0,
        created_at: new Date().toISOString()
      };
      this.products.push(newProduct);
      return { lastID: newProduct.id };
    }

    if (sql.includes('UPDATE orders SET')) {
      // UPDATE orders SET status = ?, shipping_status = ?, tracking_number = ? WHERE id = ?
      const status = params[0];
      const shippingStatus = params[1];
      const trackingNumber = params[2];
      const orderId = params[3];
      const order = this.orders.find(o => o.id === orderId);
      if (order) {
        order.status = status;
        order.shipping_status = shippingStatus;
        order.tracking_number = trackingNumber;
      }
      return this;
    }

    if (sql.includes('DELETE FROM orders WHERE id = ?')) {
      const id = params[0];
      this.orders = this.orders.filter(o => o.id !== id);
      return this;
    }

    if (sql.includes('DELETE FROM products')) {
      this.products = [];
      return this;
    }

    if (sql.includes('DELETE FROM reviews')) {
      this.reviews = [];
      return this;
    }

    return this;
  }

  async all(sql, params = []) {
    if (sql.includes('FROM products')) {
      if (sql.includes('WHERE id = ?')) {
        const id = params[0];
        return this.products.filter(p => p.id === id);
      }
      return [...this.products].sort((a, b) => b.id - a.id);
    }
    if (sql.includes('FROM orders')) {
      if (sql.includes('WHERE id = ?')) {
        const id = params[0];
        return this.orders.filter(o => o.id === id);
      }
      return [...this.orders].sort((a, b) => b.id - a.id);
    }
    if (sql.includes('FROM reviews')) {
      if (sql.includes('WHERE product_id = ?')) {
        const productId = params[0];
        return this.reviews.filter(r => r.product_id === productId);
      }
      return this.reviews;
    }
    return [];
  }

  async get(sql, params = []) {
    if (sql.includes('SELECT COUNT(*)')) {
      if (sql.includes('FROM products')) {
        return { count: this.products.length };
      }
      if (sql.includes('FROM orders')) {
        return { count: this.orders.length };
      }
    }
    if (sql.includes('FROM products WHERE id = ?')) {
      const id = params[0];
      return this.products.find(p => p.id === id) || null;
    }
    if (sql.includes('FROM orders WHERE id = ?')) {
      const id = params[0];
      return this.orders.find(o => o.id === id) || null;
    }
    return null;
  }
}

export async function getDb() {
  if (dbInstance) {
    return dbInstance;
  }

  // Detectar si estamos en Vercel
  if (process.env.VERCEL) {
    console.log('Ambiente Vercel detectado: utilizando base de datos simulada en memoria.');
    if (!global.__mockDb) {
      global.__mockDb = new MockDb();
    }
    dbInstance = global.__mockDb;
    return dbInstance;
  }

  try {
    // Importaciones dinámicas condicionales para evitar que webpack intente
    // resolver código nativo de C++ al construir para Vercel
    const sqlite3Module = await import('sqlite3');
    const sqliteOpenModule = await import('sqlite');

    const sqlite3 = sqlite3Module.default || sqlite3Module;
    const open = sqliteOpenModule.open;

    const dbPath = path.join(process.cwd(), 'database.db');
    
    dbInstance = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });

    // Inicializar tablas
    await dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        original_price REAL,
        image TEXT,
        provider_url TEXT,
        provider TEXT,
        stock INTEGER DEFAULT 10,
        rating REAL DEFAULT 4.5,
        reviews_count INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_name TEXT NOT NULL,
        customer_email TEXT NOT NULL,
        customer_phone TEXT,
        address TEXT NOT NULL,
        city TEXT NOT NULL,
        country TEXT NOT NULL,
        product_id INTEGER,
        quantity INTEGER DEFAULT 1,
        total_price REAL,
        status TEXT DEFAULT 'Pendiente',
        shipping_status TEXT DEFAULT 'No Enviado',
        tracking_number TEXT DEFAULT '',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(product_id) REFERENCES products(id)
      );

      CREATE TABLE IF NOT EXISTS reviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER,
        author TEXT NOT NULL,
        rating INTEGER NOT NULL,
        comment TEXT,
        image TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(product_id) REFERENCES products(id)
      );
    `);

    // Limpiar productos viejos para forzar la actualización de mocks si es desarrollo local
    await dbInstance.run('DELETE FROM products');
    await dbInstance.run('DELETE FROM reviews');

    const productsCount = await dbInstance.get('SELECT COUNT(*) as count FROM products');
    
    if (productsCount.count === 0) {
      const mockProducts = [
        {
          title: 'Vestido Midi Satinado SatinFlow™ Champagne',
          description: 'Eleva tu estilo con el vestido SatinFlow™. Confeccionado en un satén de seda premium que ofrece una caída fluida y un brillo sutil espectacular. Cuenta con tirantes finos ajustables, cuello drapeado y una silueta favorecedora que abraza tus curvas con suavidad. Ideal para noches especiales, eventos o looks elegantes de verano.',
          price: 34990,
          original_price: 69990,
          image: '/images/satin_flow_dress.png',
          provider_url: 'https://es.aliexpress.com/item/100500123456789.html',
          provider: 'AliExpress',
          stock: 5,
          rating: 4.9,
          reviews_count: 3
        },
        {
          title: 'Jersey de Punto Trenzado SoftCloud™',
          description: 'La definición de confort premium. SoftCloud™ es un jersey de punto grueso confeccionado con un hilado de algodón ultra-suave que no pica. Presenta una silueta holgada oversize muy en tendencia, mangas caídas y puños acanalados. Perfecto para abrigarte con estilo durante los días frescos sin perder ligereza ni transpirabilidad.',
          price: 29990,
          original_price: 59990,
          image: '/images/softcloud_sweater.png',
          provider_url: 'https://www.temu.com/goods-mock-12345.html',
          provider: 'Temu',
          stock: 3,
          rating: 4.8,
          reviews_count: 3
        },
        {
          title: 'Conjunto Deportivo Seamless AeroFit™ 2 Piezas',
          description: 'Domina tus entrenamientos y tu día a día. El conjunto AeroFit™ incluye un top deportivo de sujeción media con tirantes cruzados y leggings de tiro alto con tecnología anticelulítica y control de abdomen. Confeccionado en tejido elástico en cuatro direcciones sin costuras, súper suave y transpirable que evacua el sudor de forma rápida.',
          price: 39990,
          original_price: 79990,
          image: '/images/aerofit_sportset.png',
          provider_url: 'https://es.aliexpress.com/item/100500987654321.html',
          provider: 'AliExpress',
          stock: 4,
          rating: 4.9,
          reviews_count: 3
        }
      ];

      for (const p of mockProducts) {
        const result = await dbInstance.run(
          `INSERT INTO products (title, description, price, original_price, image, provider_url, provider, stock, rating, reviews_count) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [p.title, p.description, p.price, p.original_price, p.image, p.provider_url, p.provider, p.stock, p.rating, p.reviews_count]
        );
        
        const productId = result.lastID;
        
        const reviews = [
          {
            author: 'Camila V.',
            rating: 5,
            comment: '¡Queda hermoso puesto! Horma de maravilla en el cuerpo y el diseño es súper novedoso y atrevido. Todo el proceso de pago con Webpay estuvo correcto y rápido. Al consultar por WhatsApp por la talla me respondieron de inmediato y de forma muy amable. El seguimiento del envío por Starken no tuvo ningún problema y llegó en 5 días a mi casa en Santiago. ¡Recomendado!'
          },
          {
            author: 'Javiera P.',
            rating: 5,
            comment: 'La prenda me quedó pintada, el calce es perfecto y la tela es exquisita. Me encanta que Blue Reik traiga diseños tan novedosos que no se ven en ninguna otra tienda de Chile. Todo estuvo súper correcto en la compra y cuando hice el seguimiento del envío en CorreosChile con el código que me dieron, no tuve ningún problema. Soporte de 10.'
          },
          {
            author: 'Isidora M.',
            rating: 4,
            comment: 'Diseño súper novedoso y atrevido, destaca un montón. Tenía dudas con el calce pero me respondieron al correo súper rápido asesorándome con la talla correcta y me quedó perfecto. El pago con Webpay fue muy fluido. Hice el seguimiento de Starken sin ningún inconveniente en su web hasta que llegó a Viña. Súper conforme.'
          }
        ];
        
        for (const r of reviews) {
          await dbInstance.run(
            `INSERT INTO reviews (product_id, author, rating, comment) VALUES (?, ?, ?, ?)`,
            [productId, r.author, r.rating, r.comment]
          );
        }
      }
    }

    return dbInstance;
  } catch (error) {
    console.error('No se pudo inicializar la base de datos física (SQLite), utilizando respaldo en memoria:', error);
    if (!global.__mockDb) {
      global.__mockDb = new MockDb();
    }
    dbInstance = global.__mockDb;
    return dbInstance;
  }
}
