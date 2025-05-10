import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Video } from 'expo-av';
import * as FileSystem from 'expo-file-system'; // File system for native platforms

const VideoDetail = ({ route }) => {
  const { video } = route.params;
  const [videoPath, setVideoPath] = useState(null);

  useEffect(() => {
    console.log("VideoDetail mounted");
    console.log("Video Data:", video);

    const saveVideoFile = async () => {
      if (Platform.OS !== 'web') { // Only execute this on native platforms
        try {
          const path = `${FileSystem.cacheDirectory}tempVideo.mp4`;
          await FileSystem.writeAsStringAsync(path, video.videoData, {
            encoding: FileSystem.EncodingType.Base64,
          });
          setVideoPath(path);
          console.log("Video saved to:", path);
        } catch (error) {
          console.error("Error saving video file:", error);
        }
      } else {
        console.log("Skipping file save since this is running on the web.");
        setVideoPath(`data:video/mp4;base64,${video.videoData}`); // Use Base64 directly for web
      }
    };

    saveVideoFile();

    return () => {
      console.log("VideoDetail unmounted");
    };
  }, [video]);

  return (
    <View style={styles.container}>
      {/* Video Player */}
      {videoPath ? (
        <Video
          source={{ uri: videoPath }}
          style={styles.videoPlayer}
          useNativeControls
          //resizeMode="contain"
          resizeMode="cover" 
          posterSource={{ uri: `data:image/png;base64,${video.thumbnailData}` }} // Base64 thumbnail
          shouldPlay
          onError={(error) => console.error("Video Playback Error:", error)}
          onLoadStart={() => console.log("Video loading started")}
          onLoad={() => console.log("Video loaded successfully")}
        />
      ) : (
        <Text>Loading video...</Text>
      )}

      {/* Title */}
      <Text style={styles.title}>{video.title || 'No Title Available'}</Text>

      {/* Description */}
      <Text style={styles.description}>
        {video.description || 'No Description Available'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1, // Ensure the container takes up the full screen
    justifyContent: 'center', // Center the video vertically
    alignItems: 'center', // Center the video horizontally
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  videoPlayer: {
    width: '100%', 
    //height: '100%',// Take up the full width of the container
    //height: 250, // Increase the height for better visibility
    aspectRatio:16/9,
    backgroundColor: 'black',
    marginBottom: 20, // Spacing below the video
    //flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10, // Space between title and description
    color: '#333',
    textAlign: 'center', // Center the title text
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center', // Center the description text
  },
});

export default VideoDetail;
