import React, { useState, useEffect } from "react";
import { View, StyleSheet, Alert, Pressable, Animated } from "react-native";
import { Text, TextInput } from "react-native-paper";
import { useNavigation, useRoute } from "@react-navigation/native";
import { db } from "../services/firebaseConfig";
import { doc, updateDoc } from "firebase/firestore";
import { LinearGradient } from "expo-linear-gradient";
import { Picker } from "@react-native-picker/picker";

const EditAppointmentScreen = () => {
  const route = useRoute();
  const { appointment } = route.params;
  const navigation = useNavigation();

  const [date, setDate] = useState(appointment.date);
  const [time, setTime] = useState(appointment.time);
  const [doctor, setDoctor] = useState(appointment.doctor);
  const [status, setStatus] = useState(appointment.status);
  const [saludo, setSaludo] = useState("");
  const scaleValue = new Animated.Value(1);

  useEffect(() => {
    const hora = new Date().getHours();
    if (hora >= 5 && hora < 12) setSaludo("🌅 Buenos días,");
    else if (hora >= 12 && hora < 19) setSaludo("🌇 Buenas tardes,");
    else setSaludo("🌙 Buenas noches,");
  }, []);

  const handleSaveChanges = async () => {
    if (!date || !time || !doctor || !status) {
      Alert.alert("Error", "Todos los campos son obligatorios.");
      return;
    }

    try {
      await updateDoc(doc(db, "appointments", appointment.id), {
        date,
        time,
        doctor,
        status,
      });

      Alert.alert("✅ Éxito", "La cita ha sido actualizada.");
      navigation.navigate("Appointments");
    } catch (error) {
      Alert.alert("Error", "No se pudo actualizar la cita.");
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

  const getStatusColor = (value) => {
    switch (value.toLowerCase()) {
      case "finalizada":
        return "#2E7D32"; // Verde
      case "pendiente":
        return "#FFA000"; // Ámbar
      case "confirmada":
        return "#1976D2"; // Azul
      default:
        return "#000";
    }
  };

  return (
    <LinearGradient colors={["#0D47A1", "#1976D2"]} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.saludo}>{saludo}</Text>
        <Text style={styles.titulo}>Editar Cita</Text>
      </View>

      <View style={styles.form}>
        <TextInput
          label="Fecha"
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
        <TextInput
          label="Doctor"
          mode="outlined"
          style={styles.input}
          value={doctor}
          onChangeText={setDoctor}
        />

        <View style={styles.pickerWrapper}>
          <Text style={styles.label}>Estado</Text>
          <View style={styles.picker}>
          <Picker
          selectedValue={status}
          onValueChange={(itemValue) => setStatus(itemValue)}
          enabled={appointment.status !== "finalizada"}
          dropdownIconColor="#000"
        >
          <Picker.Item label="Pendiente" value="pendiente" color="#FFA000" />
          <Picker.Item label="Confirmada" value="confirmada" color="#1976D2" />
          <Picker.Item label="Finalizada" value="finalizada" color="#2E7D32" />
        </Picker>

          </View>
          <Text style={[styles.estadoColor, { color: getStatusColor(status) }]}>
            Estado actual: {status}
          </Text>
        </View>

        <Pressable
          onPress={handleSaveChanges}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={styles.saveButton}
        >
          <Text style={styles.saveButtonText}>💾 Guardar Cambios</Text>
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
  pickerWrapper: {
    marginBottom: 10,
  },
  label: {
    marginBottom: 4,
    fontWeight: "bold",
    color: "#333",
  },
  picker: {
    borderWidth: 1,
    borderColor: "#CCC",
    borderRadius: 5,
    overflow: "hidden",
  },
  estadoColor: {
    marginTop: 5,
    fontWeight: "bold",
  },
  saveButton: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 10,
  },
  saveButtonText: {
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

export default EditAppointmentScreen;
