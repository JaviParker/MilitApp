import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc, onSnapshot, setDoc } from 'firebase/firestore';
import { MaterialIcons } from '@expo/vector-icons';
import CardComponent from '@/components/CardComponent';
import { RootStackParamList } from './types';

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const auth = getAuth();
  const db = getFirestore();
  const [startTime, setStartTime] = useState<number | null>(null);
  const [isParent, setIsParent] = useState(true);
  const [loading, setLoading] = useState(true);
  const [initialStartTime, setInitialStartTime] = useState<number | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const userDocRef = doc(db, `(default)/MilitApp/UserData/${user.uid}`);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            setIsParent(userData.rango === 'Teniente');
          } else {
            console.log('No such document!');
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchStartTime = async () => {
      try {
        const timerDocRef = doc(db, '(default)/MilitApp/TimerControl/startTime');
        const timerDocSnap = await getDoc(timerDocRef);
        if (timerDocSnap.exists()) {
          const timerData = timerDocSnap.data();
          const startTimeValue = timerData.startTime;
          setInitialStartTime(startTimeValue); // Guardar el valor inicial
          setStartTime(startTimeValue); // Actualizar el estado startTime
        } else {
          console.log('No such document!');
        }
      } catch (error) {
        console.error('Error fetching startTime:', error);
      }
    };

    fetchUserData();
    fetchStartTime();

    const timerDocRef = doc(db, '(default)/MilitApp/TimerControl/startTime');
    const unsubscribe = onSnapshot(timerDocRef, (doc) => {
      const data = doc.data();
      if (data && data.startTime) {
        const newStartTime = data.startTime;
        if (newStartTime !== initialStartTime && newStartTime !== startTime) { // Comparar con el valor inicial y el estado actual
          setStartTime(newStartTime);
        }
      }
    });

    return () => unsubscribe();
  }, [auth, db, initialStartTime, startTime]);

  const handleStartPress = async () => {
    if (isParent) {
      const startTime = Date.now() + 5000; // Ejemplo: 5 segundos de retraso
      await setDoc(doc(db, '(default)/MilitApp/TimerControl/startTime'), { startTime });
    }
  };

  function redirectTo(){
    navigation.navigate('Raids');
  };

  const handleSecondaryPress = () => {
    navigation.navigate('Raids');
  };

  useEffect(() => {
    if (startTime !== initialStartTime && startTime !== null) {
      navigation.navigate('Timer');
    }
  }, [startTime, initialStartTime, navigation]);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  function handlePrimaryPress(): void {
    throw new Error('Function not implemented.');
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>ZONA 51</Text>
        <MaterialIcons 
          name="notifications" 
          size={24} 
          color="#10302B" 
          onPress={() => alert('Notificaciones')} 
        />
      </View>
      <ScrollView>
        <CardComponent
          title="Tiempo de comida"
          subtitle1="Lunes"
          text1="Cabos - 60seg"
          text2="Sargentos - 60seg"
          text3="Tenientes - 120seg"
          onPrimaryPress={handleStartPress} // Utiliza handleStartPress para el botón de iniciar
          onSecondaryPress={handleSecondaryPress}
          gradientColors={['#10302B', '#637B5D']}
          primaryAction="Iniciar"
          secondaryAction="Editar"
        />
        <CardComponent
          title="Incursiones"
          subtitle1="Lunes"
          text1="Expiracion"
          text2="17/Junio/2024"
          text3="15 KM"
          onPrimaryPress={redirectTo}
          onSecondaryPress={handleSecondaryPress}
          gradientColors={['#9D2449','#BEA27F']}
          primaryAction="Iniciar"
          secondaryAction="Reportar"
        />
        {/* <CardComponent
          title="Listas"
          subtitle1="Lunes"
          text1="Texto 1"
          text2="Texto 2"
          text3="Texto 3"
          onPrimaryPress={handlePrimaryPress}
          onSecondaryPress={handleSecondaryPress}
          gradientColors={['#BEA27F', '#705C44']}
          primaryAction="Ver listas"
          secondaryAction="Iniciar"
        /> */}
      </ScrollView>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  headerText: {
    fontSize: 24,
    color: '#10302B',
    fontWeight: 'bold'
  },
  loadingText: {
    fontSize: 20,
  },
});

export default HomeScreen;
function redirectTo(page: any, any: any) {
  throw new Error('Function not implemented.');
}

