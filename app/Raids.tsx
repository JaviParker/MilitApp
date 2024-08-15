import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Platform } from 'react-native';
import * as Location from 'expo-location';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

const Raids: React.FC = () => {
  const [currentLocation, setCurrentLocation] = useState<{ lat: number, lng: number } | null>(null);
  const [destination, setDestination] = useState<{ lat: number, lng: number } | null>(null);
  const [distance, setDistance] = useState<string | null>(null);
  const [duration, setDuration] = useState<string | null>(null);
  const [packages, setPackages] = useState<string | null>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<Array<{ latitude: number, longitude: number }>>([]);
  const [currentDay, setCurrentDay] = useState<string | null>(null);
  const [initialRegionSet, setInitialRegionSet] = useState(false); // Estado para controlar si se centró el mapa

  const mapRef = useRef<MapView>(null);

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

      // Obtener datos del destino y ruta desde Firebase
      const fetchDestinationAndRoute = async () => {
        try {
          const db = getFirestore();
          const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
          const dayName = dayNames[new Date().getDay()];
          setCurrentDay(dayName);

          const docRef = doc(db, `Zone/51/Raids/${dayName}`);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const data = docSnap.data();
            const dest = {
              lat: data.latitud,
              lng: data.longitud,
            };
            setDestination(dest);
            setPackages(data.packages || 'No disponible'); // Asigna el dato de packages

            // Obtener ruta después de establecer el destino
            if (currentLocation) {
              const route = await fetchRoute(currentLocation, dest);
              if (route) {
                setRouteCoordinates(route.coordinates);
                setDistance(route.distance);
                setDuration(route.duration);
              }
            }
          } else {
            console.log('No such document!');
          }
        } catch (error) {
          console.error('Error fetching destination:', error);
        }
      };

      fetchDestinationAndRoute();
    })();
  }, [currentLocation]);

  useEffect(() => {
    if (currentLocation && !initialRegionSet && mapRef.current) {
      // Centrar el mapa solo una vez
      mapRef.current.animateToRegion({
        latitude: currentLocation.lat,
        longitude: currentLocation.lng,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }, 500); // La animación toma 500 ms para centrar
      setInitialRegionSet(true); // Marca que el mapa ha sido centrado
    }
  }, [currentLocation, initialRegionSet]);

  const fetchRoute = async (start: any, end: any) => {
    const GOOGLE_API_KEY = "AIzaSyAfRtyQRix_T4vKeHeJb_8YleHVwexKjXw";
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${start.lat},${start.lng}&destination=${end.lat},${end.lng}&key=${GOOGLE_API_KEY}`
      );
      const data = await response.json();

      if (data.routes.length) {
        const points = decodePolyline(data.routes[0].overview_polyline.points);
        return {
          coordinates: points.map(point => ({
            latitude: point[0],
            longitude: point[1],
          })),
          distance: data.routes[0].legs[0].distance.text,
          duration: data.routes[0].legs[0].duration.text,
        };
      }
    } catch (error) {
      console.error('Error fetching route:', error);
    }
    return null;
  };

  const decodePolyline = (t: string) => {
    let points: any[] = [];
    let index = 0, len = t.length;
    let lat = 0, lng = 0;
    while (index < len) {
      let b, shift = 0, result = 0;
      do {
        b = t.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      let dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lat += dlat;
      shift = 0;
      result = 0;
      do {
        b = t.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      let dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lng += dlng;
      points.push([lat / 1E5, lng / 1E5]);
    }
    return points;
  };

  return (
    <View style={styles.container}>
      {Platform.OS === 'web' ? (
        <Text style={styles.infoText}>Para ver el mapa, por favor use la aplicación móvil.</Text>
      ) : (
        <>
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={{
              latitude: currentLocation ? currentLocation.lat : 37.78825,
              longitude: currentLocation ? currentLocation.lng : -122.4324,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
            // Habilita el desplazamiento y zoom del mapa
            scrollEnabled={true}
            zoomEnabled={true}
            pitchEnabled={true}
            rotateEnabled={true}
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
            {routeCoordinates.length > 0 && (
              <Polyline
                coordinates={routeCoordinates}
                strokeColor="#000"
                strokeWidth={3}
              />
            )}
          </MapView>
          <View style={styles.infoContainer}>
            {distance && <Text style={styles.infoText}>Distancia: {distance}</Text>}
            {duration && <Text style={styles.infoText}>Tiempo estimado: {duration}</Text>}
            {packages && <Text style={styles.infoText}>Paquetes: {packages}</Text>}
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
