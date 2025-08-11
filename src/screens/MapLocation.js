import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MapView, { Marker } from 'react-native-maps';
import React, { useState, useEffect } from 'react';
import Geolocation from '@react-native-community/geolocation';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';

const MapLocation = () => {
  const navigation = useNavigation();
  const [markerCoord, setMarkerCoord] = useState({
    latitude: 13.0827,
    longitude: 80.2707,
  });
  const [selectedLocation, setSelectedLocation] = useState({
    latitude: 13.0827,
    longitude: 80.2707,
  });

  useEffect(() => {
    const requestLocationPermission = async () => {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Access Required',
            message: 'This app needs to access your location',
            buttonPositive: 'OK',
          },
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          console.warn('Location permission denied');
          return;
        }
      }

      Geolocation.getCurrentPosition(
        position => {
          const { latitude, longitude } = position.coords;
          setMarkerCoord({ latitude, longitude });
          setSelectedLocation({ latitude, longitude });
        },
        error => {
          console.error('Error getting location:', error);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
      );
    };

    requestLocationPermission();
  }, []);

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 13.0827,
          longitude: 80.2707,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        onPress={e => {
          setMarkerCoord(e.nativeEvent.coordinate);
          setSelectedLocation(e.nativeEvent.coordinate);
        }}
      >
        <Marker
          coordinate={markerCoord}
          title="Selected Location"
          description="Tap anywhere to change"
          draggable
        />
      </MapView>
      <TouchableOpacity
        style={styles.selectButton}
        onPress={() =>
          navigation.navigate({
            name: 'OrderPlace',
            params: { selectedLocation: selectedLocation },
            merge: true,
          })
        }
      >
        <Text style={styles.buttonText}>Select Location</Text>
      </TouchableOpacity>
      {/* <Text style={styles.coordText}>
        Latitude: {markerCoord.latitude.toFixed(6)}
        {'\n'}
        Longitude: {markerCoord.longitude.toFixed(6)}
      </Text> */}
    </View>
  );
};

export default MapLocation;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  coordText: {
    position: 'absolute',
    bottom: verticalScale(70),
    left: scale(20),
    right: scale(20),
    padding: moderateScale(10),
    backgroundColor: '#ffffffaa',
    color: '#042026',
    textAlign: 'center',
    borderRadius: scale(8),
    fontFamily: 'Roboto',
  },
  selectButton: {
    position: 'absolute',
    bottom: verticalScale(20),
    left: scale(20),
    right: scale(20),
    backgroundColor: '#07575B',
    paddingVertical: verticalScale(12),
    borderRadius: scale(8),
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Roboto',
  },
});
