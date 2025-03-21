import React, { useEffect, useState } from "react";
import { View, StyleSheet, FlatList, Pressable, Animated } from "react-native";
import { Text, Card, Avatar } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { auth, db } from "../services/firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import { LinearGradient } from "expo-linear-gradient"; 

const HistoryScreen = () => {
  const [appointments, setAppointments] = useState([]);
  const navigation = useNavigation();
  const scaleValue = new Animated.Value(1); 
  const [saludo, setSaludo] = useState("");

  useEffect(() => {
    obtenerSaludo();
    fetchPastAppointments();
  }, []);

  //  Obtener saludo dinámico según la hora del día
  const obtenerSaludo = () => {
    const horaActual = new Date().getHours();
    let nuevoSaludo = "";
    if (horaActual >= 5 && horaActual < 12) {
      nuevoSaludo = "🌅 Buenos días,";
    } else if (horaActual >= 12 && horaActual < 19) {
      nuevoSaludo = "🌇 Buenas tardes,";
    } else {
      nuevoSaludo = "🌙 Buenas noches,";
    }
    setSaludo(nuevoSaludo);
  };

  //  Obtener citas pasadas de Firestore
  const fetchPastAppointments = async () => {
    if (!auth.currentUser) return;

    const q = query(collection(db, "appointments"), where("userId", "==", auth.currentUser.uid));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const appointmentsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Filtrar citas pasadas (simulación)
      const pastAppointments = appointmentsData.filter((appointment) => {
        const today = new Date();
        const appointmentDate = new Date(appointment.date.split("/").reverse().join("/")); // Convierte DD/MM/AA a Date
        return appointmentDate < today;
      });

      setAppointments(pastAppointments);
    }
  };

  //  Animación de presión en botones
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
      {/* 👋 Encabezado con saludo dinámico */}
      <View style={styles.header}>
        <Text style={styles.saludo}>{saludo}</Text>
        <Text style={styles.titulo}>Historial de Citas</Text>
      </View>

      {/* 📜 Lista de citas pasadas */}
      {appointments.length > 0 ? (
        <FlatList
          data={appointments}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Card style={styles.card}>
              <Card.Title title="Cita Anterior" left={(props) => <Avatar.Icon {...props} icon="history" />} />
              <Card.Content>
                <Text style={styles.appointmentText}>🩺 Dr. {item.doctor}</Text>
                <Text style={styles.appointmentText}>📅 {item.date}</Text>
                <Text style={styles.appointmentText}>⏰ {item.time}</Text>
                <Text style={styles.statusText}>📌 Estado: {item.status}</Text>
              </Card.Content>
            </Card>
          )}
        />
      ) : (
        <Text style={styles.noAppointments}>No tienes citas anteriores.</Text>
      )}

      {/* ⬅️ Botón Volver */}
      <Pressable
        onPress={() => navigation.navigate("Home")}
        onPressIn={() => handlePressIn(scaleValue)}
        onPressOut={() => handlePressOut(scaleValue)}
        style={({ pressed }) => [styles.backButton, { transform: [{ scale: pressed ? 0.95 : 1 }] }]}
      >
        <Text style={styles.backButtonText}>⬅️ Volver al Inicio</Text>
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
    alignItems: "center",
    marginBottom: 20,
  },
  saludo: {
    fontSize: 20,
    color: "#FFFFFF",
  },
  titulo: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    elevation: 5,
  },
  appointmentText: {
    fontSize: 16,
  },
  statusText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1976D2",
    marginTop: 5,
  },
  noAppointments: {
    textAlign: "center",
    color: "#FFFFFF",
    fontSize: 16,
    marginBottom: 10,
  },
  backButton: {
    backgroundColor: "#FFA500",
    padding: 15,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 10,
  },
  backButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default HistoryScreen;
