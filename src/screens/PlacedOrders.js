import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import SQLite from 'react-native-sqlite-storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

const db = SQLite.openDatabase({ name: 'app.db', location: 'default' });

const OrdersList = () => {
  const [orders, setOrders] = useState([]);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  console.log(orders);

  const fetchOrders = () => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM orders',
        [],
        (_, results) => {
          let rows = results.rows;
          let temp = [];
          for (let i = 0; i < rows.length; i++) {
            temp.push(rows.item(i));
          }
          setOrders(temp);
        },
        (_, error) => {
          console.log('Error fetching orders', error);
        },
      );
    });
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          const user = JSON.parse(userData);
          setUserName(user.name || user.username || '');
          setUserEmail(user.email || user.userEmail || '');
        }
      } catch (error) {
        console.log('Error fetching user from AsyncStorage', error);
      }
    };
    fetchUser();
  }, []);

  const cancelOrder = (orderId) => {
    Alert.alert(
      "Cancel Order",
      "Are you sure you want to cancel this order?",
      [
        {
          text: "No",
          style: "cancel"
        },
        {
          text: "Yes",
          onPress: () => {
            db.transaction(tx => {
              tx.executeSql(
                'DELETE FROM orders WHERE orderId = ?',
                [orderId],
                () => {
                  fetchOrders();
                },
                (_, error) => {
                  console.log('Error deleting order', error);
                }
              );
            });
          }
        }
      ]
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.title}>{item.userName}</Text>
      <Text>Address: {item.address}</Text>
      <Text>City: {item.city}</Text>
      <Text>Postal Code: {item.postalCode}</Text>
      <Text>
        Lat: {item.latitude}, Lng: {item.longitude}
      </Text>
      <Text style={styles.price}>Total Price: {item.totalPrice}</Text>
      <TouchableOpacity style={styles.cancelButton} onPress={() => cancelOrder(item.orderId)}>
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <>
      <View style={styles.userHeader}>
        <Text style={styles.userName}>{userName}</Text>
        {userEmail ? <Text style={styles.userEmail}>{userEmail}</Text> : null}
      </View>
      <FlatList
        data={orders}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
      />
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 12,
    marginBottom: 10,
    borderRadius: 8,
    elevation: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
    padding: 16,
  },
  headerText: {
    fontWeight: '600',
    fontSize: 16,
  },
  price: {
    color: '#007AFF',
    fontWeight: '600',
  },
  userHeader: { padding: 16, backgroundColor: '#f8f8f8', alignItems: 'center' },
  userName: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  userEmail: { fontSize: 14, color: '#666' },
  cancelButton: {
    backgroundColor: 'red',
    padding: 8,
    borderRadius: 6,
    marginTop: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});

export default OrdersList;
