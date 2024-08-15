// App.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './Login';
import Timer from './Timer';
import TimeEditScreen from './TimeEdit';
import HomeScreen from './Home';
import RegisterScreen from './Register';
import ListSelectionScreen from './ListSelection';
import NewListScreen from './NewList';
import { RootStackParamList } from './types';
import RaidsScreen from './Raids';
import RaidsConfig from './RaidsConfig';

const Stack = createStackNavigator<RootStackParamList>();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Timer" component={Timer} options={{ headerShown: false }} />
        <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
        <Stack.Screen name="TimeEdit" component={TimeEditScreen} options={{ headerShown: false }} />
        <Stack.Screen name="ListSelection" component={ListSelectionScreen} options={{ headerShown: false }} />
        <Stack.Screen name="NewList" component={NewListScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Raids" component={RaidsScreen} options={{ headerShown: false }} />
        <Stack.Screen name="RaidsConfig" component={RaidsConfig} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
