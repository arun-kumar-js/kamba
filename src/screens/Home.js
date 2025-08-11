import React, { Suspense } from 'react';
import { View, ActivityIndicator, StyleSheet, TouchableOpacity, Image } from 'react-native';
//import CartIcon from '../assets/icon/cart.png';
//import ProfileIcon from '../assets/icon/profile.png';
import db from '../db/DataBase';
const ProductListContent = React.lazy(() => import('./ProductListContent'));

const ProductList = ({ navigation }) => {
  if (!db) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }
  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        
      </View>
      <Suspense
        fallback={
          <View style={styles.loaderContainer}>
            <View style={styles.placeholderRow}>
              <View style={styles.placeholderCard} />
              <View style={styles.placeholderCard} />
            </View>
            <View style={styles.placeholderRow}>
              <View style={styles.placeholderCard} />
              <View style={styles.placeholderCard} />
            </View>
          </View>
        }
      >
        <ProductListContent />
      </Suspense>
    </View>
  );
};

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  
  },
  placeholderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  placeholderCard: {
    width: '48%',
    height: 200,
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 10,
    backgroundColor: '#fff',
  },
});

export default ProductList;
