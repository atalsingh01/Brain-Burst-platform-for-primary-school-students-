import axios from "axios";
import jwtDecode from "jwt-decode";
import AsyncStorage from "@react-native-async-storage/async-storage";

// 🔹 Set API base URL depending on environment (Android Emulator or Web)
const API_URL = "http://localhost:8080/api"; // Use this for web testing
//const API_URL = "http://10.0.2.2:8080/api"; // Uncomment for Android Emulator
//const API_URL = "http://192.168.24.45:8080/api";
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 🔹 Request Interceptor: Attach JWT Token to Requests
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 🔹 Response Interceptor: Handle 401 Unauthorized Errors (Token Expiry)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      // Clear stored credentials when session expires
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("isAdmin");
      console.warn("Session expired. Please log in again.");
    }
    return Promise.reject(error);
  }
);

// 🔹 Get User Role from JWT Token
export const getUserRole = async () => {
  try {
    const token = await AsyncStorage.getItem("token");
    if (!token) return null;

    const decodedToken = jwtDecode(token);
    return decodedToken.role; // Ensure "role" is included in JWT payload
  } catch (error) {
    console.error("Token Decode Error:", error);
    return null;
  }
};

// 🔹 User Registration
export const signup = async (userData) => {
  try {
    const response = await api.post("/users/register", userData);

    return response.data;
  } catch (error) {
    console.error("Signup Error:", error);
    throw error;
  }
};

// 🔹 User Login
export const login = async (username, password) => {
  try {
    const response = await api.post("/users/login", { username, password });

    // Store JWT token & admin status in AsyncStorage
    await AsyncStorage.setItem("token", response.data.token);
    await AsyncStorage.setItem(
      "isAdmin",
      JSON.stringify(response.data.isAdmin)
    );

    return response.data;
  } catch (error) {
    console.error("Login Error:", error);
    throw error;
  }
};

// 🔹 User Logout: Clear stored credentials
export const logout = async () => {
  try {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("isAdmin");
  } catch (error) {
    console.error("Logout Error:", error);
    throw error;
  }
};

// 🔹 Fetch All Videos
export const getAllVideos = async () => {
  try {
    const response = await api.get("/videos");
    return response.data;
  } catch (error) {
    console.error("Fetch Videos Error:", error);
    throw error;
  }
};

{/*
// 🔹 Fetch a Single Video by ID
export const getVideoById = async (id) => {
  try {
    const response = await api.get(`/videos/${id}`);
    return response.data;
  } catch (error) {
    console.error("Fetch Video Error:", error);
    throw error;
  }
};

*/}
// 🔹 Upload a New Video (Admin Only)
export const uploadVideo = async (videoData) => {
  console.log(":::::::::::::::::::");
  try {
    // Check if user is an admin
    const isAdmin = JSON.parse(await AsyncStorage.getItem("isAdmin")) || false;
    if (!isAdmin) {
      throw new Error("Unauthorized: Only admins can upload videos.");
    }

    // Get authentication token
    const token = await AsyncStorage.getItem("token");
    console.log("🟡 Token being sent:", token);
    if (!token) {
      throw new Error("❌ No token found. User is not authenticated.");
    }

    // Prepare form data for video upload
    const formData = new FormData();
    formData.append("video", videoData.video);
    formData.append("thumbnail", videoData.thumbnail);
    formData.append("title", videoData.title);
    formData.append("description", videoData.description);

    // Send video upload request
    const response = await api.post("/videos", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("✅ Video uploaded successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Upload Video Error:", error);
    throw error;
  }
};

{/*
// 🔹 Update Video by ID
export const updateVideo = async (id, videoData) => {
  try {
    const token = await AsyncStorage.getItem("token");

    const response = await api.put(`/videos/${id}`, videoData, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data;
  } catch (error) {
    console.error("Update Video Error:", error);
    throw error;
  }
};

// 🔹 Delete Video by ID (Admin Only)
export const deleteVideo = async (id) => {
  try {
    const token = await AsyncStorage.getItem("token");

    await api.delete(`/videos/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (error) {
    console.error("Delete Video Error:", error);
    throw error;
  }
};*/}

export default api;
