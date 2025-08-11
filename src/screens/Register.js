import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity, ToastAndroid } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import db, { createTable, insertUser } from '../db/DataBase';
import { useNavigation } from '@react-navigation/native';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [subscriptionType, setSubscriptionType] = useState('Weekend');
  const navigation = useNavigation();

  useEffect(() => {
    (async () => {
      await createTable();
    })();
  }, []);

  const handleRegister = async () => {
    if (!username.trim() || !email.trim() || !password.trim() || !subscriptionType.trim()) {
      ToastAndroid.show('Please fill all fields', ToastAndroid.SHORT);
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    console.log('Registering with:', {
      username,
      email,
      password,
      subscriptionType
    });
    try {
      await insertUser({
        username,
        email,
        password,
        subscriptionType
      });
    } catch (error) {
      console.error('Database error:', error);
      ToastAndroid.show(`Error: ${error.message}`, ToastAndroid.SHORT);
      return;
    }
    ToastAndroid.show('User registered successfully!', ToastAndroid.SHORT);
    Alert.alert('Success', 'User registered successfully!');
    setUsername('');
    setEmail('');
    setPassword('');
    setSubscriptionType('Weekend');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>
      <View style={styles.formCard}>
        <TextInput
          style={styles.input}
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
        />

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          keyboardType="email-address"
          onChangeText={setEmail}
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <Text style={styles.label}>Select Subscription Type</Text>
        <Picker
          selectedValue={subscriptionType}
          style={styles.picker}
          onValueChange={itemValue => setSubscriptionType(itemValue)}
        >
          <Picker.Item label="Weekend Subscription" value="Weekend" />
          <Picker.Item label="Weekdays Subscription" value="Weekdays" />
          <Picker.Item label="Random Day Subscription" value="Random" />
        </Picker>

        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Register</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#28A745', marginTop: 10 }]}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    paddingHorizontal: 25, 
    backgroundColor: '#EAF6FF', 
    justifyContent: 'center', 
    alignItems: 'stretch' 
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    marginBottom: 30, 
    color: '#007BFF', 
    textAlign: 'center',
    letterSpacing: 1,
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#80BDFF',
    padding: 10,
    marginBottom: 15,
    borderRadius: 8,
    backgroundColor: '#FDFEFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  label: { 
    fontSize: 16, 
    marginBottom: 5,
    fontWeight: '600', 
    color: '#007BFF', 
    marginTop: 10 
  },
  picker: { 
    height: 50, 
    marginBottom: 20,
    backgroundColor: '#FDFEFF',
    borderWidth: 1.5,
    borderColor: '#80BDFF',
    borderRadius: 8,
  },
  button: {
    backgroundColor: '#007BFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
});
