import React, { useEffect, useState } from "react";
import { View, StyleSheet, Pressable, Animated } from "react-native";
import { Text, Card, Avatar } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { auth, db } from "../services/firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import { LinearGradient } from "expo-linear-gradient";

const PatientHistoryScreen = () => {
  const [appointments, setAppointments] = useState([]);
  const navigation = useNavigation();
  const scaleValue = new Animated.Value(1); 

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!auth.currentUser) return;

      const q = query(collection(db, "appointments"), where("userId", "==", auth.currentUser.uid));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const fetchedAppointments = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAppointments(fetchedAppointments);
      }
    };

    fetchAppointments();
  }, []);

  //  Animaciones de pulsación en botones
  const handlePressIn = (scaleValue) => {
    Animated.spring(scaleValue, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = (scaleValue) => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <LinearGradient colors={["#0D47A1", "#1976D2"]} style={styles.container}>
      {/* 📋 Encabezado */}
      <View style={styles.header}>
        <Avatar.Icon size={60} icon="history" style={styles.avatar} />
        <Text style={styles.title}>Historial de Citas</Text>
      </View>

      {/* 📅 Lista de Citas Pasadas */}
      {appointments.length > 0 ? (
        appointments.map((appointment) => (
          <Card key={appointment.id} style={styles.card}>
            <Card.Title title={`Dr. ${appointment.doctor}`} left={(props) => <Avatar.Icon {...props} icon="stethoscope" />} />
            <Card.Content>
              <Text style={styles.detailText}>📅 Fecha: {appointment.date}</Text>
              <Text style={styles.detailText}>⏰ Hora: {appointment.time}</Text>
              <Text style={styles.detailText}>📌 Estado: <Text style={styles.status}>{appointment.status}</Text></Text>
            </Card.Content>
          </Card>
        ))
      ) : (
        <Text style={styles.noAppointments}>No tienes citas registradas en el historial.</Text>
      )}

      {/* ⬅️ Botón para regresar */}
      <Pressable
        onPress={() => navigation.goBack()}
        onPressIn={() => handlePressIn(scaleValue)}
        onPressOut={() => handlePressOut(scaleValue)}
        style={({ pressed }) => [styles.backButton, { transform: [{ scale: pressed ? 0.95 : 1 }] }]}
      >
        <Text style={styles.backButtonText}>Volver</Text>
      </Pressable>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 50,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  avatar: {
    backgroundColor: "#FFA500",
    marginRight: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFF",
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    elevation: 4,
  },
  detailText: {
    fontSize: 16,
  },
  status: {
    fontWeight: "bold",
    color: "#1565C0",
  },
  noAppointments: {
    textAlign: "center",
    color: "#FFF",
    fontSize: 16,
    marginBottom: 10,
  },
  backButton: {
    backgroundColor: "#757575",
    paddingVertical: 12,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 10,
  },
  backButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default PatientHistoryScreen;
