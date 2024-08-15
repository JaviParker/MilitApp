import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Platform, Button } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as Location from 'expo-location';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { getFirestore, collection, getDocs, addDoc, doc, setDoc } from 'firebase/firestore';
import { getPreciseDistance } from 'geolib';

interface ListItem {
  id: string;
  name: string;
  users: Array<{ id: string }>;
}

const RaidsConfig: React.FC = () => {
  const [currentLocation, setCurrentLocation] = useState<{ lat: number, lng: number } | null>(null);
  const [destination, setDestination] = useState<{ lat: number, lng: number } | null>(null);
  const [distance, setDistance] = useState<string | null>(null);
  const [duration, setDuration] = useState<string | null>(null);
  const [packages, setPackages] = useState<number | null>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<Array<{ latitude: number, longitude: number }>>([]);
  const [lists, setLists] = useState<ListItem[]>([]);
  const [selectedList, setSelectedList] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>('Lunes');
  const [team, setTeam] = useState<number | null>(null);
  
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const currentCoords = {
        lat: location.coords.latitude,
        lng: location.coords.longitude,
      };
      setCurrentLocation(currentCoords);

      if (mapRef.current) {
        mapRef.current.animateToRegion({
          latitude: currentCoords.lat,
          longitude: currentCoords.lng,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        });
      }

      const db = getFirestore();
      const zone = "51"; // Supongamos que el zone es 51
      const listsRef = collection(db, `Zone/${zone}/listas`);
      const snapshot = await getDocs(listsRef);
      const listsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as ListItem[];
      setLists(listsData);
    })();
  }, []);

  useEffect(() => {
    if (currentLocation && destination) {
      const dist = getPreciseDistance(
        { latitude: currentLocation.lat, longitude: currentLocation.lng },
        destination
      );
      const distanceInKm = dist / 1000;
      setDistance(`${distanceInKm.toFixed(2)} km`);
      const duration = distanceInKm / 5; // Asumiendo una velocidad de 5 km/h
      setDuration(`${Math.round(duration * 60)} minutos`);
      
      if (selectedList) {
        const selectedListDetails = lists.find(list => list.name === selectedList);
        const userCount = selectedListDetails?.users.length || 0;
        const estimatedPackages = (distanceInKm * userCount) / 10;
        
        setPackages(estimatedPackages);
        console.log(packages);
        
      }
    }
  }, [currentLocation, destination, selectedList]);

  const handleMapClick = async (e: any) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setDestination({ lat: latitude, lng: longitude });
  };

  const saveRaidConfig = async () => {
    if (selectedList && selectedDay && destination) {
      const db = getFirestore();
      const zone = "51";
      const docRef = doc(db, `Zone/${zone}/Raids/${selectedDay}`);
      try {
        // Guardar el documento, creando uno nuevo si no existe o actualizando el existente
        await setDoc(docRef, {
          lista: selectedList,
          equipo: team,
          dia: selectedDay,
          latitud: destination.lat,
          longitud: destination.lng,
          kilometros: distance,
          tiempo: duration,
          packages: packages?.toFixed(2),
        }, { merge: true });
  
        alert('Configuración de Raid guardada exitosamente.');
      } catch (error) {
        console.error('Error guardando la configuración de Raid:', error);
        alert('Ocurrió un error al guardar la configuración de Raid.');
      }
    } else {
      alert('Por favor, completa todos los campos antes de guardar.');
    }
  };

  return (
    <View style={styles.container}>
      {Platform.OS === 'web' ? (
        <Text style={styles.infoText}>Para ver el mapa, por favor use la aplicación móvil.</Text>
      ) : (
        <>
          <View>
            <Text style={styles.infoText}>Equipo:</Text>
            <Picker
                selectedValue={selectedList}
                // onValueChange={(itemValue) => setSelectedList(itemValue)}
                onValueChange={(itemValue) => {setSelectedList(itemValue)}}
                style={styles.picker}
            >
                <Picker.Item key={"equipo"} label={"Seleccionar equipo"} value={"Seleccionar equipo"} />
                {lists.map(list => (
                <Picker.Item key={list.id} label={list.name} value={list.name} />
                ))}
            </Picker>
          </View>
          <View style={styles.selecter}>
            <Text style={styles.infoText}>Dia:</Text>
            <Picker
                selectedValue={selectedDay}
                onValueChange={(itemValue) => setSelectedDay(itemValue)}
                style={styles.picker}
            >
                
                {["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"].map(day => (
                <Picker.Item key={day} label={day} value={day} />
                ))}
                
            </Picker>
          </View>
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={{
              latitude: currentLocation ? currentLocation.lat : 37.78825,
              longitude: currentLocation ? currentLocation.lng : -122.4324,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
            onPress={handleMapClick}
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
            {packages !== null && <Text style={styles.infoText}>Paquetes estimados: {packages.toFixed(2)}</Text>}
          </View>
          <Button title="Guardar" onPress={saveRaidConfig} />
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
    height: Dimensions.get('window').height * 0.5,
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
  picker: {
    height: 40,
    width: 300,
    marginBottom: 10,
  },
  selecter: {
    display: "flex"
  }
});

export default RaidsConfig;
