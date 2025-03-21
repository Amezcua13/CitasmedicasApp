import React, { useState, useEffect } from "react";
import { View, StyleSheet, Pressable, Animated } from "react-native";
import { Text, TextInput, Button, Avatar } from "react-native-paper";
import { auth } from "../services/firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import { LinearGradient } from "expo-linear-gradient"; 
import { useNavigation } from "@react-navigation/native";

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [saludo, setSaludo] = useState(""); //  Estado para saludo dinámico
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

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Por favor, completa todos los campos.");
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigation.replace("Home"); // Redirigir al Home después del login
    } catch (error) {
      alert("Error: " + error.message);
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
      {/* 👨‍⚕️ Icono de Doctor y Saludo */}
      <Avatar.Icon size={100} icon="doctor" style={styles.icon} color="#FFF" />
      <Text style={styles.saludo}>{saludo}</Text>
      <Text style={styles.appName}>Bienvenido a HealtSystem</Text>

      {/* 📝 Inputs */}
      <TextInput
        label="Correo electrónico"
        mode="outlined"
        style={styles.input}
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        label="Contraseña"
        mode="outlined"
        style={styles.input}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {/* 🎯 Botón de Login */}
      <Pressable
        onPress={handleLogin}
        onPressIn={() => handlePressIn(scaleValue)}
        onPressOut={() => handlePressOut(scaleValue)}
        style={({ pressed }) => [
          styles.loginButton,
          { transform: [{ scale: pressed ? 0.95 : 1 }] },
        ]}
      >
        <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
      </Pressable>

      {/* 🔗 Enlace de Registro */}
      <Text style={styles.registerText} onPress={() => navigation.navigate("Register")}>
        ¿No tienes cuenta? <Text style={styles.link}>Regístrate</Text>
      </Text>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  icon: {
    backgroundColor: "#FFA500",
    marginBottom: 15,
  },
  saludo: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  appName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFA500",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    marginBottom: 10,
    backgroundColor: "#FFF",
  },
  loginButton: {
    width: "100%",
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    elevation: 5,
    alignItems: "center",
    marginTop: 10,
  },
  loginButtonText: {
    color: "#1976D2",
    fontWeight: "bold",
    fontSize: 16,
  },
  registerText: {
    marginTop: 10,
    color: "#FFFFFF",
  },
  link: {
    fontWeight: "bold",
    color: "#FFA500",
  },
});

export default LoginScreen;
