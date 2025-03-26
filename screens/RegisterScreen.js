import React, { useState, useEffect } from "react";
import { View, StyleSheet, Alert, Pressable, Animated } from "react-native";
import { Text, TextInput, Avatar, RadioButton } from "react-native-paper";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "../services/firebaseConfig";
import { doc, setDoc } from "firebase/firestore";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";

const RegisterScreen = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("patient"); //  Paciente por defecto
  const [loading, setLoading] = useState(false);
  const [saludo, setSaludo] = useState("");
  const navigation = useNavigation();
  const scaleValue = new Animated.Value(1);

  useEffect(() => {
    obtenerSaludo();
  }, []);

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

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert("Error", "Todos los campos son obligatorios.");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });

      await setDoc(doc(db, "users", userCredential.user.uid), {
        name,
        email,
        role,
        createdAt: new Date(),
      });

      Alert.alert("Registro Exitoso", "Tu cuenta ha sido creada correctamente.");
      navigation.replace("Home");
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
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
        <Avatar.Icon size={80} icon="account-plus" style={styles.avatar} color="#FFF" />
        <Text style={styles.saludo}>{saludo}</Text>
        <Text style={styles.titulo}>Regístrate en HealtSystem</Text>
      </View>

      {/* 📝 Formulario de Registro */}
      <TextInput label="Nombre Completo" mode="outlined" style={styles.input} value={name} onChangeText={setName} />
      <TextInput label="Correo Electrónico" mode="outlined" style={styles.input} keyboardType="email-address" value={email} onChangeText={setEmail} />
      <TextInput label="Contraseña" mode="outlined" style={styles.input} secureTextEntry value={password} onChangeText={setPassword} />
      <TextInput label="Confirmar Contraseña" mode="outlined" style={styles.input} secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword} />

      {/*  Selección de Rol */}
      <Text style={styles.roleTitle}>Selecciona tu Rol:</Text>
      <View style={styles.radioGroup}>
        <RadioButton
          value="patient"
          status={role === "patient" ? "checked" : "unchecked"}
          onPress={() => setRole("patient")}
          color="#FFA500"
        />
        <Text style={styles.radioLabel}>Paciente</Text>
        <RadioButton
          value="doctor"
          status={role === "doctor" ? "checked" : "unchecked"}
          onPress={() => setRole("doctor")}
          color="#FFA500"
        />
        <Text style={styles.radioLabel}>Médico</Text>
      </View>

      {/* 🔄 Botón de Registro */}
      <Pressable
        onPress={handleRegister}
        onPressIn={() => handlePressIn(scaleValue)}
        onPressOut={() => handlePressOut(scaleValue)}
        style={({ pressed }) => [styles.button, { transform: [{ scale: pressed ? 0.95 : 1 }] }]}
      >
        <Text style={styles.buttonText}>{loading ? "Registrando..." : "Crear Cuenta"}</Text>
      </Pressable>

      {/* ⬅️ Botón para regresar al Login */}
      <Pressable
        onPress={() => navigation.navigate("Login")}
        onPressIn={() => handlePressIn(scaleValue)}
        onPressOut={() => handlePressOut(scaleValue)}
        style={({ pressed }) => [styles.backButton, { transform: [{ scale: pressed ? 0.95 : 1 }] }]}
      >
        <Text style={styles.buttonText}>Volver al Login</Text>
      </Pressable>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 50,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  saludo: {
    fontSize: 20,
    color: "#FFF",
  },
  titulo: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFF",
    textAlign: "center",
  },
  avatar: {
    backgroundColor: "#FFA500",
    marginBottom: 10,
  },
  input: {
    width: "100%",
    marginBottom: 15,
    backgroundColor: "#FFF",
  },
  roleTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFF",
    marginTop: 10,
  },
  radioGroup: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  radioLabel: {
    fontSize: 16,
    color: "#FFF",
    marginRight: 20,
  },
  button: {
    backgroundColor: "#FFA500",
    padding: 15,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 10,
  },
  backButton: {
    backgroundColor: "#00897B",
    padding: 15,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default RegisterScreen;
