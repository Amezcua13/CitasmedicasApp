import React, { useEffect, useState } from "react";
import { View, StyleSheet, Alert, Pressable, Animated } from "react-native";
import { Text, Card, Avatar, Menu, Divider } from "react-native-paper";
import { useNavigation, useRoute } from "@react-navigation/native";
import { db } from "../services/firebaseConfig";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { LinearGradient } from "expo-linear-gradient";

const AppointmentDetailsScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { appointment } = route.params;
  const scaleValue = new Animated.Value(1); 

  const [status, setStatus] = useState(appointment.status);
  const [menuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    setStatus(appointment.status); // Actualiza el estado con el dato actual de la cita
  }, [appointment]);

  //  Función para actualizar el estado de la cita en Firestore
  const handleUpdateStatus = async (newStatus) => {
    setStatus(newStatus);
    setMenuVisible(false);

    try {
      await updateDoc(doc(db, "appointments", appointment.id), { status: newStatus });
      Alert.alert("Cita Actualizada", `El estado ha cambiado a: ${newStatus}`);
    } catch (error) {
      Alert.alert("Error", "No se pudo actualizar el estado de la cita.");
    }
  };

  // 📌 Función para cancelar la cita
  const handleCancelAppointment = async () => {
    Alert.alert("Cancelar Cita", "¿Seguro que deseas cancelar esta cita?", [
      { text: "No", style: "cancel" },
      {
        text: "Sí, cancelar",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteDoc(doc(db, "appointments", appointment.id));
            Alert.alert("Cita Cancelada", "La cita ha sido eliminada correctamente.");
            navigation.goBack();
          } catch (error) {
            Alert.alert("Error", "No se pudo cancelar la cita.");
          }
        },
      },
    ]);
  };

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
      {/* 📋 Encabezado */}
      <View style={styles.header}>
        <Avatar.Icon size={60} icon="calendar" style={styles.avatar} />
        <Text style={styles.title}>Detalles de la Cita</Text>
      </View>

      {/* 🏥 Información de la cita */}
      <Card style={styles.card}>
        <Card.Title title={`Paciente: ${appointment.patient}`} left={(props) => <Avatar.Icon {...props} icon="account" />} />
        <Card.Content>
          <Text style={styles.detailText}>📅 Fecha: {appointment.date}</Text>
          <Text style={styles.detailText}>⏰ Hora: {appointment.time}</Text>
          <Text style={styles.detailText}>👨‍⚕️ Doctor: {appointment.doctor}</Text>
          <Text style={styles.detailText}>📍 Ubicación: {appointment.location || "No especificada"}</Text>
          <Text style={styles.detailText}>📌 Estado: <Text style={styles.status}>{status}</Text></Text>
        </Card.Content>
      </Card>

      {/* 📌 Menú para actualizar el estado */}
      <Menu
        visible={menuVisible}
        onDismiss={() => setMenuVisible(false)}
        anchor={
          <Pressable
            onPress={() => setMenuVisible(true)}
            onPressIn={() => handlePressIn(scaleValue)}
            onPressOut={() => handlePressOut(scaleValue)}
            style={({ pressed }) => [styles.statusButton, { transform: [{ scale: pressed ? 0.95 : 1 }] }]}
          >
            <Text style={styles.statusButtonText}>Actualizar Estado</Text>
          </Pressable>
        }
      >
        <Menu.Item onPress={() => handleUpdateStatus("Pendiente")} title="Pendiente" />
        <Divider />
        <Menu.Item onPress={() => handleUpdateStatus("Confirmada")} title="Confirmada" />
        <Divider />
        <Menu.Item onPress={() => handleUpdateStatus("Completada")} title="Completada" />
      </Menu>

      {/* 🔴 Botón para cancelar cita */}
      <Pressable
        onPress={handleCancelAppointment}
        onPressIn={() => handlePressIn(scaleValue)}
        onPressOut={() => handlePressOut(scaleValue)}
        style={({ pressed }) => [styles.cancelButton, { transform: [{ scale: pressed ? 0.95 : 1 }] }]}
      >
        <Text style={styles.cancelButtonText}>Cancelar Cita</Text>
      </Pressable>

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
  statusButton: {
    backgroundColor: "#1E88E5",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
    alignSelf: "center",
    marginTop: 15,
  },
  statusButtonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
  },
  cancelButton: {
    backgroundColor: "#D32F2F",
    paddingVertical: 12,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 10,
  },
  cancelButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
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

export default AppointmentDetailsScreen;
