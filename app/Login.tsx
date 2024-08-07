import React, { useState, useEffect } from 'react';
import { View, TextInput, Text, StyleSheet, Image, TouchableOpacity, Platform, Pressable } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { auth } from '@/constants/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { RootStackParamList } from './types';

if (Platform.OS === 'web') {
  WebBrowser.maybeCompleteAuthSession();
}

const LoginScreen = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: 'TU_CLIENT_ID_DE_GOOGLE',
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token);
      signInWithCredential(auth, credential)
        .then((userCredential) => {
          console.log('User signed in with Google:', userCredential.user);
          navigation.reset({
            index: 0,
            routes: [{ name: 'Home' }],
          });
        })
        .catch((error) => {
          console.error('Error signing in with Google:', error);
        });
    }
  }, [response]);

  const handleLogin = () => {
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        console.log('User logged in:', userCredential.user);
        navigation.reset({
          index: 0,
          routes: [{ name: 'Home' }],
        });
      })
      .catch((error) => {
        console.error('Error logging in:', error);
      });
  };

  const handleRegister = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Register' }],
    });
    // createUserWithEmailAndPassword(auth, email, password)
    //   .then((userCredential) => {
    //     console.log('User registered:', userCredential.user);
    //     navigation.reset({
    //       index: 0,
    //       routes: [{ name: 'Register' }],
    //     });
    //   })
    //   .catch((error) => {
    //     console.error('Error registering:', error);
    //   });
  };

  const handleGoogleLogin = () => {
    if (Platform.OS !== 'web') {
      promptAsync();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>MilitApp</Text>
      </View>
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
      <Pressable style={styles.primaryButton} onPress={handleLogin}>
        <Text style={styles.primaryButtonText}>Iniciar Sesión</Text>
      </Pressable>
      <Pressable style={styles.secondaryButton} onPress={handleRegister}>
        <Text style={styles.secondaryButtonText}>Registrarse</Text>
      </Pressable>
      <Pressable style={styles.primaryButton} onPress={handleGoogleLogin} disabled={!request}>
        <Text style={styles.primaryButtonText}>Iniciar con Google</Text>
      </Pressable>
      {/* {Platform.OS !== 'web' && (
        <Pressable style={styles.primaryButton} onPress={handleGoogleLogin} disabled={!request}>
          <Text style={styles.primaryButtonText}>Iniciar con Google</Text>
        </Pressable>
      )} */}
      <Image source={{ uri: '' }} style={styles.bottomImage} />
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
    marginBottom: 120,
    marginTop: -150,
    alignItems: 'center',
  },
  headerText: {
    fontSize: 50,
    fontWeight: 'bold',
    color: '#10302B',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  input: {
    height: 40,
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderBottomColor: '#10302B',
    maxWidth: 400,
    width: 350,
  },
  primaryButton: {
    backgroundColor: '#10302B',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginBottom: 10,
    borderColor: '#637B5D',
    borderWidth: 2,
    marginTop: 50,
    maxWidth: 400,
    width: 300,
  },
  primaryButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginBottom: 10,
    borderColor: '#10302B',
    borderWidth: 2,
    maxWidth: 400,
    width: 300,
  },
  secondaryButtonText: {
    color: '#10302B',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  bottomImage: {
    width: 120,
    height: 20,
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
});

export default LoginScreen;
