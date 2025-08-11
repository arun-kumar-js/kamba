// src/db/database.js
import SQLite from 'react-native-sqlite-storage';

SQLite.DEBUG(true);
SQLite.enablePromise(false);

const db = SQLite.openDatabase({ name: 'app.db', location: 'default' });

export default db;

export const createTable = () => {
  const query = `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL,
      email TEXT NOT NULL,
      password TEXT NOT NULL,
      subscription_type TEXT NOT NULL
    );`;
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(query, [], () => resolve(), (_, error) => reject(error));
    });
  });
};

export const insertUser = (user) => {
  const insertQuery =
    `INSERT INTO users (username, email, password, subscription_type) VALUES (?, ?, ?, ?);`;
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        insertQuery,
        [
          user.username,
          user.email,
          user.password,
          user.subscriptionType,
        ],
        () => resolve(),
        (_, error) => reject(error)
      );
    });
  });
};

export const createProductsTable = () => {
  const query = `CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      price REAL NOT NULL
    );`;
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(query, [], () => resolve(), (_, error) => reject(error));
    });
  });
};

export const insertProduct = (product) => {
  const query = `INSERT INTO products (name, price) VALUES (?, ?);`;
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        query,
        [product.name, product.price],
        () => resolve(),
        (_, error) => reject(error)
      );
    });
  });
};

export const getProducts = () => {
  const query = `SELECT * FROM products;`;
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        query,
        [],
        (_, results) => {
          const products = [];
          for (let i = 0; i < results.rows.length; i++) {
            products.push(results.rows.item(i));
          }
          resolve(products);
        },
        (_, error) => reject(error)
      );
    });
  });
};