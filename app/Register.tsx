import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Picker } from '@react-native-picker/picker';
import { RootStackParamList } from './types';
import { v4 as uuidv4 } from 'uuid';

const RegisterScreen: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [rank, setRank] = useState<string>('Cabo');
  const [zone, setZone] = useState<string>('');
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const auth = getAuth();
  const db = getFirestore();
  const storage = getStorage();

  const handleImagePick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const uploadImageAsync = async (uri: string) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    const fileRef = ref(storage, `profile_images/${uuidv4()}`);
    await uploadBytes(fileRef, blob);
    return await getDownloadURL(fileRef);
  };

  const handleRegister = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      let profileImageUrl = '';
      if (profileImage) {
        profileImageUrl = await uploadImageAsync(profileImage);
      }

      await setDoc(doc(db, `MilitApp/UserData/${user.uid}`), {
        name,
        email,
        rank,
        zone,
        profileImage: profileImageUrl,
      });

      Alert.alert('Success', 'User registered successfully!');
      navigation.navigate('Home');
    } catch (error) {
      console.error('Error registering user:', error);
      Alert.alert('Error', 'Failed to register user. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>MilitApp</Text>
      </View>
      <TouchableOpacity style={styles.imageContainer} onPress={handleImagePick}>
        {profileImage ? (
          <Image source={{ uri: profileImage }} style={styles.image} />
        ) : (
          <Text style={styles.imagePlaceholderText}>Add Photo</Text>
        )}
      </TouchableOpacity>
      <TextInput
        placeholder="Name"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
      />
      <Picker
        selectedValue={rank}
        onValueChange={(itemValue) => setRank(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="Cabo" value="Cabo" />
        <Picker.Item label="Sargento" value="Sargento" />
        <Picker.Item label="Teniente" value="Teniente" />
      </Picker>
      <TextInput
        placeholder="Zone"
        value={zone}
        onChangeText={setZone}
        style={styles.input}
      />
      <TouchableOpacity style={styles.primaryButton} onPress={handleRegister}>
        <Text style={styles.primaryButtonText}>Register</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  header: {
    marginBottom: 20,
    alignItems: 'center',
  },
  headerText: {
    fontSize: 50,
    fontWeight: 'bold',
    color: '#10302B',
  },
  imageContainer: {
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
    height: 100,
    width: 100,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: '#10302B',
    overflow: 'hidden',
  },
  image: {
    height: '100%',
    width: '100%',
  },
  imagePlaceholderText: {
    color: '#10302B',
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderBottomColor: '#10302B',
    maxWidth: 400,  
    width: 400,
  },
  picker: {
    height: 40,
    width: 400,
    marginBottom: 10,
  },
  primaryButton: {
    backgroundColor: '#10302B',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginBottom: 10,
    borderColor: '#637B5D',
    borderWidth: 2,
    maxWidth: 400,
    width: 300,
  },
  primaryButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default RegisterScreen;
