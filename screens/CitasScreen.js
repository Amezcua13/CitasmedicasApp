import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { collection, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import { Card, Button, Text, FAB } from 'react-native-paper';

export default function CitasScreen({ navigation }) {
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true); //  Inicia la carga
  
    const user = auth.currentUser;
    if (!user) {
      setLoading(false);
      return;
    }
  
    const citasRef = collection(db, 'citas');
    const q = query(citasRef, where('userId', '==', user.uid));
  
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const citasArray = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCitas(citasArray);
      setLoading(false); //  Se detiene la carga cuando se obtienen las citas
    });
  
    return () => unsubscribe();
  }, []);
  

  const eliminarCita = async (id) => {
    try {
      await deleteDoc(doc(db, 'citas', id));
    } catch (error) {
      console.error("Error eliminando cita:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Citas Médicas</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#6200ee" />
      ) : citas.length === 0 ? (
        <Text style={styles.noCitas}>No hay citas registradas.</Text>
      ) : (
        citas.map((item) => (
          <Card key={item.id} style={styles.card}>
            <Card.Title title={item.nombre} subtitle={`${item.fecha} - ${item.hora}`} />
            <Card.Actions>
              <Button onPress={() => navigation.navigate('EditarCita', { cita: item })}>Editar</Button>
              <Button onPress={() => eliminarCita(item.id)} color="red">Eliminar</Button>
            </Card.Actions>
          </Card>
        ))
      )}

      <FAB
        style={styles.fab}
        icon="plus"
        label="Nueva Cita"
        onPress={() => navigation.navigate('NuevaCita')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  noCitas: { fontSize: 18, textAlign: 'center', marginTop: 20, color: 'gray' },
  card: { marginBottom: 10, backgroundColor: '#fff' },
  fab: { position: 'absolute', margin: 20, right: 0, bottom: 0, backgroundColor: '#6200ee' },
});
