import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
// If you have a local asset, use: import cartIcon from '../assets/cart.png';
// Otherwise, use a placeholder URL:
const cartIcon = { uri: 'https://img.icons8.com/material-outlined/24/000000/shopping-cart--v1.png' };
const profileIcon = { uri: 'https://img.icons8.com/material-outlined/24/000000/user.png' };

import { fetchAllProducts } from '../api/products';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import db from '../db/DataBase';

const ProductListContent = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartItems, setCartItems] = useState({});
  const navigation = useNavigation();

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAllProducts({ limit: 500 });
      setProducts(data.products || []);
    } catch (error) {
      console.error('Error loading products:', error);
      setProducts([]); // Clear products to avoid undefined data
    } finally {
      setLoading(false);
    }
  }, []);

  // Move loadCartItems declaration above any useEffect that references it
  const loadCartItems = useCallback(() => {
    // Guard: return early if db is not initialized
    if (!db) {
      return;
    }
    setLoading(true);
    db.transaction(
      tx => {
        tx.executeSql(
          'SELECT * FROM cart;',
          [],
          (_, { rows }) => {
            const items = {};
            for (let i = 0; i < rows.length; i++) {
              const item = rows.item(i);
              items[item.id] = item;
            }
            setCartItems(items);
            setLoading(false);
          },
          (txObj, error) => {
            console.error('Error loading cart items:', error && error.message ? error.message : error);
            setLoading(false);
          }
        );
      },
      (error) => {
        console.error('DB transaction error loading cart items:', error && error.message ? error.message : error);
        setLoading(false);
      }
    );
  }, []);

  useEffect(() => {
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
    }, null, loadCartItems);
  }, [loadCartItems]);

  // Load products and cart items on mount
  useEffect(() => {
    loadProducts();
    loadCartItems();
  }, [loadProducts, loadCartItems]);

  useFocusEffect(
    useCallback(() => {
      loadProducts();
      loadCartItems();
    }, [loadProducts, loadCartItems])
  );

  const addToCart = item => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT quantity FROM cart WHERE id = ?;',
        [item.id],
        (_, { rows }) => {
          if (rows.length > 0) {
            // Item exists, update quantity
            tx.executeSql(
              'UPDATE cart SET quantity = quantity + 1 WHERE id = ?;',
              [item.id],
              () => {
                loadCartItems();
                Alert.alert('Added to Cart', 'The item quantity has been increased in your cart.', [
                  { text: 'OK', style: 'default' },
                ]);
              },
              (txObj, error) => {
                console.error('Error updating cart quantity:', error && error.message ? error.message : error);
              }
            );
          } else {
            // Item does not exist, insert new
            tx.executeSql(
              'INSERT INTO cart (id, title, price, quantity, thumbnail, photo) VALUES (?, ?, ?, ?, ?, ?);',
              [
                item.id,
                item.title,
                item.price,
                1,
                item.thumbnail || '',
                item.thumbnail || (Array.isArray(item.images) && item.images.length > 0 ? item.images[0] : '')
              ],
              () => {
                loadCartItems();
                Alert.alert('Added to Cart', 'The item has been added to your cart.', [
                  { text: 'OK', style: 'default' },
                ]);
              },
              (txObj, error) => {
                console.error('Error adding to cart:', error && error.message ? error.message : error);
              }
            );
          }
        },
        (txObj, error) => {
          console.error('Error selecting cart item:', error && error.message ? error.message : error);
        }
      );
    });
  };

  const incrementQuantity = (itemId) => {
    db.transaction(tx => {
      tx.executeSql(
        'UPDATE cart SET quantity = quantity + 1 WHERE id = ?;',
        [itemId],
        () => {
          loadCartItems();
        },
        (txObj, error) => {
          console.error('Error incrementing quantity:', error && error.message ? error.message : error);
        }
      );
    });
  };

  const decrementQuantity = (itemId) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT quantity FROM cart WHERE id = ?;',
        [itemId],
        (_, { rows }) => {
          if (rows.length > 0) {
            const currentQty = rows.item(0).quantity;
            if (currentQty > 1) {
              tx.executeSql(
                'UPDATE cart SET quantity = quantity - 1 WHERE id = ?;',
                [itemId],
                () => {
                  loadCartItems();
                },
                (txObj, error) => {
                  console.error('Error decrementing quantity:', error && error.message ? error.message : error);
                }
              );
            } else {
              // Quantity is 1, remove item from cart
              tx.executeSql(
                'DELETE FROM cart WHERE id = ?;',
                [itemId],
                () => {
                  loadCartItems();
                },
                (txObj, error) => {
                  console.error('Error deleting cart item:', error && error.message ? error.message : error);
                }
              );
            }
          }
        },
        (txObj, error) => {
          console.error('Error selecting cart item for decrement:', error && error.message ? error.message : error);
        }
      );
    });
  };

  const renderItem = ({ item }) => {
    const cartItem = cartItems[item.id];
    return (
      <TouchableOpacity onPress={() => navigation.navigate('ProductById', { product: item })} style={styles.itemContainer}>
        <View style={styles.ratingBadge}>
          <Text style={styles.ratingText}>⭐️{item.rating}</Text>
        </View>
        <View style={{ position: 'relative' }}>
          <Image
            source={{
              uri:
                Array.isArray(item.images) && item.images.length > 0
                  ? item.images[0]
                  : item.thumbnail,
            }}
            style={styles.productImage}
          />
        </View>
        {item.photo ? (
          <Image source={{ uri: item.photo }} style={styles.productImage} />
        ) : null}
        <Text style={styles.productTitle}>{item.title}</Text>
        <Text style={styles.productMeta}>{item.brand}</Text>
        <Text style={styles.productPrice}>${item.price}</Text>
        {cartItem ? (
          <View style={styles.quantityContainer}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => decrementQuantity(item.id)}
            >
              <Text style={styles.quantityButtonText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.quantityText}>{cartItem.quantity}</Text>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => incrementQuantity(item.id)}
            >
              <Text style={styles.quantityButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.addToCartButton}
            onPress={() => addToCart(item)}
          >
            <Text style={styles.addToCartText}>Add to Cart</Text>
          </TouchableOpacity>
        )}
        {/* <Text style={styles.productMeta}>{item.category}</Text> */}
        {/* <Text style={styles.productMeta}>{item.availabilityStatus}</Text> */}
        {/* Truncated description */}
        {/*
        {item.description ? (
          <Text style={styles.productMeta}>
            {item.description.length > 40
              ? item.description.substring(0, 40) + '...'
              : item.description}
          </Text>
        ) : null}
        */}
        {/* Removed Add to Cart button */}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={styles.headerContainer}>
    
          <Text style={styles.homeText}>Home</Text>
        
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => navigation.navigate('cart')}>
            <Image source={cartIcon} style={styles.cartIcon} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={{ marginLeft: 15 }}>
            <Image source={profileIcon} style={styles.cartIcon} />
          </TouchableOpacity>
        </View>
      </View>
      <FlatList
        data={products}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        numColumns={2}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
        alignItems: 'center',
    
  },
  list: {
    padding: 10,
  },
  itemContainer: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 6,
    marginBottom: 10,
    marginRight: '4%',
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // Elevation for Android
    elevation: 3,
  },
  productImage: {
    width: '100%',
    height: 180,
    borderRadius: 6,
  },
  productTitle: {
    marginTop: 5,
    fontWeight: 'bold',
  },
  productPrice: {
    marginTop: 3,
    color: '#888',
  },
  addToCartButton: {
    backgroundColor: '#2874F0',
    paddingVertical: 8,
    borderRadius: 4,
    marginTop: 5,
  },
  addToCartText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
  },
  productMeta: {
    fontSize: 12,
    color: '#555',
  },
  ratingBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FFA500',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    zIndex: 1,
  },
  ratingText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 50,
    backgroundColor: '#fff',
  },
  cartIcon: {
    width: 24,
    height: 24,
    tintColor: '#000',
  },
  homeText: {
    fontWeight: 'bold',
    fontSize: 24,
    color: '#FF5733',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  quantityButton: {
    backgroundColor: '#2874F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  quantityButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    lineHeight: 18,
  },
  quantityText: {
    marginHorizontal: 10,
    fontWeight: 'bold',
    fontSize: 16,
  },
  productImage: { width: 80, height: 80, borderRadius: 6, marginBottom: 5 },
});

export default ProductListContent;