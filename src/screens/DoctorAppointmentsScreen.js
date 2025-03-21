import React, { useEffect, useState } from "react";
import { View, StyleSheet, FlatList, Pressable, Animated } from "react-native";
import { Text, Card, Avatar } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { auth, db } from "../services/firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import { LinearGradient } from "expo-linear-gradient";

const DoctorAppointmentsScreen = () => {
  const [appointments, setAppointments] = useState([]);
  const navigation = useNavigation();
  const scaleValue = new Animated.Value(1); //  Animación de presión

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!auth.currentUser) return;

      const q = query(collection(db, "appointments"), where("doctor", "==", auth.currentUser.displayName));
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

  // 📌 Animaciones de pulsación en botones
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
      {/* 🏥 Encabezado con avatar y título */}
      <View style={styles.header}>
        <Avatar.Icon size={60} icon="calendar-check" style={styles.avatar} />
        <Text style={styles.title}>Citas Asignadas</Text>
      </View>

      {/* 📅 Lista de citas */}
      {appointments.length > 0 ? (
        <FlatList
          data={appointments}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Card style={styles.card}>
              <Card.Title title={`Paciente: ${item.patient}`} left={(props) => <Avatar.Icon {...props} icon="account" />} />
              <Card.Content>
                <Text style={styles.appointmentText}>📅 Fecha: {item.date}</Text>
                <Text style={styles.appointmentText}>⏰ Hora: {item.time}</Text>
                <Text style={styles.appointmentText}>📍 Ubicación: {item.location || "No especificada"}</Text>
              </Card.Content>
              <Card.Actions>
                <Pressable
                  onPress={() => navigation.navigate("AppointmentDetails", { appointment: item })}
                  onPressIn={() => handlePressIn(scaleValue)}
                  onPressOut={() => handlePressOut(scaleValue)}
                  style={({ pressed }) => [styles.detailButton, { transform: [{ scale: pressed ? 0.95 : 1 }] }]}
                >
                  <Text style={styles.detailButtonText}>Ver Detalles</Text>
                </Pressable>
              </Card.Actions>
            </Card>
          )}
        />
      ) : (
        <Text style={styles.noAppointments}>No tienes citas asignadas.</Text>
      )}

      {/* ⬅️ Botón para regresar */}
      <Pressable
        onPress={() => navigation.goBack()}
        onPressIn={() => handlePressIn(scaleValue)}
        onPressOut={() => handlePressOut(scaleValue)}
        style={({ pressed }) => [styles.backButton, { transform: [{ scale: pressed ? 0.95 : 1 }] }]}
      >
        <Text style={styles.backButtonText}>Volver al Dashboard</Text>
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
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    elevation: 4,
  },
  appointmentText: {
    fontSize: 16,
  },
  noAppointments: {
    textAlign: "center",
    color: "#FFF",
    fontSize: 16,
    marginBottom: 10,
  },
  detailButton: {
    backgroundColor: "#1E88E5",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
    alignSelf: "center",
  },
  detailButtonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
  },
  backButton: {
    backgroundColor: "#D32F2F",
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

export default DoctorAppointmentsScreen;
