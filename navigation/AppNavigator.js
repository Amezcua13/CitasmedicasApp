import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { onAuthStateChanged, getAuth } from 'firebase/auth';

import CitasScreen from '../screens/CitasScreen';
import NuevaCitaScreen from '../screens/NuevaCitaScreen';
import EditarCitaScreen from '../screens/EditarCitaScreen';
import LoginScreen from '../screens/LoginScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
  const auth = getAuth();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {user ? (
          <>
            <Stack.Screen name="Citas" component={CitasScreen} />
            <Stack.Screen name="NuevaCita" component={NuevaCitaScreen} />
            <Stack.Screen name="EditarCita" component={EditarCitaScreen} />
          </>
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
