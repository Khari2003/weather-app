import React, { useEffect, useState } from 'react';
import { Text, View, StyleSheet, ActivityIndicator, FlatList, TouchableOpacity, Image } from 'react-native';
import axios from 'axios';
import { useRouter } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';

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

  const getGradientColors = () => {
    const hour = new Date().getHours();

    if (hour >= 6 && hour < 12) {
      // Buổi sáng
      return ['#5597E1', '#70A7CE'];
    } else if (hour >= 12 && hour < 15) {
      // Buổi chiều
      return ['#4682B4', '#5F9EA0'];
    } else if(hour >= 17 && hour < 18){
      // Hoàng hôn
      return ['#6A8FAB', '#FAD08D', '#FF9F45'];
    }else if(hour >= 5 && hour < 6){
      // Bình minh
      return ['#FF9F45', '#FAD08D', '#6A8FAB'];
    } else {
      // Tối
      return ['#3B4C72', '#1E2A47'];
    }
  };

  // Màu nền khối theo thời gian
  const getBackgroundColor = () => {
    const hour = new Date().getHours();

    if (hour >= 6 && hour < 12) {
      // Buổi sáng
      return {backgroundColor:'#5597E1'};
    } else if (hour >= 12 && hour < 15) {
      // Buổi chiều
      return {backgroundColor: '#4682B4'};
    } else if(hour >= 17 && hour < 18){
      // Hoàng hôn
      return {backgroundColor: '#FF9F45'};
    }else if(hour >= 5 && hour < 6){
      // Bình minh
      return {backgroundColor: '#FF9F45'};
    } else {
      // Tối
      return {backgroundColor: '#3B4C72'};
    }
  }

  console.log(favorites)

  return (
    <LinearGradient
      colors={getGradientColors()}
      style={styles.gradientContainer} 
    >
      <View style={styles.container}>
        <View style={styles.titleBox}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back-outline" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.title}>Thành phố yêu thích</Text>
          <TouchableOpacity onPress={() => router.push('/searchCity')}>
            <Feather name="search" size={24} color="white" />
          </TouchableOpacity>
        </View>
        <FlatList
          data={favorites}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => router.push({ pathname: '/', params: { city: item.name } })}>
              <View style={[styles.cityContainer,getBackgroundColor()]}>
                <Text style={styles.cityName}>{item.name}</Text>
                <View style={{flexDirection:'row', alignItems:'center'}}>
                  {item.weather && <Image source={{uri: `https://openweathermap.org/img/wn/${item.weather.current.weather[0].icon}@2x.png`}} style={styles.weatherIcon}/>}
                  {item.weather && <Text style={{color:'white'}}>{`${Math.round(item.weather.current.temp)}°C`}</Text>}
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
    padding: 20,
    margin: 0,
  },
  container: { 
    flex: 1, 
    padding: 16,
  },
  titleBox: { flexDirection: 'row', justifyContent:'space-between', alignItems: 'center', marginBottom: 50},
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', color: 'white'},
  cityContainer: { 
    padding: 12, 
    flexDirection:'row', 
    justifyContent:'space-between', 
    alignItems: 'center',
    borderRadius: 8,
    marginTop: 10,
  },
  cityName: { fontSize: 18, color: 'white', fontWeight:'medium' },
  weatherIcon: {
    width: 40,
    height: 40,
    alignItems:'center'
  },
});
