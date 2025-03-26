import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

// 📌 Importamos las pantallas del doctor
import DoctorDashboardScreen from "../screens/DoctorDashboardScreen";
import DoctorAppointmentsScreen from "../screens/DoctorAppointmentsScreen";
import AppointmentDetailsScreen from "../screens/AppointmentDetailsScreen";
import PatientHistoryScreen from "../screens/PatientHistoryScreen";
import DoctorProfileScreen from "../screens/DoctorProfileScreen";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// 📌 Stack para los detalles de citas
const AppointmentsStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="DoctorAppointments" component={DoctorAppointmentsScreen} />
    <Stack.Screen name="AppointmentDetails" component={AppointmentDetailsScreen} />
  </Stack.Navigator>
);

// 📌 Navegación principal del doctor con pestañas
const DoctorNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#1E88E5",
        tabBarInactiveTintColor: "#888",
        tabBarStyle: { backgroundColor: "#F5F5F5", paddingBottom: 5, height: 60 },
      }}
    >
      {/* 📌 Dashboard */}
      <Tab.Screen
        name="Dashboard"
        component={DoctorDashboardScreen}
        options={{
          tabBarLabel: "Inicio",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="clipboard-text" color={color} size={size} />
          ),
        }}
      />

      {/* 📌 Citas asignadas */}
      <Tab.Screen
        name="Appointments"
        component={AppointmentsStack}
        options={{
          tabBarLabel: "Citas",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="calendar-check" color={color} size={size} />
          ),
        }}
      />

      {/* 📌 Historial de pacientes */}
      <Tab.Screen
        name="PatientHistory"
        component={PatientHistoryScreen}
        options={{
          tabBarLabel: "Historial",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="history" color={color} size={size} />
          ),
        }}
      />

      {/* 📌 Perfil del doctor */}
      <Tab.Screen
        name="Profile"
        component={DoctorProfileScreen}
        options={{
          tabBarLabel: "Perfil",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default DoctorNavigator;
