import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoute } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import MapLocation from './MapLocation';
import SQLite from 'react-native-sqlite-storage';
import { useNavigation } from '@react-navigation/native';
const db = SQLite.openDatabase({ name: 'app.db', location: 'default' });

const OrderPlace = () => {
  const [user, setUser] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [deliveryDate, setDeliveryDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const route = useRoute();
  const selectedLocation = route.params?.selectedLocation;
const navigation = useNavigation();
  useEffect(() => {
    const fetchData = async () => {
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        // Pre-fill address fields if available
        if (parsedUser.address) setAddress(parsedUser.address);
        if (parsedUser.city) setCity(parsedUser.city);
        if (parsedUser.postalCode) setPostalCode(parsedUser.postalCode);
      }

      if (route.params?.cartData) {
        setCartItems(route.params.cartData);
      }
      // else {
      //   const storedCart = await AsyncStorage.getItem('cart');
      //   if (storedCart) setCartItems(JSON.parse(storedCart));
      // }
    };
    fetchData();

    db.transaction(tx => {
      tx.executeSql(`DROP TABLE IF EXISTS orders`);
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS orders (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          orderId INTEGER,
          userName TEXT,
          address TEXT,
          city TEXT,
          postalCode TEXT,
          latitude REAL,
          longitude REAL,
          productName TEXT,
          productPrice TEXT,
          totalPrice REAL
        );`
      );
    });
  }, []);

  const onChangeDate = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDeliveryDate(selectedDate);
    }
  };

  const calculateTotalWithSubscription = () => {
    if (!user || cartItems.length === 0) {
      setDiscount(0);
      setTotal(0);
      return;
    }
    const baseTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    let subDiscount = 0;
    if (user.selectedDays === 5) subDiscount = 0.10;
    else if (user.selectedDays === 10) subDiscount = 0.15;

    const productMaxDiscount = Math.max(...cartItems.map(item => item.discount || 0));
    if (productMaxDiscount > subDiscount) subDiscount = productMaxDiscount;

    const today = new Date();
    const diffTime = Math.abs(deliveryDate - today);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays >= 5) {
      subDiscount += 0.05;
      if (subDiscount > 0.3) subDiscount = 0.3;
    }

    // Apply additional 10% discount
    subDiscount += 0.10;
    if (subDiscount > 0.4) subDiscount = 0.4;

    setDiscount(subDiscount);
    setTotal(baseTotal - baseTotal * subDiscount);
  };

  const saveOrderToDB = () => {
    const orderId = Date.now();
    db.transaction(tx => {
      cartItems.forEach(item => {
        tx.executeSql(
          `INSERT INTO orders (orderId, userName, address, city, postalCode, latitude, longitude, productName, productPrice, totalPrice) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            orderId,
            user?.name || '',
            address,
            city,
            postalCode,
            selectedLocation?.latitude || null,
            selectedLocation?.longitude || null,
            item.title,
            item.price,
            item.price * item.quantity
          ],
          () => {},
          (_, error) => {
            console.log('Error saving order item', error);
            return false;
          }
        );
      });
      // After all inserts, clear the cart and show success
      tx.executeSql(
        `DELETE FROM cart`,
        [],
        () => {
          Alert.alert('Success', 'Order has been placed successfully.');
          navigation.navigate('Home');
        },
        (_, error) => {
          console.log('Error deleting cart items', error);
          return false;
        }
      );
    });
  };

  useEffect(() => {
    calculateTotalWithSubscription();
  }, [user, cartItems, deliveryDate]);
console.log(cartItems);
  return (
    <View style={styles.container}>
      {user && (
        <Text style={styles.info}>Subscription: {user.subscriptionType}</Text>
      )}
      <Text style={styles.title}>Order Summary</Text>
      {cartItems.map((item, index) => (
        <Text key={index} style={styles.item}>
          {item.title} - ₹{item.price} x {item.quantity}
        </Text>
      ))}

      <Text style={styles.title}>Fill delivery address</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter delivery address"
        value={address}
        onChangeText={setAddress}
      />
      <TextInput
        style={styles.input}
        placeholder="Enter city"
        value={city}
        onChangeText={setCity}
      />
      <TextInput
        style={styles.input}
        placeholder="Enter postal code"
        value={postalCode}
        onChangeText={setPostalCode}
        keyboardType="numeric"
      />
      <TouchableOpacity onPress={() => setShowDatePicker(true)}>
        <Text style={styles.info}>
          Delivery Date: {deliveryDate.toDateString()}
        </Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={deliveryDate}
          mode="date"
          display="default"
          onChange={onChangeDate}
        />
      )}
      <Text style={styles.deliveryLocationLabel}>Delivery Location:</Text>
      {selectedLocation && (
        <Text style={styles.locationText}>
          Lat: {selectedLocation.latitude}, Lon: {selectedLocation.longitude}
          {selectedLocation.name ? `, Name: ${selectedLocation.name}` : ''}
        </Text>
      )}
      <MapLocation />

      <Text style={styles.info}>Additional Discount: 10%</Text>
      <Text style={styles.info}>Total Discount: {discount * 100}%</Text>
      <Text style={styles.total}>
        Total after Discounts: ₹{total.toFixed(2)}
      </Text>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#4682b4', marginTop: 10 }]}
        onPress={saveOrderToDB}
      >
        <Text style={styles.buttonText}>Place Order</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f0f8ff' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10, color: '#2e8b57' },
  item: { fontSize: 16, marginBottom: 5 },
  info: { fontSize: 16, marginVertical: 5, color: '#333', fontWeight: '500' },
  total: { fontSize: 18, fontWeight: 'bold', marginTop: 10, color: '#d2691e' },
  input: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#2e8b57',
    borderRadius: 5,
    marginVertical: 5,
    backgroundColor: '#ffffff',
  },
  button: {
    backgroundColor: '#ff6347',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  deliveryLocationLabel: {
    fontWeight: 'bold',
    color: '#1e90ff',
    fontSize: 16,
    marginVertical: 5,
  },
  locationText: {
    fontSize: 16,
    color: '#555',
    marginBottom: 10,
  },
});
export default OrderPlace;