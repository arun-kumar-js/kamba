import React, { useEffect } from 'react';
//import OneSignal from 'react-native-onesignal';
import { StyleSheet, Text, View, SafeAreaView } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import ProductList from './src/screens/Home';
import ProductById from './src/screens/ProductById';
//import db from './src/db/DataBase';
import Cart from './src/screens/cart';
import Register from './src/screens/Register';
import Login from './src/screens/Login';
import Profile from './src/screens/Profile';
import OrderPlace from './src/screens/OrderPlace';
import MapLocation from './src/screens/MapLocation';
import PlacedOrders from './src/screens/PlacedOrders';

const Stack = createStackNavigator();

const App = () => {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen
            name="Register"
            component={Register}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Login"
            component={Login}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Home"
            component={ProductList}
            options={{ headerShown: false, title: "Products" }}
          />

          <Stack.Screen
            name="ProductById"
            component={ProductById}
            options={{ headerShown: true, title: "Product Details" }}
          />
          <Stack.Screen name="Profile" component={Profile} options={{ title: "User Profile" }} />
          <Stack.Screen name="cart" component={Cart} options={{ title: "Shopping Cart" }} />
          <Stack.Screen name="OrderPlace" component={OrderPlace} options={{ title: "Place Order" }} />
          <Stack.Screen name="MapLocation" component={MapLocation} options={{ title: "Delivery Location" }} />
          <Stack.Screen name="PlacedOrders" component={PlacedOrders} options={{ title: "Your Orders" }} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaView>
  );
};

export default App;

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
