import React, { useEffect, useState } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode"; // Decoding JWT token
import Icon from "react-native-vector-icons/Ionicons";

// Import Screens
import LoginScreen from "./screens/auth/LoginScreen";
import SignupScreen from "./screens/auth/SignupScreen";
import HomeScreen from "./screens/user/HomeScreen";
import SearchScreen from "./screens/common/SearchScreen";
import NotificationsScreen from "./screens/common/NotificationScreen";
import ProfileScreen from "./screens/user/ProfileScreen";
import AdminDashboard from "./screens/admin/AdminDashBoard";
import ManageUsers from "./screens/admin/ManageUsers";
import Analytics from "./screens/admin/Analytics";
import VideoDetail from "../app/screens/user/VideoDetail";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

//home stack 
const HomeStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    {/* Home Screen */}
    <Stack.Screen name="Home" component={HomeScreen} />
    {/* Video Detail Screen */}
    <Stack.Screen name="VideoDetail" component={VideoDetail} />
  </Stack.Navigator>
);
// 🔹 User's Bottom Tab Navigation
const UserTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;

        switch (route.name) {
          case "Home":
            iconName = focused ? "home" : "home-outline";
            break;
          case "Search":
            iconName = focused ? "search" : "search-outline";
            break;
          case "Notifications":
            iconName = focused ? "notifications" : "notifications-outline";
            break;
          case "Profile":
            iconName = focused ? "person" : "person-outline";
            break;
        }

        return <Icon name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: "#007AFF",
      tabBarInactiveTintColor: "gray",
    })}
  >
    <Tab.Screen name="Home" component={HomeStack} />
    <Tab.Screen name="Search" component={SearchScreen} />
    <Tab.Screen name="Notifications" component={NotificationsScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

// 🔹 Admin's Bottom Tab Navigation
const AdminTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;

        switch (route.name) {
          case "Dashboard":
            iconName = focused ? "grid" : "grid-outline";
            break;
          case "Users":
            iconName = focused ? "people" : "people-outline";
            break;
          case "Analytics":
            iconName = focused ? "stats-chart" : "stats-chart-outline";
            break;
        }

        return <Icon name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: "#007AFF",
      tabBarInactiveTintColor: "gray",
    })}
  >
    <Tab.Screen name="Dashboard" component={AdminDashboard} />
    <Tab.Screen name="Users" component={ManageUsers} />
    <Tab.Screen name="Analytics" component={Analytics} />
  </Tab.Navigator>
);

const AppNavigator = () => {
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 🔹 Function to check user role from token
    const checkUserRole = async () => {
      try {
        const token = await AsyncStorage.getItem("token");

        if (token) {
          // Decode JWT token to extract role
          const decodedToken = jwtDecode(token);
          console.log("Decoded Token:", decodedToken); // Debugging

          // Set role based on token (Ensuring role is correctly assigned)
          setUserRole(decodedToken.isAdmin ? "admin" : "user");
        } else {
          setUserRole(null);
        }
      } catch (error) {
        console.error("Error decoding token:", error);
      }
      setLoading(false);
    };

    checkUserRole();
  }, []);

  // 🔹 Show loading state while checking token
  if (loading) {
    return null; // You can replace this with a loading spinner or splash screen
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!userRole ? (
        // 🔹 If no user role, show Login & Signup
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
        </>
      ) : userRole === "admin" ? (
        // 🔹 If Admin, show AdminTabs
        <Stack.Screen name="AdminTabs" component={AdminTabs} />
      ) : (
        // 🔹 If User, show UserTabs
        <Stack.Screen name="UserTabs" component={UserTabs} />
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
