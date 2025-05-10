import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { CommonActions } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { uploadVideo } from '../../config/api';
import * as ImagePicker from 'expo-image-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';

const AdminDashboard = ({ navigation }) => {
  const [videoData, setVideoData] = useState({
    title: '',
    description: '',
    video: null,
    thumbnail: null,
  });

  // Function to pick a video from gallery
  {/*
  const pickVideo = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 1,
      });
  
      console.log('Picker Result:', result); // Log the full result
  
      // If user cancels or no assets are returned
      if (result.canceled || !result.assets.length) {
        Alert.alert('Error', 'No video selected!');
        return;
      }
  
      // Log the selected video asset
      console.log('Selected Video:', result.assets[0].uri);
  
      // Save selected video to state
      setVideoData((prev) => ({ ...prev, video: result.assets[0] }));
      console.log('Video data updated successfully');
    } catch (error) {
      console.error('Video Picker Error:', error);
      Alert.alert('Error', 'Failed to pick a video');
    }
  };
   */}
  
  const pickVideo = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 1,
      });
  
      // Log result
      console.log('Picker Result:', result);
  
      if (result.canceled || !result.assets.length) {
        Alert.alert('Error', 'No video selected!');
        return;
      }
  
      // Extract video and convert to Blob
      const base64Video = result.assets[0].uri.split(',')[1]; // Remove "data:video/mp4;base64,"
      const videoBlob = await fetch(result.assets[0].uri).then((res) => res.blob());
  
      console.log('Selected Video Blob:', videoBlob);
  
      // Save video blob to state
      setVideoData((prev) => ({ ...prev, video: videoBlob }));
      console.log('Video data updated successfully');
    } catch (error) {
      console.error('Video Picker Error:', error);
      Alert.alert('Error', 'Failed to pick a video');
    }
  };
 
  

  // Function to pick a thumbnail image
  const pickThumbnail = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 1,
      });

      // If user cancels selection, show an alert
      if (result.canceled || !result.assets.length) {
        Alert.alert('Error', 'No thumbnail selected!');
        return;
      }

      // Save selected thumbnail
      setVideoData((prev) => ({ ...prev, thumbnail: result.assets[0] }));
    } catch (error) {
      console.error('Thumbnail Picker Error:', error);
      Alert.alert('Error', 'Failed to pick a thumbnail');
    }
  };

  // Function to handle video upload
  const handleUpload = async () => {
    // Ensure all required fields are filled
    if (!videoData.video || !videoData.thumbnail || !videoData.title.trim()) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    try {
      await uploadVideo(videoData);
      Alert.alert('Success', 'Video uploaded successfully');

      // Reset form fields after successful upload
      setVideoData({
        title: '',
        description: '',
        video: null,
        thumbnail: null,
      });
    } catch (error) {
      console.error('Upload Error:', error);
      Alert.alert('Error', 'Failed to upload video');
    }
  };

  // Function to handle logout
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('token'); // Remove stored token

      // Reset navigation stack to Login screen
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'LoginScreen' }],
        })
      );
    } catch (error) {
      console.error('Logout Error:', error);
      Alert.alert('Error', 'Failed to log out. Try again.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Dashboard Header */}
      <View style={styles.statsContainer}>
        <Text style={styles.title}>Admin Dashboard</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Icon name="logout" size={20} color="#fff" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Video Upload Section */}
      <View style={styles.uploadSection}>
        <Text style={styles.sectionTitle}>Upload New Video</Text>

        {/* Input for Video Title */}
        <TextInput
          style={styles.input}
          placeholder="Video Title"
          value={videoData.title}
          onChangeText={(text) => setVideoData((prev) => ({ ...prev, title: text }))}
        />

        {/* Input for Video Description */}
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Video Description"
          value={videoData.description}
          onChangeText={(text) => setVideoData((prev) => ({ ...prev, description: text }))}
          multiline
          numberOfLines={4}
        />

        {/* Button to Select Video */}
        <TouchableOpacity style={styles.uploadButton} onPress={pickVideo}>
          <Icon name="video-library" size={24} color="#fff" />
          <Text style={styles.uploadButtonText}>
            {videoData.video ? '✔ Video Selected' : 'Select Video'}
          </Text>
        </TouchableOpacity>

        {/* Button to Select Thumbnail */}
        <TouchableOpacity style={styles.uploadButton} onPress={pickThumbnail}>
          <Icon name="image" size={24} color="#fff" />
          <Text style={styles.uploadButtonText}>
            {videoData.thumbnail ? '✔ Thumbnail Selected' : 'Select Thumbnail'}
          </Text>
        </TouchableOpacity>

        {/* Upload Video Button */}
        <TouchableOpacity
          style={[styles.uploadButton, styles.submitButton]}
          onPress={handleUpload}
        >
          <Icon name="cloud-upload" size={24} color="#fff" />
          <Text style={styles.uploadButtonText}>Upload Video</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 8,
  },
  uploadSection: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  uploadButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  submitButton: {
    backgroundColor: '#34C759',
    marginTop: 8,
  },
});

export default AdminDashboard;
