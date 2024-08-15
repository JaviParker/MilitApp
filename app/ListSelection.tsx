import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { getFirestore, collection, getDocs, doc, getDoc, setDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { RootStackParamList } from './types';

const ListSelectionScreen: React.FC = () => {
  const [lists, setLists] = useState<any[]>([]);
  const [zone, setZone] = useState<string>('');
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const db = getFirestore();
  const auth = getAuth();
  
  useEffect(() => {
    const fetchUserZone = async () => {
      const user = auth.currentUser;
      
      if (!user) {
        Alert.alert('Error', 'Usuario no autenticado.');
        return;
      }

      try {
        const userDocRef = doc(db, `(default)/MilitApp/UserData/${user.uid}`);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();

          if (userData?.zona) {
            setZone(userData.zona);
            fetchLists(userData.zona);
          } else {
            Alert.alert('Error', 'No se encontró la zona del usuario.');
          }
        } else {
          Alert.alert('Error', 'No se encontró el documento del usuario.');
        }
      } catch (error) {
        Alert.alert('Error', 'No se pudo obtener la zona del usuario: ' + error);
      }
    };

    const fetchLists = async (userZone: string) => {
      try {
        const listsCollection = collection(db, `Zone/${userZone}/listas`);
        const listSnapshot = await getDocs(listsCollection);
        const fetchedLists = listSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setLists(fetchedLists);
      } catch (error) {
        Alert.alert('Error', 'No se pudieron obtener las listas: ' + error);
      }
    };

    fetchUserZone();
  }, []);

  const startTimerForAll = async () => {
    try {
      const startTime = Date.now() + 5000; // 5 segundos de retraso
      await setDoc(doc(db, '(default)/MilitApp/TimerControl/startTime'), { startTime });
      Alert.alert('Temporizador iniciado en todos los dispositivos');
      navigation.navigate('Timer');
    } catch (error) {
      Alert.alert('Error', 'No se pudo iniciar el temporizador: ' + error);
    }
  };

  const startTimerForList = async (listId: string) => {
    try {
      const listDocRef = doc(db, `Zone/${zone}/listas/${listId}`);
      const listDoc = await getDoc(listDocRef);

      if (listDoc.exists()) {
        const listData = listDoc.data();
        const startTime = Date.now() + 5000; // 5 segundos de retraso
        await setDoc(doc(db, '(default)/MilitApp/TimerControl/startTime'), { startTime, list: listId });
        Alert.alert(`Temporizador iniciado para la lista ${listData.name}`);
        navigation.navigate('Timer');
      } else {
        Alert.alert('Error', 'No se encontró la lista seleccionada.');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo iniciar el temporizador para la lista seleccionada: ' + error);
    }
  };

  const handleOmit = () => {
    startTimerForAll();
  };

  const handleNewList = () => {
    if (zone) {
      navigation.navigate('NewList', { zona: zone });
    } else {
      Alert.alert('Error', 'Zona no disponible');
    }
  };

  const handleListSelect = (listId: string) => {
    startTimerForList(listId);
  };

  return (
    <View style={styles.container}>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleOmit}>
          <Text style={styles.buttonText}>Omitir</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleNewList}>
          <Text style={styles.buttonText}>Nueva Lista</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={lists}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.listItem} onPress={() => handleListSelect(item.id)}>
            <Text style={styles.listName}>{item.name}</Text>
            <Text style={styles.listCreator}>Creador: {item.creator}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text>No hay listas disponibles</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#10302B',
    padding: 15,
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  listItem: {
    padding: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    marginVertical: 5,
  },
  listName: {
    fontWeight: 'bold',
  },
  listCreator: {
    color: '#555',
  },
});

export default ListSelectionScreen;
