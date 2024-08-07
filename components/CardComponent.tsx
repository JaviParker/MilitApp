// CardComponent.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface CardProps {
  title: string;
  subtitle1: string;
  text1: string;
  text2: string;
  text3: string;
  onPrimaryPress: () => void;
  onSecondaryPress: () => void;
  gradientColors: string[];
  primaryAction: string;
  secondaryAction: string;
}

const CardComponent: React.FC<CardProps> = ({ title, subtitle1, text1, text2, text3, onPrimaryPress, onSecondaryPress, gradientColors, primaryAction, secondaryAction }) => {
  return (
    <LinearGradient 
      colors={gradientColors} 
      style={styles.card}
      start={{ x: 0, y: 0 }} 
      end={{ x: 1, y: 1 }}
    >
      <Text style={styles.title}>{title}</Text>
      <View style={styles.content}>
        <View style={styles.textContainer}>
          <Text style={styles.subtitle}>{subtitle1}</Text>
          <Text style={styles.text}>{text1}</Text>
          <Text style={styles.text}>{text2}</Text>
          <Text style={styles.text}>{text3}</Text>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.primaryButton} onPress={onPrimaryPress}>
            <Text style={styles.primaryButtonText}>{primaryAction}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={onSecondaryPress}>
            <Text style={styles.secondaryButtonText}>{secondaryAction}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
    height: 200,
    width: '99%',
    maxHeight: 400,
    alignSelf: 'center'
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  textContainer: {
    flex: 1,
    marginTop: 10,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  text: {
    fontSize: 14,
    color: 'white',
  },
  buttonContainer: {
    justifyContent: 'space-between',
  },
  primaryButton: {
    backgroundColor: 'white',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  primaryButtonText: {
    color: '#10302B',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    width: 90,
  },
  secondaryButton: {
    borderColor: 'white',
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  secondaryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    width: 90,
  },
});

export default CardComponent;
