import React, { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView, Alert, Pressable, Animated } from "react-native";
import { Text, Avatar, Card } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { auth, db } from "../services/firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { LinearGradient } from "expo-linear-gradient"; 

const DoctorDashboardScreen = () => {
  const [appointments, setAppointments] = useState([]);
  const navigation = useNavigation();
  const scaleValue = new Animated.Value(1); 

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!auth.currentUser) return;
      
      const q = query(collection(db, "appointments"), where("doctorId", "==", auth.currentUser.uid));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const fetchedAppointments = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAppointments(fetchedAppointments);
      }
    };

    fetchAppointments();
  }, []);

  const handleLogout = () => {
    Alert.alert("Cerrar Sesión", "¿Seguro que quieres salir?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Salir",
        style: "destructive",
        onPress: async () => {
          await signOut(auth);
          navigation.replace("Login");
        },
      },
    ]);
  };

  const handlePressIn = (scale) => {
    Animated.spring(scale, { toValue: 0.95, useNativeDriver: true }).start();
  };

  const handlePressOut = (scale) => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();
  };

  return (
    <LinearGradient colors={["#1565C0", "#1E88E5"]} style={styles.container}>
      {/* 🏥 Encabezado con Avatar */}
      <View style={styles.header}>
        <Avatar.Icon size={70} icon="clipboard-text" style={styles.avatar} />
        <View>
          <Text style={styles.title}>Panel de Doctor</Text>
          <Text style={styles.subtitle}>Citas programadas</Text>
        </View>
      </View>

      {/* 📋 Lista de Citas */}
      <ScrollView style={styles.scroll}>
        {appointments.length > 0 ? (
          appointments.map((appointment) => (
            <Card key={appointment.id} style={styles.card}>
              <Card.Title title={`Paciente: ${appointment.patientName}`} left={(props) => <Avatar.Icon {...props} icon="account" />} />
              <Card.Content>
                <Text style={styles.appointmentText}>📅 {appointment.date}</Text>
                <Text style={styles.appointmentText}>⏰ {appointment.time}</Text>
                <Text style={styles.appointmentText}>🏥 {appointment.location}</Text>
              </Card.Content>
              <Card.Actions>
                <Pressable
                  onPress={() => navigation.navigate("AppointmentDetails", { appointment })}
                  onPressIn={() => handlePressIn(scaleValue)}
                  onPressOut={() => handlePressOut(scaleValue)}
                  style={({ pressed }) => [styles.viewButton, { transform: [{ scale: pressed ? 0.95 : 1 }] }]}
                >
                  <Text style={styles.viewButtonText}>Ver Detalles</Text>
                </Pressable>
              </Card.Actions>
            </Card>
          ))
        ) : (
          <Text style={styles.noAppointments}>No hay citas programadas.</Text>
        )}
      </ScrollView>

      {/* 🔴 Botón de Cerrar Sesión */}
      <Pressable
        onPress={handleLogout}
        onPressIn={() => handlePressIn(scaleValue)}
        onPressOut={() => handlePressOut(scaleValue)}
        style={({ pressed }) => [styles.logoutButton, { transform: [{ scale: pressed ? 0.95 : 1 }] }]}
      >
        <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
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
    marginBottom: 20,
  },
  avatar: {
    backgroundColor: "#FFA500",
    marginRight: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFF",
  },
  subtitle: {
    fontSize: 16,
    color: "#FFF",
  },
  scroll: {
    flex: 1,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 10,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    elevation: 4,
  },
  appointmentText: {
    fontSize: 16,
    color: "#333",
  },
  noAppointments: {
    textAlign: "center",
    fontSize: 18,
    color: "#FFF",
    marginVertical: 20,
  },
  viewButton: {
    backgroundColor: "#1E88E5",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    width: "100%",
  },
  viewButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  logoutButton: {
    backgroundColor: "red",
    padding: 12,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 10,
  },
  logoutButtonText: {
    color: "#FFF",
    fontSize: 16,
    textAlign: "center",
  },
});

export default DoctorDashboardScreen;
