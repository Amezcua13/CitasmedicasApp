import React, { useState, useEffect } from "react";
import { View, StyleSheet, Alert, Pressable, Animated } from "react-native";
import { Text, TextInput, Button } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { db, auth } from "../services/firebaseConfig";
import { collection, addDoc } from "firebase/firestore";
import { LinearGradient } from "expo-linear-gradient"; 

const NewAppointmentScreen = () => {
  const navigation = useNavigation();
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [doctor, setDoctor] = useState("");
  const [loading, setLoading] = useState(false);
  const scaleValue = new Animated.Value(1); 
  const [saludo, setSaludo] = useState("");

  useEffect(() => {
    obtenerSaludo();
  }, []);

  // Obtener saludo dinámico según la hora del día
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

  // Agendar nueva cita en Firestore
  const handleScheduleAppointment = async () => {
    if (!date || !time || !doctor) {
      Alert.alert("Error", "Todos los campos son obligatorios.");
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, "appointments"), {
        userId: auth.currentUser.uid,
        date,
        time,
        doctor,
        status: "pendiente",
      });

      Alert.alert("Éxito", "Tu cita ha sido agendada correctamente.");
      navigation.navigate("Appointments");
    } catch (error) {
      Alert.alert("Error", "No se pudo agendar la cita.");
    } finally {
      setLoading(false);
    }
  };

  // 📌 Animación de presión en botones
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
        <Text style={styles.titulo}>Agendar Nueva Cita</Text>
      </View>

      {/* 📆 Formulario de nueva cita */}
      <View style={styles.form}>
        <TextInput label="Fecha (DD/MM/AA)" mode="outlined" style={styles.input} value={date} onChangeText={setDate} />
        <TextInput label="Hora" mode="outlined" style={styles.input} value={time} onChangeText={setTime} />
        <TextInput label="Doctor" mode="outlined" style={styles.input} value={doctor} onChangeText={setDoctor} />

        {/* ✅ Botón Agendar Cita */}
        <Pressable
          onPress={handleScheduleAppointment}
          onPressIn={() => handlePressIn(scaleValue)}
          onPressOut={() => handlePressOut(scaleValue)}
          style={({ pressed }) => [styles.scheduleButton, { transform: [{ scale: pressed ? 0.95 : 1 }] }]}
        >
          <Text style={styles.scheduleButtonText}>📅 Agendar Cita</Text>
        </Pressable>

        {/* ❌ Botón Cancelar */}
        <Pressable
          onPress={() => navigation.navigate("Appointments")}
          onPressIn={() => handlePressIn(scaleValue)}
          onPressOut={() => handlePressOut(scaleValue)}
          style={({ pressed }) => [styles.cancelButton, { transform: [{ scale: pressed ? 0.95 : 1 }] }]}
        >
          <Text style={styles.cancelButtonText}>❌ Cancelar</Text>
        </Pressable>
      </View>
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
  form: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    elevation: 5,
  },
  input: {
    marginBottom: 10,
    backgroundColor: "#FFF",
  },
  scheduleButton: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 10,
  },
  scheduleButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: "#D32F2F",
    padding: 15,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 10,
  },
  cancelButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default NewAppointmentScreen;
