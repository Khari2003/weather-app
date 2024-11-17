import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function SearchCity() {
  const [city, setCity] = useState('');
  const [results, setResults] = useState([]);
  const router = useRouter();

  // Hàm fetch dữ liệu từ API
  const searchCity = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/search?name=${city}`);
      if (response.ok) {
        const data = await response.json();
        setResults(data);
      } else {
        console.error('Failed to fetch data');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  // Dải màu nền màn hình theo thời gian
  const getGradientColors = () => {
    const hour = new Date().getHours();

    if (hour >= 6 && hour < 12) {
      return ['#5597E1', '#70A7CE']; // Buổi sáng
    } else if (hour >= 12 && hour < 15) {
      return ['#4682B4', '#5F9EA0']; // Buổi chiều
    } else if (hour >= 17 && hour < 18) {
      return ['#6A8FAB', '#FAD08D', '#FF9F45']; // Hoàng hôn
    } else if (hour >= 5 && hour < 6) {
      return ['#FF9F45', '#FAD08D', '#6A8FAB']; // Bình minh
    } else {
      return ['#3B4C72', '#1E2A47']; // Tối
    }
  };

  // Màu nền khối theo thời gian
const getBackgroundColor = () => {
  const hour = new Date().getHours();

  if (hour >= 6 && hour < 12) {
    // Buổi sáng
    return { backgroundColor: '#1E6FA8' }; // Màu xanh đậm
  } else if (hour >= 12 && hour < 15) {
    // Buổi chiều
    return { backgroundColor: '#235A85' }; // Màu xanh đậm hơn
  } else if (hour >= 17 && hour < 18) {
    // Hoàng hôn
    return { backgroundColor: '#D9691D' }; // Màu cam đậm
  } else if (hour >= 5 && hour < 6) {
    // Bình minh
    return { backgroundColor: '#D9691D' }; // Màu cam đậm
  } else {
    // Tối
    return { backgroundColor: '#2A3656' }; // Màu xanh đậm tối
  }
};

  return (
    <LinearGradient colors={getGradientColors()} style={styles.container}>
      <View style={styles.content}>
        <View style={styles.titleBox}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back-outline" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.title}>Tìm kiếm thành phố</Text>
        </View>
        <TextInput
          placeholder="Nhập tên thành phố"
          placeholderTextColor="#D0D0D0"
          value={city}
          onChangeText={setCity}
          style={styles.input}
        />
          
        <TouchableOpacity onPress={searchCity} style={[styles.searchButton, getBackgroundColor()]}>
          <Text style={styles.searchButtonText}>Tìm kiếm</Text>
        </TouchableOpacity>

        <FlatList
          data={results}
          keyExtractor={(item, index) => (item.id ? item.id.toString() : index.toString())}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => router.push({ pathname: '/', params: { city: item.name } })}>
              <View style={styles.resultItem}>
                <Text style={styles.resultText}>{item.name}, {item.country}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  titleBox: {
    flexDirection: 'row',
    justifyContent:'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
    marginBottom: 20,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#ffffff',
    right:50
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#ffffff',
    fontSize: 16,
    padding: 8,
    marginBottom: 20,
    color: '#ffffff',
  },
  searchButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  searchButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  resultItem: {
    padding: 15,
    marginVertical: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
  },
  resultText: {
    color: '#ffffff',
    fontSize: 16,
  },
});
