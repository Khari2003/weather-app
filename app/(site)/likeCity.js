import React, { useEffect, useState } from 'react';
import { Text, View, StyleSheet, ActivityIndicator, FlatList, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { useRouter } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function LikeCity() {
  const router = useRouter();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:3000/api/favorites')
      .then(response => {
        const cities = response.data.map(city => ({
          ...city,
          weather: null, // Initially, weather data is null
        }));
        setFavorites(cities);
        setLoading(false);
      })
      .catch(error => {
        setError(error);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (favorites.length > 0) {
      Promise.all(
        favorites.map(city => 
          axios.get(`https://api.openweathermap.org/data/3.0/onecall?lat=${city.lat}&lon=${city.lon}&appid=4e26d9536210174bef92daadc972ad15&units=metric`)
            .then(res => ({ ...city, weather: res.data }))
            .catch(error => console.error("Error fetching weather data:", error))
        )
      ).then(updatedCities => {
        setFavorites(updatedCities);
      });
    }
  }, [favorites.length]);

  if (loading) {
    return <ActivityIndicator size="large" />;
  }

  if (error) {
    return <Text>Error: {error.message}</Text>;
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()}>
        <Ionicons name="arrow-back-outline" size={24} color="black" />
      </TouchableOpacity>
      <Text style={styles.title}>Danh sách thành phố yêu thích</Text>
      <TouchableOpacity onPress={() => router.push('/searchCity')}>
        <Feather name="search" size={24} color="black" />
      </TouchableOpacity>
      <FlatList
        data={favorites}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => router.push({ pathname: '/', params: { city: item.name } })}>
            <View style={styles.cityContainer}>
              <Text style={styles.cityName}>{item.name}</Text>
              {item.weather && <Text>{`Temp: ${item.weather.current.temp}°C`}</Text>}
            </View>
          </TouchableOpacity>
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
