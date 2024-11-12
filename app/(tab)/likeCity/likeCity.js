import React, { useEffect, useState } from 'react';
import { Text, View, StyleSheet, ActivityIndicator, FlatList } from 'react-native';
import axios from 'axios';

export default function LikeCity() {
  const [favorites, setFavorites] = useState([]); // State for favorite cities
  const [loading, setLoading] = useState(true); // State for loading status
  const [error, setError] = useState(null); // State for error

  // Fetch favorite cities from API
  useEffect(() => {
    axios.get('http://localhost:3000/api/favorites')
      .then(response => {
        setFavorites(response.data); // Update the favorites state with API data
        setLoading(false); // Set loading to false after data is loaded
      })
      .catch(error => {
        setError(error); // Handle any errors
        setLoading(false); // Set loading to false if there's an error
      });
  }, []);

  // Display loading indicator
  if (loading) {
    return <ActivityIndicator size="large" />;
  }

  // Display error message if there's an error
  if (error) {
    return <Text>Error: {error.message}</Text>;
  }

  // Render list of favorite cities
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Danh sách thành phố yêu thích</Text>
      <FlatList
        data={favorites}
        keyExtractor={(item, index) => index.toString()} // Generate unique key for each item
        renderItem={({ item }) => (
          <View style={styles.cityContainer}>
            <Text style={styles.cityName}>{item.name}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f5f5f5' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  cityContainer: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#ddd' },
  cityName: { fontSize: 18 },
});
