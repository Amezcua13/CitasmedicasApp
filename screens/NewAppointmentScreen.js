import React, { useState, useEffect } from "react";
import { View, StyleSheet, Alert, Pressable, Animated } from "react-native";
import { Text, TextInput } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { db, auth } from "../services/firebaseConfig";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { LinearGradient } from "expo-linear-gradient";
import { Picker } from "@react-native-picker/picker";

const NewAppointmentScreen = () => {
  const navigation = useNavigation();
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [doctor, setDoctor] = useState("");
  const [doctorsList, setDoctorsList] = useState([]);
  const [status, setStatus] = useState("pendiente");
  const scaleValue = new Animated.Value(1);
  const [saludo, setSaludo] = useState("");

  useEffect(() => {
    obtenerSaludo();
    cargarDoctoresDisponibles();
  }, []);

  const obtenerSaludo = () => {
    const hora = new Date().getHours();
    if (hora >= 5 && hora < 12) setSaludo("🌅 Buenos días,");
    else if (hora >= 12 && hora < 19) setSaludo("🌇 Buenas tardes,");
    else setSaludo("🌙 Buenas noches,");
  };

  const cargarDoctoresDisponibles = async () => {
    try {
      const q = query(collection(db, "users"), where("role", "==", "doctor"));
      const snapshot = await getDocs(q);
      const lista = snapshot.docs.map((doc) => ({
        label: doc.data().name,
        value: doc.data().name,
      }));
      setDoctorsList(lista);
    } catch (error) {
      console.error("Error cargando doctores:", error);
    }
  };

  const handleScheduleAppointment = async () => {
    if (!date || !time || !doctor) {
      Alert.alert("Error", "Todos los campos son obligatorios.");
      return;
    }

    try {
      await addDoc(collection(db, "appointments"), {
        userId: auth.currentUser.uid,
        patient: auth.currentUser.displayName || "Paciente",
        date,
        time,
        doctor,
        status,
      });

      Alert.alert("✅ Cita agendada", "Tu cita ha sido registrada correctamente.");
      navigation.navigate("Appointments");
    } catch (error) {
      Alert.alert("Error", "No se pudo agendar la cita.");
    }
  };

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <LinearGradient colors={["#0D47A1", "#1976D2"]} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.saludo}>{saludo}</Text>
        <Text style={styles.titulo}>Agendar Nueva Cita</Text>
      </View>

      <View style={styles.form}>
        <TextInput
          label="Fecha (DD/MM/AA)"
          mode="outlined"
          style={styles.input}
          value={date}
          onChangeText={setDate}
        />

        <TextInput
          label="Hora"
          mode="outlined"
          style={styles.input}
          value={time}
          onChangeText={setTime}
        />

        {/* Picker para seleccionar doctor */}
        <View style={styles.pickerContainer}>
          <Text style={styles.label}>Selecciona un Doctor</Text>
          <Picker
            selectedValue={doctor}
            onValueChange={(itemValue) => setDoctor(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Seleccione un doctor" value="" />
            {doctorsList.map((doc) => (
              <Picker.Item key={doc.value} label={doc.label} value={doc.value} />
            ))}
          </Picker>
        </View>

        {/* Picker para estado */}
        <Picker
            selectedValue={status}
            onValueChange={(itemValue) => setStatus(itemValue)}
            dropdownIconColor="#000"
            style={styles.picker}
          >
            <Picker.Item label="Pendiente" value="pendiente" color="#FFA000" />
            <Picker.Item label="Confirmada" value="confirmada" color="#1976D2" />
            <Picker.Item label="Finalizada" value="finalizada" color="#2E7D32" />
        </Picker>



        <Pressable
          onPress={handleScheduleAppointment}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={styles.scheduleButton}
        >
          <Text style={styles.scheduleButtonText}>📅 Agendar Cita</Text>
        </Pressable>

        <Pressable
          onPress={() => navigation.navigate("Appointments")}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={styles.cancelButton}
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
  pickerContainer: {
    marginBottom: 15,
  },
  label: {
    fontWeight: "bold",
    marginBottom: 5,
    fontSize: 16,
  },
  picker: {
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
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
