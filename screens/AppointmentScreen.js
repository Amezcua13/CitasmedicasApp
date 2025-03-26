import React, { useEffect, useState } from "react";
import { View, StyleSheet, FlatList, Alert, Pressable, Animated } from "react-native";
import { Text, Card, Avatar } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { auth, db } from "../services/firebaseConfig";
import { collection, query, where, getDocs, deleteDoc, doc } from "firebase/firestore";
import { LinearGradient } from "expo-linear-gradient";

const AppointmentScreen = () => {
  const [appointments, setAppointments] = useState([]);
  const [saludo, setSaludo] = useState("");
  const navigation = useNavigation();
  const scaleValue = new Animated.Value(1);

  useEffect(() => {
    obtenerSaludo();
    cargarCitas();
  }, []);

  const obtenerSaludo = () => {
    const hora = new Date().getHours();
    let mensaje = "🌙 Buenas noches,";
    if (hora >= 5 && hora < 12) mensaje = "🌅 Buenos días,";
    else if (hora >= 12 && hora < 19) mensaje = "🌇 Buenas tardes,";
    setSaludo(mensaje);
  };

  const cargarCitas = async () => {
    if (!auth.currentUser) return;
    const q = query(collection(db, "appointments"), where("userId", "==", auth.currentUser.uid));
    const querySnapshot = await getDocs(q);
    const citas = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setAppointments(citas);
  };

  const eliminarCita = async (id) => {
    Alert.alert("Eliminar Cita", "¿Seguro que deseas eliminar esta cita?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          await deleteDoc(doc(db, "appointments", id));
          cargarCitas();
        },
      },
    ]);
  };

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
      <View style={styles.header}>
        <Avatar.Icon size={70} icon="calendar" style={styles.avatar} />
        <View>
          <Text style={styles.saludo}>{saludo}</Text>
          <Text style={styles.titulo}>Tus Citas Médicas</Text>
        </View>
      </View>

      {appointments.length > 0 ? (
        <FlatList
          data={appointments}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Card style={styles.card}>
              <Card.Title
                title={`Dr. ${item.doctor}`}
                subtitle={`📅 ${item.date} | ⏰ ${item.time}`}
                left={(props) => <Avatar.Icon {...props} icon="stethoscope" />}
              />
              <Card.Content>
                <Text style={styles.estado}>
                  Estado:{" "}
                  <Text style={{ color: item.status === "finalizada" ? "green" : "#1976D2" }}>
                    {item.status}
                  </Text>
                </Text>
              </Card.Content>
              <Card.Actions>
                <Pressable
                  onPress={() => navigation.navigate("EditAppointment", { appointment: item })}
                  onPressIn={() => handlePressIn(scaleValue)}
                  onPressOut={() => handlePressOut(scaleValue)}
                  style={({ pressed }) => [styles.editButton, { transform: [{ scale: pressed ? 0.95 : 1 }] }]}
                >
                  <Text style={styles.editButtonText}>✏️ Editar</Text>
                </Pressable>

                <Pressable
                  onPress={() => eliminarCita(item.id)}
                  onPressIn={() => handlePressIn(scaleValue)}
                  onPressOut={() => handlePressOut(scaleValue)}
                  style={({ pressed }) => [styles.deleteButton, { transform: [{ scale: pressed ? 0.95 : 1 }] }]}
                >
                  <Text style={styles.deleteButtonText}>🗑️ Eliminar</Text>
                </Pressable>
              </Card.Actions>
            </Card>
          )}
        />
      ) : (
        <Text style={styles.noAppointments}>No tienes citas programadas.</Text>
      )}

      <Pressable
        onPress={() => navigation.navigate("NewAppointment")}
        onPressIn={() => handlePressIn(scaleValue)}
        onPressOut={() => handlePressOut(scaleValue)}
        style={({ pressed }) => [
          styles.newAppointmentButton,
          { transform: [{ scale: pressed ? 0.95 : 1 }] },
        ]}
      >
        <Text style={styles.newAppointmentButtonText}>➕ Agendar Cita</Text>
      </Pressable>

      <Pressable
        onPress={() => navigation.navigate("Home")}
        onPressIn={() => handlePressIn(scaleValue)}
        onPressOut={() => handlePressOut(scaleValue)}
        style={({ pressed }) => [
          styles.backButton,
          { transform: [{ scale: pressed ? 0.95 : 1 }] },
        ]}
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
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  avatar: {
    backgroundColor: "#1E88E5",
    marginRight: 10,
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
    borderRadius: 10,
    marginBottom: 15,
    padding: 10,
    elevation: 4,
  },
  estado: {
    fontSize: 16,
    fontWeight: "bold",
  },
  editButton: {
    backgroundColor: "#FFA500",
    padding: 10,
    borderRadius: 10,
    marginRight: 5,
  },
  editButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  deleteButton: {
    backgroundColor: "red",
    padding: 10,
    borderRadius: 10,
  },
  deleteButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  noAppointments: {
    textAlign: "center",
    color: "#FFFFFF",
    fontSize: 16,
  },
  newAppointmentButton: {
    backgroundColor: "#FFA500",
    padding: 15,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 20,
  },
  newAppointmentButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  backButton: {
    backgroundColor: "#FFFFFF",
    padding: 12,
    borderRadius: 30,
    marginTop: 10,
  },
  backButtonText: {
    color: "#1976D2",
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default AppointmentScreen;
