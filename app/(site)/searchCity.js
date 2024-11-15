import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

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

  return (
    <View style={{ padding: 20 }}>
      <TextInput
        placeholder="Enter city name"
        value={city}
        onChangeText={setCity}
        style={{ borderBottomWidth: 1, marginBottom: 10 }}
      />
      
      <TouchableOpacity onPress={searchCity} style={{ marginVertical: 10 }}>
        <Text>Search</Text>
      </TouchableOpacity>

      <FlatList
        data={results}
        keyExtractor={(item, index) => (item.id ? item.id.toString() : index.toString())}
        renderItem={({ item }) => (
            <TouchableOpacity onPress={() => router.push({ pathname: '/', params: { city: item.name } })}>
                <View style={{ padding: 10 }}>
                    <Text>{item.name}, {item.country}</Text>
                </View>
            </TouchableOpacity>
        )}
        />
    </View>
  );
}
