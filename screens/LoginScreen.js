import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

export default function LoginScreen({ navigation }) {
  const auth = getAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);

  const handleAuth = async () => {
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      navigation.replace('Citas'); // Ir a la pantalla de citas después del login
    } catch (error) {
      console.error("🔥 Error en autenticación:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{isLogin ? "Iniciar Sesión" : "Registrarse"}</Text>

      <TextInput label="Correo Electrónico" value={email} onChangeText={setEmail} style={styles.input} />
      <TextInput label="Contraseña" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />

      <Button mode="contained" onPress={handleAuth} style={styles.button}>
        {isLogin ? "Iniciar Sesión" : "Registrarse"}
      </Button>

      <Button onPress={() => setIsLogin(!isLogin)} style={styles.switch}>
        {isLogin ? "¿No tienes cuenta? Regístrate" : "¿Ya tienes cuenta? Inicia sesión"}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  input: { marginBottom: 10 },
  button: { marginTop: 10, backgroundColor: '#6200ee' },
  switch: { marginTop: 10 },
});
