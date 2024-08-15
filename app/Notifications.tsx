import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { getFirestore, collection, onSnapshot } from 'firebase/firestore';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from './types';
import { MaterialIcons } from '@expo/vector-icons';

interface Notification {
  id: string;
  message: string;
  timestamp: string;
  user: string;
}

const NotificationsScreen: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const db = getFirestore();

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'Zone/51/Notifications'), (snapshot) => {
      const notificationsList: Notification[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Notification[];
      setNotifications(notificationsList);
    });

    return () => unsubscribe();
  }, [db]);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {notifications.map((notification) => (
          <View key={notification.id} style={styles.notificationItem}>
            <Text style={styles.notificationUser}>{notification.user}</Text>
            <Text style={styles.notificationMessage}>{notification.message}</Text>
            <Text style={styles.notificationTimestamp}>
              {new Date(notification.timestamp).toLocaleString()}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
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
  scrollContainer: {
    paddingBottom: 20,
  },
  notificationItem: {
    marginBottom: 15,
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#F5F5F5',
    borderColor: '#10302B',
    borderWidth: 1,
  },
  notificationUser: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  notificationMessage: {
    fontSize: 16,
    marginVertical: 5,
  },
  notificationTimestamp: {
    fontSize: 12,
    color: '#777',
  },
});

export default NotificationsScreen;
