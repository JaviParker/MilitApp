import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Button, Pressable, TouchableOpacity } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc, onSnapshot, setDoc, addDoc, collection } from 'firebase/firestore';
import { MaterialIcons } from '@expo/vector-icons';
import CardComponent from '@/components/CardComponent';
import { RootStackParamList } from './types';

interface Notification {
  message: string;
  timestamp: string;
  user: string;
}

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const auth = getAuth();
  const db = getFirestore();
  const [startTime, setStartTime] = useState<number | null>(null);
  const [isParent, setIsParent] = useState(true);
  const [loading, setLoading] = useState(true);
  const [initialStartTime, setInitialStartTime] = useState<number | null>(null);
  const [times, setTimes] = useState<{ Cabo: string; Sargento: string; Teniente: string } | null>(null);
  const [currentDay, setCurrentDay] = useState<string>('');
  const [raidDay, setRaidDay] = useState<string>('');
  const [isColonel, setIsColonel] = useState(false);
  const [zone, setZone] = useState<string | null>(null);
  const [team, setTeam] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [duration, setDuration] = useState<string | null>(null);
  const [distance, setDistance] = useState<string | null>(null);
  const [message, setMessage] = useState<string>(''); // Estado para manejar el mensaje
  const [notifications, setNotifications] = useState<Notification[]>([]); // Estado para manejar las notificaciones

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const userDocRef = doc(db, `(default)/MilitApp/UserData/${user.uid}`);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            setIsParent(userData.rango === 'Teniente' || userData?.rango === 'Coronel');
            setIsColonel(userData?.rango === 'Coronel');
            setUserName(userData.nombre);
            setZone(userData.zona);

            const dayNames = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
            setCurrentDay(dayNames[new Date().getDay()]);

            const dayNames2 = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
            setRaidDay(dayNames2[new Date().getDay()]);

            const timesDocRef = doc(db, `(default)/Zone/${userData.zona}/${currentDay}`);
            const timesDocSnap = await getDoc(timesDocRef);
            
            if (timesDocSnap.exists()) {
              setTimes(timesDocSnap.data() as { Cabo: string; Sargento: string; Teniente: string });
            } else {
              setTimes(null);
            }
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
          setInitialStartTime(startTimeValue);
          setStartTime(startTimeValue);
        }
      } catch (error) {
        console.error('Error fetching startTime:', error);
      }
    };

    const fetchRaidData = async () => {
      const docRef = doc(db, `Zone/51/Raids/${raidDay}`);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setTeam(data.lista);
        setDistance(data.kilometros);
        setDuration(data.tiempo);
      }
    };

    fetchUserData();
    fetchStartTime();
    fetchRaidData();

    const timerDocRef = doc(db, '(default)/MilitApp/TimerControl/startTime');
    const unsubscribe = onSnapshot(timerDocRef, (doc) => {
      const data = doc.data();
      if (data && data.startTime) {
        const newStartTime = data.startTime;
        if (newStartTime !== initialStartTime && newStartTime !== startTime) {
          setStartTime(newStartTime);
        }
      }
    });

    return () => unsubscribe();
  }, [auth, db, initialStartTime, startTime]);

  const handleStartPress = async () => {
    if (isParent) {
      const startTime = Date.now() + 5000; 
      await setDoc(doc(db, '(default)/MilitApp/TimerControl/startTime'), { startTime });
    }
  };

  function redirectTo() {
    navigation.navigate('Raids');
  }

  function timesEditRedirection() {
    navigation.navigate('TimeEdit');
  }

  const handleSecondaryPress = () => {
    navigation.navigate('Raids');
  };

  const redirectToListSelection = () => {
    navigation.navigate('ListSelection');
  };

  useEffect(() => {
    if (startTime !== initialStartTime && startTime !== null) {
      navigation.navigate('Timer');
    }
  }, [startTime, initialStartTime, navigation]);

  const handleSendMessage = async () => {
    if (message.trim()) {
      const user = auth.currentUser;
      const timestamp = new Date().toISOString();
      try {
        await addDoc(collection(db, 'Zone/51/Notifications'), {
          message,
          timestamp,
          user: user ? userName : 'Anónimo',
        });
        setMessage('');
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  };

  const renderNotificationItem = ({ item }: { item: Notification }) => (
    <View style={styles.notificationItem}>
      <Text style={styles.notificationUser}>{item.user}</Text>
      <Text style={styles.notificationMessage}>{item.message}</Text>
      <Text style={styles.notificationTimestamp}>{new Date(item.timestamp).toLocaleString()}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>ZONA {zone}</Text>
        <MaterialIcons 
          name="notifications" 
          size={24} 
          color="#10302B" 
          onPress={() => navigation.navigate('Notifications')} 
        />
      </View>
      <ScrollView>
        {times && isParent ? (
          <CardComponent
            title="Tiempo de comida"
            subtitle1={`${currentDay}`} 
            text1={`Cabos - ${times.Cabo}seg`}
            text2={`Sargentos - ${times.Sargento}seg`}
            text3={`Tenientes - ${times.Teniente}seg`}
            onPrimaryPress={redirectToListSelection}
            onSecondaryPress={timesEditRedirection}
            gradientColors={['#10302B', '#637B5D']}
            primaryAction="Iniciar"
            secondaryAction="Editar"
          />
        ) : (
          <Text></Text>
        )}
        <CardComponent
          title="Incursiones"
          subtitle1={`${raidDay}`}
          text1={`${team}`}
          text2={`${distance}`}
          text3={`${duration}`}
          onPrimaryPress={redirectTo}
          onSecondaryPress={() => navigation.navigate(isColonel ? 'RaidsConfig' : 'Raids')}
          gradientColors={['#9D2449','#BEA27F']}
          primaryAction="Iniciar"
          secondaryAction={isColonel ? 'Cambiar' : 'Reportar'}
        />
        {isColonel && (
          <View style={styles.messageContainer}>
            <Text style={styles.infoText}>Mensaje para zona {zone}</Text>
            <TextInput
              style={styles.textInput}
              value={message}
              onChangeText={setMessage}
              placeholder="Escribe tu mensaje aquí..."
              multiline
            />
            <TouchableOpacity style={styles.btnSend} onPress={handleSendMessage}>
              <Text style={styles.btnSendText}>Enviar</Text>
            </TouchableOpacity>
          </View>
        )}
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
    marginBottom: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10302B',
  },
  infoText: {
    fontSize: 20,
    marginBottom: 10,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  btnSend: {
    backgroundColor: '#10302B',
    padding: 10,
    borderRadius: 5,
  },
  btnSendText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  messageContainer: {
    marginTop: 20,
    padding: 10,
    borderRadius: 5,
    borderColor: '#9D2449',
    borderWidth: 2,
  },
  notificationItem: {
    marginBottom: 10,
  },
  notificationUser: {
    fontWeight: 'bold',
  },
  notificationMessage: {
    fontSize: 16,
  },
  notificationTimestamp: {
    fontSize: 12,
    color: '#777',
  },
  loadingText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default HomeScreen;
