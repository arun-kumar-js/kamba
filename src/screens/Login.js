import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ToastAndroid } from 'react-native'
import React, { useState, useEffect } from 'react'
import { useNavigation } from '@react-navigation/native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import db from '../db/DataBase'

const Login = () => {

  
  const navigation = useNavigation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  useEffect(() => {
    const checkUser = async () => {
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        navigation.navigate('Home');
      }
    };
    checkUser();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields')
      return
    }

    try {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM users WHERE email = ? AND password = ?',
          [email, password],
          async (_, results) => {
            if (results.rows.length > 0) {
              ToastAndroid.show('Login successful', ToastAndroid.SHORT);
              await AsyncStorage.setItem('user', JSON.stringify(results.rows.item(0)));
              navigation.navigate('Home');
            } else {
              ToastAndroid.show('Invalid email or password', ToastAndroid.SHORT);
              Alert.alert('Error', 'Invalid email or password');
            }
          },
          error => {
            console.error(error);
            ToastAndroid.show('An error occurred during login', ToastAndroid.SHORT);
            Alert.alert('Error', 'An error occurred during login');
          }
        );
      });
    } catch (error) {
      ToastAndroid.show('An error occurred during login', ToastAndroid.SHORT)
      Alert.alert('Error', 'An error occurred during login')
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Login</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.registerButton}
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={styles.buttonText}>Register</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default Login

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f9fc',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 25,
    textAlign: 'center',
    color: '#333',
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 15,
    backgroundColor: '#fafafa',
  },
  loginButton: {
    backgroundColor: '#007bff',
    paddingVertical: 15,
    borderRadius: 10,
    marginBottom: 12,
    alignItems: 'center',
  },
  registerButton: {
    backgroundColor: '#28a745',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
})