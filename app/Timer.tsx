import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { Audio } from 'expo-av';
import { RootStackParamList } from './types';

const Timer: React.FC = () => {
  const [countdown, setCountdown] = useState<number>(60);
  const [loading, setLoading] = useState<boolean>(true);
  const [isParent, setIsParent] = useState<boolean>(false);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const auth = getAuth();
  const db = getFirestore();
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [rango, setRango] = useState<string>('');

  const handleBackPress = () => {
    navigation.navigate('Home');
  };

  const handleStartPress = async () => {
    if (isParent) {
      const startTime = Date.now() + 15000; // Ejemplo: 15 segundos de retraso
      await setDoc(doc(db, '(default)/MilitApp/TimerControl/startTime'), { startTime });
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const userDocRef = doc(db, `(default)/MilitApp/UserData/${user.uid}`);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            const userRango = userData.rango;
            setRango(userRango);
            setIsParent(userRango === 'Teniente');

            const zone = userData.zona; // Asumiendo que el campo de zona está en userData

            // Obtener el día actual en minúsculas
            const dayNames = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
            const currentDay = dayNames[new Date().getDay()];

            const timesDocRef = doc(db, `(default)/Zone/${zone}/${currentDay}`);
            const timesDocSnap = await getDoc(timesDocRef);

            if (timesDocSnap.exists()) {
              const timesData = timesDocSnap.data();
              if (timesData) {
                switch (userRango) {
                  case 'Cabo':
                    setCountdown(parseInt(timesData.Cabo, 10) || 60);
                    break;
                  case 'Sargento':
                    setCountdown(parseInt(timesData.Sargento, 10) || 60);
                    break;
                  case 'Teniente':
                    setCountdown(parseInt(timesData.Teniente, 10) || 120);
                    break;
                  default:
                    setCountdown(60);
                }
              }
            } else {
              console.log('No hay datos disponibles para el tiempo de comida');
              setCountdown(60);
            }
          } else {
            console.log('No such document in user data!');
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [auth, db]);

  useEffect(() => {
    const timerDocRef = doc(db, '(default)/MilitApp/TimerControl/startTime');
    const unsubscribe = onSnapshot(timerDocRef, (doc) => {
      const data = doc.data();
      if (data && data.startTime) {
        if (!isParent) {
          navigation.navigate('Timer');
        }
      }
    });

    return () => unsubscribe();
  }, [db, navigation, isParent]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      playSound();
    }
  }, [countdown]);

  const playSound = async () => {
    const { sound } = await Audio.Sound.createAsync(
      require('../assets/alarm2.mp3')
    );
    setSound(sound);
    await sound.playAsync();
  };

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={countdown === 0 ? ['#F23535', '#9D2449'] : ['#FFFFFF', '#FFFFFF']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={[styles.headerText, countdown === 0 && styles.headerTextDanger]}>Zona 51</Text>
        <MaterialIcons 
          name="notifications" 
          size={24} 
          color={countdown === 0 ? 'white' : '#10302B'} 
          onPress={() => alert('Notificaciones')} 
        />
      </View>
      <View style={styles.circleContainer}>
        <View style={[styles.dottedCircle, countdown === 0 && styles.dottedCircleDanger]}>
          <Text style={[styles.countdownText, countdown === 0 && styles.countdownTextDanger]}>{countdown}</Text>
        </View>
      </View>
      <Text style={[styles.infoText, countdown === 0 && styles.infoTextDanger]}>
        {countdown === 0 ? 'Deje de comer' : 'Siga comiendo' }
      </Text>
      <TouchableOpacity style={[styles.invisible, countdown === 0 && styles.backButton]} onPress={handleBackPress}>
        <Text style={styles.backButtonText}>Volver</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 24,
    color: '#10302B',
    fontWeight: 'bold',
  },
  headerTextDanger: {
    color: 'white',
  },
  circleContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  dottedCircle: {
    width: 320,
    height: 320,
    borderRadius: 160,
    borderWidth: 10,
    borderColor: '#10302B',
    borderStyle: 'dotted',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dottedCircleDanger: {
    borderColor: 'white',
  },
  countdownText: {
    fontSize: 90,
    color: '#10302B',
    fontWeight: 'bold',
  },
  countdownTextDanger: {
    color: 'white',
  },
  infoText: {
    fontSize: 30,
    color: '#10302B',
    marginTop: 20,
  },
  infoTextDanger: {
    color: 'white',
  },
  startButton: {
    backgroundColor: '#10302B',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginBottom: 10,
    marginTop: 50,
  },
  startButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    width: 150,
  },
  backButton: {
    backgroundColor: 'white',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginBottom: 10,
    display: "flex",
    marginTop: 50,
  },
  backButtonText: {
    color: '#10302B',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    width: 90,
  },
  invisible: {
    display: "none",
  },
  visible: {
    display: "flex",
  },
  loadingText: {
    fontSize: 20,
    color: '#10302B',
  },
});

export default Timer;
