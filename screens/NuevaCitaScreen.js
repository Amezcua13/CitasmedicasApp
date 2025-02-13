import React, { useState } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { TextInput, Button, Card } from 'react-native-paper';
import { collection, addDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../services/firebaseConfig';

export default function NuevaCitaScreen({ navigation }) {
  const auth = getAuth();
  const [nombre, setNombre] = useState('');
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [loading, setLoading] = useState(false);

  const agendarCita = async () => {
    if (!nombre || !fecha || !hora) {
      Alert.alert('Error', 'Todos los campos son obligatorios');
      return;
    }
  
    setLoading(true);
  
    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert('Error', 'Debes iniciar sesión para agendar una cita.');
        setLoading(false);
        return;
      }
  
      const nuevaCita = {
        nombre,
        fecha,
        hora,
        userId: user.uid,
        createdAt: new Date(),
      };
  
      await addDoc(collection(db, 'citas'), nuevaCita);
  
      Alert.alert('Cita Agendada', `Cita para ${nombre} el ${fecha} a las ${hora}`);
  
      setLoading(false); // 🔥 Se detiene la animación de carga
      
      navigation.goBack(); // 🔥 Regresa automáticamente a la pantalla de citas
  
    } catch (error) {
      console.error("🔥 Error al agendar cita:", error);
      Alert.alert('Error', 'No se pudo guardar la cita.');
      setLoading(false);
    }
  };
  
  

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Title title="Nueva Cita" />
        <Card.Content>
          <TextInput label="Nombre del Paciente" value={nombre} onChangeText={setNombre} style={styles.input} />
          <TextInput label="Fecha (YYYY-MM-DD)" value={fecha} onChangeText={setFecha} style={styles.input} />
          <TextInput label="Hora (HH:MM AM/PM)" value={hora} onChangeText={setHora} style={styles.input} />

          {loading ? (
            <ActivityIndicator size="large" color="#6200ee" style={styles.loading} />
          ) : (
            <Button mode="contained" onPress={agendarCita} style={styles.button}>Agendar</Button>
          )}
        </Card.Content>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5', justifyContent: 'center' },
  card: { padding: 20 },
  input: { marginBottom: 10 },
  button: { marginTop: 10, backgroundColor: '#6200ee' },
  loading: { marginTop: 10 }
});
