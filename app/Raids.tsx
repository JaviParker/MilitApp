import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, Platform } from 'react-native';
import * as Location from 'expo-location';
import { getPreciseDistance } from 'geolib';
import MapView, { Marker } from 'react-native-maps';
import { GoogleMap, LoadScript, Marker as GoogleMarker, DirectionsService, DirectionsRenderer } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '75%',
};

const center = {
  lat: -3.745,
  lng: -38.523,
};

const Raids: React.FC = () => {
  const [currentLocation, setCurrentLocation] = useState<{ lat: number, lng: number } | null>(null);
  const [destination, setDestination] = useState<{ lat: number, lng: number } | null>(null);
  const [distance, setDistance] = useState<string | null>(null);
  const [duration, setDuration] = useState<string | null>(null);
  const [response, setResponse] = useState<any>(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setCurrentLocation({
        lat: location.coords.latitude,
        lng: location.coords.longitude,
      });
    })();
  }, []);

  useEffect(() => {
    if (currentLocation && destination) {
      const dist = getPreciseDistance(
        { latitude: currentLocation.lat, longitude: currentLocation.lng },
        destination
      );

      setDistance(`${(dist / 1000).toFixed(2)} km`);
      const duration = (dist / 1000) / 5; // Suponiendo una velocidad promedio de 5 km/h
      setDuration(`${Math.round(duration * 60)} minutos`);
    }
  }, [currentLocation, destination]);

  const handleMapClick = (event: any) => {
    const { lat, lng } = event.latLng.toJSON();
    setDestination({ lat, lng });
  };

  const directionsCallback = (res: any) => {
    if (res !== null) {
      if (res.status === 'OK') {
        setResponse(res);
        const route = res.routes[0];
        const legs = route.legs[0];
        setDistance(legs.distance.text);
        setDuration(legs.duration.text);
      } else {
        console.error('response: ', res);
      }
    }
  };

  return (
    <View style={styles.container}>
      {Platform.OS === 'web' ? (
        <Text style={styles.infoText}>Para ver el mapa, por favor use la aplicación móvil.</Text>
      ) : (
        <>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: currentLocation ? currentLocation.lat : 37.78825,
              longitude: currentLocation ? currentLocation.lng : -122.4324,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
            onPress={(e) => {
              const { latitude, longitude } = e.nativeEvent.coordinate;
              setDestination({ lat: latitude, lng: longitude });
            }}
          >
            {currentLocation && (
              <Marker
                coordinate={{
                  latitude: currentLocation.lat,
                  longitude: currentLocation.lng,
                }}
                title="Ubicación Actual"
              />
            )}
            {destination && (
              <Marker
                coordinate={{
                  latitude: destination.lat,
                  longitude: destination.lng,
                }}
                title="Destino"
              />
            )}
          </MapView>
          <View style={styles.infoContainer}>
            {distance && <Text style={styles.infoText}>Distancia: {distance}</Text>}
            {duration && <Text style={styles.infoText}>Tiempo estimado: {duration}</Text>}
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height * 0.75,
  },
  infoContainer: {
    padding: 20,
    alignItems: 'center',
  },
  infoText: {
    fontSize: 16,
    color: '#10302B',
    fontWeight: 'bold',
  },
});

export default Raids;
