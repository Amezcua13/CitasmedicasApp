import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';

export default function EditarCitaScreen({ route, navigation }) {
  const { cita } = route.params;
  const [nombre, setNombre] = useState(cita.nombre);
  const [fecha, setFecha] = useState(cita.fecha);
  const [hora, setHora] = useState(cita.hora);

  const actualizarCita = async () => {
    try {
      const citaRef = doc(db, 'citas', cita.id);
      await updateDoc(citaRef, { nombre, fecha, hora });
  
      Alert.alert('Cita Actualizada', 'Los cambios se han guardado correctamente.');
      navigation.goBack(); // Regresa a la pantalla anterior
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar la cita.');
      console.error("🔥 Error actualizando cita:", error);
    }
  };
  

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Editar Cita</Text>

      <Text style={styles.label}>Nombre del Paciente:</Text>
      <TextInput style={styles.input} value={nombre} onChangeText={setNombre} />

      <Text style={styles.label}>Fecha:</Text>
      <TextInput style={styles.input} value={fecha} onChangeText={setFecha} />

      <Text style={styles.label}>Hora:</Text>
      <TextInput style={styles.input} value={hora} onChangeText={setHora} />

      <Button title="Guardar Cambios" onPress={actualizarCita} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  label: { fontSize: 18, marginBottom: 5 },
  input: { height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 15, paddingHorizontal: 10, borderRadius: 5 },
});
