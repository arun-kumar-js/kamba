import axios from 'axios';

const BASE_URL = 'https://dummyjson.com';
import db from '../db/DataBase';
export const fetchAllProducts = async (options = {}) => {
  let products = [];
  let resData = null;
  try {
    const res = await axios.get(`${BASE_URL}/products`, { params: options });
    resData = res.data;
    products = resData.products || [];
    console.log('Fetched products:', products);
    if (products.length === 0) {
      console.warn('Warning: API returned an empty products array.');
    }
  } catch (error) {
    console.error('Error fetching products from API:', error);
    return { products: [] };
  }

  // Save to local SQLite DB
  if (!db) {
    console.warn('Database not initialized, skipping local save.');
    return resData;
  }
  try {
    db.transaction(tx => {
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS products (
          id INTEGER PRIMARY KEY NOT NULL,
          title TEXT,
          description TEXT,
          price REAL,
          thumbnail TEXT,
          availabilityStatus TEXT,
          brand TEXT,
          category TEXT,
          dimensions TEXT,
          discountPercentage REAL,
          images TEXT,
          meta TEXT,
          minimumOrderQuantity INTEGER,
          rating REAL,
          returnPolicy TEXT,
          reviews TEXT,
          shippingInformation TEXT,
          sku TEXT,
          stock INTEGER,
          tags TEXT,
          warrantyInformation TEXT,
          weight REAL
        );`
      );
      products.forEach(p => {
        tx.executeSql(
          `INSERT OR REPLACE INTO products (
            id, title, description, price, thumbnail,
            availabilityStatus, brand, category, dimensions, discountPercentage,
            images, meta, minimumOrderQuantity, rating, returnPolicy,
            reviews, shippingInformation, sku, stock, tags,
            warrantyInformation, weight
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
          [
            p.id,
            p.title,
            p.description,
            p.price,
            p.thumbnail,
            p.availabilityStatus || null,
            p.brand || null,
            p.category || null,
            p.dimensions ? JSON.stringify(p.dimensions) : null,
            p.discountPercentage || null,
            p.images ? JSON.stringify(p.images) : null,
            p.meta ? JSON.stringify(p.meta) : null,
            p.minimumOrderQuantity || null,
            p.rating || null,
            p.returnPolicy || null,
            p.reviews ? JSON.stringify(p.reviews) : null,
            p.shippingInformation || null,
            p.sku || null,
            p.stock || null,
            p.tags ? JSON.stringify(p.tags) : null,
            p.warrantyInformation || null,
            p.weight || null
          ]
        );
      });
    }, undefined, () => {
      alert('Products saved locally');
      console.log('Products saved locally to DB');
    });
  } catch (error) {
    console.warn('Failed to save products locally:', error);
  }

  return resData;
};

export const fetchProductById = async id => {
  const res = await axios.get(`${BASE_URL}/products/${id}`);
  return res.data;
};

export const searchProducts = async (query, options = {}) => {
  const res = await axios.get(`${BASE_URL}/products/search`, {
    params: { q: query, ...options },
  });
  return res.data;
};
