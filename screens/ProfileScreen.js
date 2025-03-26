import React, { useState, useEffect } from "react";
import { View, StyleSheet, Alert, TouchableOpacity, Pressable, Animated } from "react-native";
import { Text, Avatar, TextInput, Button } from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import { auth, db } from "../services/firebaseConfig";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { updateProfile, sendPasswordResetEmail } from "firebase/auth";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { LinearGradient } from "expo-linear-gradient"; 

const storage = getStorage();

const ProfileScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [displayName, setDisplayName] = useState("");
  const [photoURL, setPhotoURL] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saludo, setSaludo] = useState("");
  const scaleValue = new Animated.Value(1); 
  useEffect(() => {
    obtenerSaludo();
    cargarUsuario();
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

  //  Cargar datos del usuario
  const cargarUsuario = async () => {
    if (auth.currentUser) {
      setUser(auth.currentUser);
      setDisplayName(auth.currentUser.displayName || "Usuario");
      setPhotoURL(auth.currentUser.photoURL);

      const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
      if (userDoc.exists()) {
        setDisplayName(userDoc.data().name || "Usuario");
      }
    }
  };

  //  Seleccionar imagen de la galería
  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      uploadImage(result.assets[0].uri);
    }
  };

  //  Subir imagen a Firebase Storage
  const uploadImage = async (uri) => {
    setLoading(true);
    try {
      const response = await fetch(uri);
      const blob = await response.blob();

      const storageRef = ref(storage, `profilePictures/${auth.currentUser.uid}`);
      await uploadBytes(storageRef, blob);

      const downloadURL = await getDownloadURL(storageRef);
      setPhotoURL(downloadURL);

      await updateProfile(auth.currentUser, { photoURL: downloadURL });
      await updateDoc(doc(db, "users", auth.currentUser.uid), { photoURL: downloadURL });

      Alert.alert("Perfil Actualizado", "Tu foto de perfil ha sido actualizada.");
    } catch (error) {
      Alert.alert("Error", "No se pudo subir la imagen.");
    } finally {
      setLoading(false);
    }
  };

  //  Actualizar nombre del usuario
  const handleUpdateProfile = async () => {
    if (!displayName) {
      Alert.alert("Error", "El nombre no puede estar vacío.");
      return;
    }

    setLoading(true);
    try {
      await updateProfile(auth.currentUser, { displayName });
      await updateDoc(doc(db, "users", auth.currentUser.uid), { name: displayName });

      Alert.alert("Perfil Actualizado", "Tu nombre ha sido actualizado correctamente.");
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  //  Restablecer contraseña
  const handleResetPassword = () => {
    if (!user?.email) return;
    sendPasswordResetEmail(auth, user.email)
      .then(() => {
        Alert.alert("Correo Enviado", "Revisa tu bandeja de entrada para restablecer tu contraseña.");
      })
      .catch((error) => {
        Alert.alert("Error", error.message);
      });
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
      {/* 🏥 Encabezado con saludo y avatar */}
      <View style={styles.header}>
        <Text style={styles.saludo}>{saludo}</Text>
        <Text style={styles.titulo}>Mi Perfil</Text>
      </View>

      {/* 📸 Avatar con opción de cambiar */}
      <TouchableOpacity onPress={handlePickImage}>
        <Avatar.Image
          size={100}
          source={{ uri: photoURL || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png" }}
          style={styles.avatar}
        />
      </TouchableOpacity>
      <Text style={styles.email}>{user?.email}</Text>

      {/* 🖊 Editar Nombre */}
      <TextInput
        label="Nombre"
        mode="outlined"
        style={styles.input}
        value={displayName}
        onChangeText={setDisplayName}
      />

      {/* 🔄 Botón para guardar cambios */}
      <Pressable
        onPress={handleUpdateProfile}
        onPressIn={() => handlePressIn(scaleValue)}
        onPressOut={() => handlePressOut(scaleValue)}
        style={({ pressed }) => [styles.button, { transform: [{ scale: pressed ? 0.95 : 1 }] }]}
      >
        <Text style={styles.buttonText}>Guardar Cambios</Text>
      </Pressable>

      {/* 🔑 Botón para cambiar contraseña */}
      <Pressable
        onPress={handleResetPassword}
        onPressIn={() => handlePressIn(scaleValue)}
        onPressOut={() => handlePressOut(scaleValue)}
        style={({ pressed }) => [styles.passwordButton, { transform: [{ scale: pressed ? 0.95 : 1 }] }]}
      >
        <Text style={styles.buttonText}>Cambiar Contraseña</Text>
      </Pressable>

      {/* ⬅️ Botón para regresar */}
      <Pressable
        onPress={() => navigation.navigate("Home")}
        onPressIn={() => handlePressIn(scaleValue)}
        onPressOut={() => handlePressOut(scaleValue)}
        style={({ pressed }) => [styles.backButton, { transform: [{ scale: pressed ? 0.95 : 1 }] }]}
      >
        <Text style={styles.buttonText}>Volver al Inicio</Text>
      </Pressable>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 50 },
  header: { alignItems: "center", marginBottom: 20 },
  saludo: { fontSize: 20, color: "#FFF" },
  titulo: { fontSize: 24, fontWeight: "bold", color: "#FFF" },
  avatar: { backgroundColor: "#1976D2", marginBottom: 20 },
  email: { fontSize: 18, color: "#FFF", marginBottom: 10 },
  input: { width: "100%", marginBottom: 15, backgroundColor: "#FFF" },
  button: { backgroundColor: "#FFA500", padding: 15, borderRadius: 30, alignItems: "center" },
  passwordButton: { backgroundColor: "#FF3D00", padding: 15, borderRadius: 30, alignItems: "center" },
  backButton: { backgroundColor: "#00897B", padding: 15, borderRadius: 30, alignItems: "center" },
  buttonText: { color: "#FFF", fontSize: 16, fontWeight: "bold" },
});

export default ProfileScreen;
