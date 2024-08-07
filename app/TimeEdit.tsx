import React, { useState } from 'react';
import { ScrollView, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, Card } from 'react-native-paper';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/constants/firebase';

type Day = 'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes' | 'Sábado' | 'Domingo';
type Rank = 'Cabo' | 'Sargento' | 'Teniente';

const daysOfWeek: Day[] = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

const TimeEditScreen = () => {
  const [times, setTimes] = useState<Record<Day, Record<Rank, string>>>({
    Lunes: { Cabo: '', Sargento: '', Teniente: '' },
    Martes: { Cabo: '', Sargento: '', Teniente: '' },
    Miércoles: { Cabo: '', Sargento: '', Teniente: '' },
    Jueves: { Cabo: '', Sargento: '', Teniente: '' },
    Viernes: { Cabo: '', Sargento: '', Teniente: '' },
    Sábado: { Cabo: '', Sargento: '', Teniente: '' },
    Domingo: { Cabo: '', Sargento: '', Teniente: '' },
  });

  const handleInputChange = (day: Day, rank: Rank, value: string) => {
    setTimes({
      ...times,
      [day]: {
        ...times[day],
        [rank]: value,
      },
    });
  };

  const handleSave = async () => {
    try {
      const zone = '51'; // Puedes modificar esto según la zona que necesites
      for (const day of daysOfWeek) {
        const dayLowercase = day.toLowerCase(); // Convertir el día a minúsculas
        const dayRef = doc(db, `(default)/Zone/${zone}/${dayLowercase}`);
        await setDoc(dayRef, times[day]);
      }
      Alert.alert('Success', 'Times saved successfully');
    } catch (error) {
      console.error('Error saving times: ', error);
      Alert.alert('Error', 'There was an error saving the times');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {daysOfWeek.map((day) => (
        <Card key={day} style={styles.card}>
          <Card.Title title={day} />
          <Card.Content>
            <TextInput
              label="Cabo"
              value={times[day].Cabo}
              keyboardType="numeric"
              onChangeText={(text) => handleInputChange(day, 'Cabo', text)}
              style={styles.input}
            />
            <TextInput
              label="Sargento"
              value={times[day].Sargento}
              keyboardType="numeric"
              onChangeText={(text) => handleInputChange(day, 'Sargento', text)}
              style={styles.input}
            />
            <TextInput
              label="Teniente"
              value={times[day].Teniente}
              keyboardType="numeric"
              onChangeText={(text) => handleInputChange(day, 'Teniente', text)}
              style={styles.input}
            />
          </Card.Content>
        </Card>
      ))}
      <Button mode="contained" onPress={handleSave} style={styles.saveButton}>
        Guardar
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
  },
  card: {
    marginBottom: 20,
  },
  input: {
    marginBottom: 10,
  },
  saveButton: {
    marginTop: 20,
  },
});

export default TimeEditScreen;
