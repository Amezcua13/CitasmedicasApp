import React, { useState, useEffect } from "react";
import { View, StyleSheet, Alert, Pressable, Animated } from "react-native";
import { Text, Avatar, TextInput } from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import { auth, db } from "../services/firebaseConfig";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { updateProfile } from "firebase/auth";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";

const storage = getStorage();

const DoctorProfileScreen = () => {
  const [user, setUser] = useState(null);
  const [displayName, setDisplayName] = useState("");
  const [photoURL, setPhotoURL] = useState(null);
  const [specialty, setSpecialty] = useState("");
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const scaleValue = new Animated.Value(1);

  useEffect(() => {
    const fetchDoctorData = async () => {
      if (auth.currentUser) {
        setUser(auth.currentUser);
        setDisplayName(auth.currentUser.displayName || "Doctor");
        setPhotoURL(auth.currentUser.photoURL);

        const doctorDoc = await getDoc(doc(db, "doctors", auth.currentUser.uid));
        if (doctorDoc.exists()) {
          setDisplayName(doctorDoc.data().name || "Doctor");
          setSpecialty(doctorDoc.data().specialty || "Sin especialidad"); // 📌 Obtener especialidad
        }
      }
    };

    fetchDoctorData();
  }, []);

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

      const storageRef = ref(storage, `doctorProfilePictures/${auth.currentUser.uid}`);
      await uploadBytes(storageRef, blob);

      const downloadURL = await getDownloadURL(storageRef);
      setPhotoURL(downloadURL);

      await updateProfile(auth.currentUser, { photoURL: downloadURL });
      await updateDoc(doc(db, "doctors", auth.currentUser.uid), { photoURL: downloadURL });

      Alert.alert("Perfil Actualizado", "Tu foto de perfil ha sido actualizada.");
    } catch (error) {
      Alert.alert("Error", "No se pudo subir la imagen.");
    } finally {
      setLoading(false);
    }
  };

  // 📌 Actualizar nombre en Firebase
  const handleUpdateProfile = async () => {
    if (!displayName) {
      Alert.alert("Error", "El nombre no puede estar vacío.");
      return;
    }

    setLoading(true);
    try {
      await updateProfile(auth.currentUser, { displayName });
      await updateDoc(doc(db, "doctors", auth.currentUser.uid), { name: displayName });

      Alert.alert("Perfil Actualizado", "Tu información ha sido actualizada correctamente.");
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  // 📌 Cerrar Sesión
  const handleLogout = () => {
    Alert.alert("Cerrar Sesión", "¿Seguro que quieres salir?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Salir",
        style: "destructive",
        onPress: async () => {
          await auth.signOut();
          navigation.replace("Login");
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
      {/* 📸 Avatar con opción de cambiar */}
      <Pressable onPress={handlePickImage}>
        <Avatar.Image
          size={100}
          source={{ uri: photoURL || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png" }}
          style={styles.avatar}
        />
      </Pressable>
      <Text style={styles.email}>{user?.email}</Text>
      <Text style={styles.specialty}>🏥 Especialidad: {specialty}</Text>

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
        <Text style={styles.buttonText}>{loading ? "Guardando..." : "Guardar Cambios"}</Text>
      </Pressable>

      {/* 🔴 Botón de Cerrar Sesión */}
      <Pressable
        onPress={handleLogout}
        onPressIn={() => handlePressIn(scaleValue)}
        onPressOut={() => handlePressOut(scaleValue)}
        style={({ pressed }) => [styles.logoutButton, { transform: [{ scale: pressed ? 0.95 : 1 }] }]}
      >
        <Text style={styles.buttonText}>Cerrar Sesión</Text>
      </Pressable>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 50,
    alignItems: "center",
  },
  avatar: {
    backgroundColor: "#1E88E5",
    marginBottom: 20,
  },
  email: {
    fontSize: 18,
    color: "#FFF",
    marginBottom: 5,
  },
  specialty: {
    fontSize: 16,
    color: "#FFF",
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    marginBottom: 15,
    backgroundColor: "#FFF",
  },
  button: {
    backgroundColor: "#FFA500",
    padding: 15,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 10,
    width: "100%",
  },
  logoutButton: {
    backgroundColor: "red",
    padding: 15,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 10,
    width: "100%",
  },
  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default DoctorProfileScreen;
