import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import db from '../db/DataBase';

const Cart = () => {
  const navigation = useNavigation();
  const [cartItems, setCartItems] = useState([]);

  const loadCartItems = () => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM cart',
        [],
        (tx, results) => {
          const rows = results.rows;
          let items = [];
          for (let i = 0; i < rows.length; i++) {
            items.push(rows.item(i));
          }
          setCartItems(items);
        },
        error => {
          console.log('Error loading cart items:', error);
        }
      );
    });
  };

  useEffect(() => {
    // Ensure cart table exists
    db.transaction(tx => {
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS cart (
          id INTEGER PRIMARY KEY NOT NULL,
          title TEXT,
          price REAL,
          quantity INTEGER,
          thumbnail TEXT,
          photo TEXT
        );`
      );
    });
    loadCartItems();
  }, []);

  const addToCart = (product) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT quantity FROM cart WHERE id = ?',
        [product.id],
        (tx, results) => {
          if (results.rows.length > 0) {
            // Product exists, update quantity
            tx.executeSql(
              'UPDATE cart SET quantity = quantity + 1 WHERE id = ?',
              [product.id],
              () => {
                loadCartItems();
              },
              error => {
                console.log('Error updating quantity:', error);
              }
            );
          } else {
            // Product does not exist, insert new
            tx.executeSql(
              'INSERT INTO cart (id, title, price, quantity, thumbnail, photo) VALUES (?, ?, ?, ?, ?, ?)',
              [product.id, product.title, product.price, 1, product.thumbnail, product.photo],
              () => {
                loadCartItems();
              },
              error => {
                console.log('Error adding to cart:', error);
              }
            );
          }
        },
        error => {
          console.log('Error checking cart for product:', error);
        }
      );
    });
  };

  const incrementQuantity = (productId) => {
    db.transaction(tx => {
      tx.executeSql(
        'UPDATE cart SET quantity = quantity + 1 WHERE id = ?',
        [productId],
        () => {
          loadCartItems();
        },
        error => {
          console.log('Error incrementing quantity:', error);
        }
      );
    });
  };

  const decrementQuantity = (productId) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT quantity FROM cart WHERE id = ?',
        [productId],
        (tx, results) => {
          if (results.rows.length > 0) {
            const currentQty = results.rows.item(0).quantity;
            if (currentQty > 1) {
              tx.executeSql(
                'UPDATE cart SET quantity = quantity - 1 WHERE id = ?',
                [productId],
                () => {
                  loadCartItems();
                },
                error => {
                  console.log('Error decrementing quantity:', error);
                }
              );
            } else {
              tx.executeSql(
                'DELETE FROM cart WHERE id = ?',
                [productId],
                () => {
                  loadCartItems();
                },
                error => {
                  console.log('Error removing item from cart:', error);
                }
              );
            }
          }
        },
        error => {
          console.log('Error fetching quantity for decrement:', error);
        }
      );
    });
  };

  const renderItem = ({ item }) => {
    const cartItem = cartItems.find(ci => ci.id === item.id);
    return (
      <View style={styles.productContainer}>
        <Image source={{ uri: item.photo || item.thumbnail }} style={styles.productImage} />
        <Text style={styles.productTitle}>{item.title}</Text>
        <View style={styles.priceQuantityRow}>
          <Text style={styles.productPrice}>₹{(item.price * item.quantity).toFixed(2)}</Text>
          {cartItem && (
            <View style={styles.quantityContainer}>
              <TouchableOpacity style={styles.qtyButton} onPress={() => decrementQuantity(item.id)}>
                <Text style={styles.qtyButtonText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.quantityText}>{cartItem.quantity}</Text>
              <TouchableOpacity style={styles.qtyButton} onPress={() => incrementQuantity(item.id)}>
                <Text style={styles.qtyButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        {!cartItem && (
          <TouchableOpacity style={styles.addToCartButton} onPress={() => addToCart(item)}>
            <Text style={styles.addToCartText}>Add to Cart</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={cartItems}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={[styles.listContainer, { paddingBottom: 120 }]}
        ListEmptyComponent={
          <View style={{ flex: 1, alignItems: 'center', marginTop: 50 }}>
            <Text>Your cart is empty</Text>
          </View>
        }
      />
      {cartItems.length > 0 && (
        <View style={styles.payContainer}>
          <Text style={styles.totalPriceText}>
            Total: ₹{totalPrice.toFixed(2)}
          </Text>
          <TouchableOpacity
            style={styles.payButton}
            onPress={() =>
              navigation.navigate('OrderPlace', { cartData: cartItems })
            }
          >
            <Text style={styles.payButtonText}>Place Order</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
  
};

const styles = StyleSheet.create({
  listContainer: {
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  productContainer: {
    marginBottom: 20,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  productImage: {
    width: 150,
    height: 150,
    alignSelf: 'center',
    borderRadius: 10,
    marginBottom: 10,
    resizeMode: 'contain',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  productTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  productPrice: {
    marginTop: 4,
    fontSize: 16,
    color: '#e67e22',
    fontWeight: '600',
  },
  addToCartButton: {
    marginTop: 10,
    backgroundColor: '#3498db',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  addToCartText: {
    color: '#fff',
    fontSize: 16,
  },
  quantityContainer: {
    flexDirection: 'row',
    marginTop: 10,
    alignItems: 'center',
  },
  priceQuantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  qtyButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  qtyButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  quantityText: {
    marginHorizontal: 12,
    fontSize: 18,
    fontWeight: 'bold',
  },
  payButton: {
    backgroundColor: 'green',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  payContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  totalPriceText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
});

export default Cart;