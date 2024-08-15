import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Image, Alert } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { getFirestore, collection, getDocs, doc, getDoc, setDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import uuid from 'react-native-uuid';
import { RootStackParamList } from './types';


export interface User {
  id: string;
  zona: string;
  nombre: string;
  rango: string;
  profileImage: string;
}

const NewListScreen: React.FC = () => {
  const [listName, setListName] = useState<string>('');
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [zone, setZone] = useState<string>('');
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const db = getFirestore();

  useEffect(() => {
    const fetchUserZoneAndUsers = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) {
        Alert.alert('Error', 'Usuario no autenticado');
        return;
      }

      // Obtener los datos del usuario actual
      const userDocRef = doc(db, `(default)/MilitApp/UserData/${user.uid}`);
      const userDoc = await getDoc(userDocRef);
      const userData = userDoc.data();

      if (userData && userData.zona) {
        setZone(userData.zona);

        // Obtener todos los usuarios
        const userCollection = collection(db, '(default)/MilitApp/UserData');
        const userSnapshot = await getDocs(userCollection);
        const filteredUsers = userSnapshot.docs
          .map(doc => {
            const data = doc.data() as User;
            return {
              id: doc.id,
              zona: data.zona ?? '',
              nombre: data.nombre ?? '',
              rango: data.rango ?? '',
              profileImage: data.profileImage ?? '' // Usa imagen por defecto si está vacía
            };
          })
          .filter(user => user.zona === userData.zona); // Filtrar por zona
        setUsers(filteredUsers);
      } else {
        Alert.alert('Error', 'No se pudo obtener la zona del usuario.');
      }
    };

    fetchUserZoneAndUsers();
  }, []);

  const handleSelectUser = (user: User) => {
    if (selectedUsers.includes(user)) {
      setSelectedUsers(selectedUsers.filter(selected => selected.id !== user.id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const handleSaveList = async () => {
    if (!listName) {
      Alert.alert('Error', 'Por favor, introduce un nombre para la lista');
      return;
    }

    if (selectedUsers.length === 0) {
      Alert.alert('Error', 'Por favor, selecciona al menos un usuario');
      return;
    }

    const newList = {
      id: uuid.v4(),
      name: listName,
      creator: getAuth().currentUser?.email,
      users: selectedUsers.map(user => ({
        id: user.id,
        name: user.nombre,
        rank: user.rango,
        profileImage: user.profileImage,
      })),
    };

    await setDoc(doc(db, `Zone/${zone}/listas/${newList.id}`), newList);

    Alert.alert('Éxito', 'Lista guardada correctamente');
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Nombre de la Lista:</Text>
      <TextInput
        value={listName}
        onChangeText={setListName}
        placeholder="Nombre de la lista"
        style={styles.input}
      />
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.userItem,
              selectedUsers.includes(item) && styles.selectedUser,
            ]}
            onPress={() => handleSelectUser(item)}
          >
            <Image src={item.profileImage} style={styles.userImage} />
            <View>
              <Text style={styles.userName}>{item.nombre}</Text>
              <Text style={styles.userRank}>{item.rango}</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text>No hay usuarios disponibles</Text>}
      />
      <TouchableOpacity style={styles.saveButton} onPress={handleSaveList}>
        <Text style={styles.saveButtonText}>Guardar Lista</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    padding: 10,
    borderRadius: 10,
    marginBottom: 20,
  },
  userItem: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    marginVertical: 5,
  },
  selectedUser: {
    backgroundColor: '#cce5ff',
  },
  userImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  userName: {
    fontWeight: 'bold',
    color: '#000', // Nombre en negro
  },
  userRank: {
    color: '#555', // Rango en gris
  },
  saveButton: {
    backgroundColor: '#10302B',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default NewListScreen;
