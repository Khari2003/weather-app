import React, { useEffect, useState } from 'react';
import { Text, StyleSheet, View, ActivityIndicator, ScrollView, Image, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { useRouter } from 'expo-router';
import Entypo from '@expo/vector-icons/Entypo';
import { LinearGradient } from 'expo-linear-gradient';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Feather from '@expo/vector-icons/Feather';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Drop from 'D:/Weather-App/assets/images/drop.svg'

const translateDescription = (description) => {
  const translations = {
    "clear sky": "Trời quang đãng",
    "few clouds": "Có mây",
    "scattered clouds": "Mây rải rác",
    "broken clouds": "Mây đen",
    "overcast clouds": "Mây che phủ",
    "shower rain": "Mưa rào",
    "light rain": "Mưa nhẹ",
    "moderate rain": "Mưa vừa",
    "heavy rain": "Mưa to",
    "thunderstorm": "Giông bão",
    "snow": "Tuyết",
    "mist": "Sương mù",
    "smoke": "Khói",
    "haze": "Sương khói",
    "dust": "Bụi",
    "fog": "Sương mù",
    "sand": "Cát",
    "ash": "Tro",
    "squall": "Gió giật",
    "tornado": "Lốc xoáy",
  };

  // Trả về mô tả thời tiết được dịch, nếu không có thì trả lại giá trị ban đầu
  return translations[description.toLowerCase()] || description;
};

export default function WeatherDisplay() {
  const router = useRouter();
  const [weatherData, setWeatherData] = useState(null); // Lưu trữ dữ liệu thời tiết
  const [loading, setLoading] = useState(true); // Trạng thái loading
  const [error, setError] = useState(null); // Lưu trữ lỗi nếu có
  const [aqi, setAqi] = useState(null); // Lưu trữ chỉ số AQI (Chỉ số chất lượng không khí)

  const name = "Ho Chi Minh"
  // Dùng useEffect để lấy dữ liệu thời tiết từ API khi component được render
  useEffect(() => {
    axios.get(`http://localhost:3000/api/search?name=${name}`)
      .then(response => {
        console.log(response.data); // In dữ liệu nhận được từ API
        setWeatherData(response.data); // Cập nhật dữ liệu thời tiết
        setAqi(response.data.aqi); // Cập nhật chỉ số AQI
        setLoading(false); // Đặt trạng thái loading là false
      })
      .catch(error => {
        setError(error); // Cập nhật lỗi nếu có
        setLoading(false); // Đặt trạng thái loading là false
      });
  }, []); // Chạy effect này chỉ 1 lần khi component mount

  // Hiển thị khi dữ liệu đang tải
  if (loading) {
    return <ActivityIndicator size="large" />;
  }

  // Hiển thị khi có lỗi
  if (error) {
    return <Text>Error: {error.message}</Text>;
  }

  const currentHour = new Date().getHours(); // Lấy giờ hiện tại

  // Xác định nhiệt độ cảm giác dựa trên giờ trong ngày
  let feelsLikeTemp;
  if (currentHour >= 6 && currentHour < 12) {
    feelsLikeTemp = weatherData.daily[0].feels_like.morn; // Buổi sáng
  } else if (currentHour >= 12 && currentHour < 18) {
    feelsLikeTemp = weatherData.daily[0].feels_like.day; // Buổi trưa
  } else if (currentHour >= 18 && currentHour < 21) {
    feelsLikeTemp = weatherData.daily[0].feels_like.eve; // Buổi tối
  } else {
    feelsLikeTemp = weatherData.daily[0].feels_like.night; // Đêm
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
      return {backgroundColor: '#6A8FAB'};
    }else if(hour >= 5 && hour < 6){
      // Bình minh
      return {backgroundColor: '#6A8FAB'};
    } else {
      // Tối
      return {backgroundColor: '#3B4C72'};
    }
  }

  // Hàm trả về kiểu dáng của thanh AQI dựa trên chỉ số AQI
  const getAQIStyles = () => {
    if (aqi === 1) return { width: '20%', backgroundColor: 'green' };
    if (aqi === 2) return { width: '40%', backgroundColor: 'yellow' };
    if (aqi === 3) return { width: '60%', backgroundColor: 'orange' };
    if (aqi === 4) return { width: '80%', backgroundColor: 'red' };
    if (aqi === 5) return { width: '100%', backgroundColor: 'purple' };
    return { width: '0%', backgroundColor: 'transparent' }; // Nếu không có AQI thì ẩn
  };

  // Hàm trả về mô tả chất lượng không khí dựa trên chỉ số AQI
  const getAQIDescription = () => {
    if (aqi === 1) return "Chất lượng không khí tốt";
    if (aqi === 2) return "Chất lượng không khí trung bình";
    if (aqi === 3) return "Không tốt cho sức khỏe nhạy cảm";
    if (aqi === 4) return "Không tốt cho sức khỏe";
    if (aqi === 5) return "Rất nguy hại";
    return "Đang tải...";
  };

  // Lấy dữ liệu thời tiết hiện tại
  const { temp, weather, humidity, wind_speed, dew_point, pressure, uvi, visibility, feels_like } = weatherData.current;
  
  // Hàm trả về mô tả chỉ số UV
  const getUVIDescription = () => {
    if (uvi <= 2) return "Thấp";
    if (uvi <= 5) return "Trung bình";
    if (uvi <= 7) return "Cao";
    if (uvi <= 10) return "Rất cao";
    if (uvi > 10) return "Cực kỳ cao";
    return "Đang tải...";
  };

  return (
    <LinearGradient
      colors={getGradientColors()}
      style={styles.gradientContainer} // Áp dụng màu nền gradient
    >
    <ScrollView style={styles.container}>
        <View style={styles.menuTitle}>
          <TouchableOpacity onPress={() => router.push('./likeCity/likeCity')}>
            <Entypo name="menu" size={50} color="white" />
          </TouchableOpacity>
          <Text style={styles.cityName}>{weatherData.local_names.vi}</Text> {/* Hiển thị tên thành phố */}
        </View>
        <View>
          <Text style={styles.temperature}>{Math.round(temp)}°</Text> {/* Hiển thị nhiệt độ hiện tại */}
          <Text style={styles.description}>{translateDescription(weather[0].description)}</Text> {/* Mô tả thời tiết */}
          <Text style={styles.tempRange}>
            {Math.round(weatherData.daily[0].temp.max)}° / {Math.round(weatherData.daily[0].temp.min)}° Cảm giác như {Math.round(feelsLikeTemp)}°
          </Text> {/* Nhiệt độ trong ngày và cảm giác như thế nào */}
        </View>

      <View style={[styles.hourlyContainer, getBackgroundColor()]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {weatherData.hourly.slice(0, 24).map((item, index) => (
            <View key={index} style={styles.hourBlock}>
              <Text style={styles.hourText}>{new Date(item.dt * 1000).getHours()}:00</Text> {/* Giờ trong ngày */}
              <Image source={{uri: `https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`}} style={styles.weatherIcon}></Image>
              <Text style={styles.hourTemp}>{Math.round(item.temp)}°</Text> {/* Nhiệt độ theo giờ */}
              <View style={{flexDirection:'row', alignItems:'center', width:'100%', justifyContent:'space-around'}}>
                <FontAwesome6 name="droplet" size={12} color="white" />
                <Text style={styles.hourPop}>{item.pop}%</Text> {/* Xác suất mưa */}
              </View>
            </View>
          ))}
        </ScrollView>
      </View>

      <View style={[styles.dailyContainer, getBackgroundColor()]}>
        <View style={styles.column}>
          {weatherData.daily.slice(0, 7).map((item, index) => (
            <Text key={index} style={styles.dailyRow}>
              <View style={styles.dayText}>
                {['Chủ nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'][new Date(item.dt * 1000).getDay()]}
              </View>
              <View style={styles.dayPop}>
                {Math.round(item.pop)}% {/* Xác suất mưa trong tuần */}
              </View>
              <Text style={styles.iconClound}>
                <Image source={{uri: `https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`}} style={styles.weatherIcon}></Image>
              </Text> 
              <Text style={styles.dayTemp}>
                {Math.round(item.temp.max)}° / {Math.round(item.temp.min)}° {/* Nhiệt độ trong tuần */}
              </Text>
            </Text> 
          ))}
        </View>
      </View>

      <View style={[styles.aqiContainer, getBackgroundColor()]}>
          <Text style={styles.aqiText}>AQI</Text>
          <Text style={styles.aqiDescription}>{getAQIDescription()}</Text> {/* Mô tả AQI */}
          <View style={styles.aqiBar}>
                <View style={[styles.aqiLevel, getAQIStyles()]} />
            </View>
      </View>

      <View style={styles.additionalInfo}>
          <View style={[styles.infoBlock, getBackgroundColor()]}>
            <View style={styles.blockInfo}>
              <Feather name="sun" size={24} color="white" />
              <Text style={styles.infoTitle}>Chỉ số UV</Text>
            </View>
            <Text style={styles.infoValue}>{getUVIDescription()}</Text> {/* Mô tả chỉ số UV */}
          </View>
          <View style={[styles.infoBlock, getBackgroundColor()]}>
            <View style={styles.blockInfo}>
              <Image source={Drop} style={{ height: 24, width: 26, resizeMode: 'contain' }} />
              <Text style={styles.infoTitle}>Độ ẩm</Text>
            </View>
            <Text style={styles.infoValue}>{humidity}%</Text> {/* Độ ẩm */}
          </View>
          <View style={[styles.infoBlock, getBackgroundColor()]}>
            <View style={styles.blockInfo}>
              <Feather name="wind" size={24} color="white" />
              <Text style={styles.infoTitle}>Gió</Text>
            </View>
            <Text style={styles.infoValue}>{wind_speed} km/h</Text> {/* Tốc độ gió */}
          </View>
          <View style={[styles.infoBlock, getBackgroundColor()]}>
            <View style={styles.blockInfo}>
              <MaterialIcons name="dew-point" size={24} color="white" />
              <Text style={styles.infoTitle}>Điểm sương</Text>
            </View>
            <Text style={styles.infoValue}>{dew_point}°</Text> {/* Điểm sương */}
          </View>
          <View style={[styles.infoBlock, getBackgroundColor()]}>
            <View style={styles.blockInfo}>
              <MaterialCommunityIcons name="car-brake-low-pressure" size={24} color="white" />  
              <Text style={styles.infoTitle}>Áp suất</Text>
            </View>
            <Text style={styles.infoValue}>{pressure} mb</Text> {/* Áp suất không khí */}
          </View>
          <View style={[styles.infoBlock, getBackgroundColor()]}>
            <View style={styles.blockInfo}>
              <MaterialIcons name="visibility" size={24} color="white" />
              <Text style={styles.infoTitle}>Hiển thị</Text>
            </View>
            <Text style={styles.infoValue}>{visibility/1000} km</Text> {/* Tầm nhìn */}
          </View>
      </View>
    </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradientContainer: {
    flex: 1,
    padding: 20,
    margin: 0,
  },
  menuTitle: { flexDirection: 'row',  marginVertical: 16, alignItems: 'center' },
  cityName: { fontSize: 30, color: 'white', textAlign: 'left', marginLeft: 20 },
  temperature: { fontSize: 100, fontWeight: 'medium' ,color: 'white', textAlign: 'left', marginVertical: 8 },
  description: { fontSize: 20, color: 'white', textAlign: 'left', marginBottom: 16, fontWeight:'medium' },
  tempRange: { fontSize: 20, color: 'white', textAlign: 'left', marginBottom: 16, fontWeight:'medium' },

  hourlyContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    marginVertical: 10, 
    height:200,
    padding: 16,
    borderRadius: 8,
    // backgroundColor: '#323A69',
  },
  hourBlock: { alignItems: 'center', marginHorizontal:10, justifyContent: 'space-between' },
  hourText: { color: 'white', fontSize: 16, fontWeight:'medium' },
  hourTemp: { color: 'white', fontSize: 16, fontWeight:'medium' },
  hourPop: { color: 'white', fontSize: 12, fontWeight:'medium' },
  weatherIcon: {
    width: 40,
    height: 40,
    alignItems:'center'
  },

  dailyContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginVertical: 16,
    borderRadius: 8,
    padding: 16,
  },
  column: { 
    flex: 1, 
    paddingHorizontal: 10,
  },
  dailyRow:{
    display: 'flex',
    justifyContent:'space-around',
  },
  iconClound: {
  },
  dayText: { 
    color: 'white', 
    fontSize: 14, 
    textAlign: 'left',  
    height:24,
    marginVertical: 10,
    width: 60
  },
  dayTemp: { 
    color: 'white', 
    fontSize: 14, 
    textAlign: 'center', 
    height:24,
    marginVertical: 10,
  },
  dayPop: { 
    color: 'white', 
    fontSize: 12, 
    textAlign: 'center',
    height: 24,
    marginVertical: 10,
  },

  aqiContainer: { padding: 12, borderRadius: 8, marginBottom: 16, alignItems:'center' },
  aqiText: { color: 'white', fontSize: 16, textAlign: 'center' },
  aqiDescription: { color: 'white', textAlign: 'center', fontSize: 16, fontWeight: 'bold' },
  aqiBar: {
    width: '60%',
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 4,
  },
  aqiLevel: {
      height: '100%',
      borderRadius: 4,
      width:'60%'
  },

  blockInfo:{ flexDirection: 'row', alignItems: 'center'}, 
  additionalInfo: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  infoBlock: { width: '45%', padding: 10, borderRadius: 8, marginVertical: 8 },
  infoTitle: { color: 'white', fontSize: 12, marginLeft: 10, marginRight: 10 },
  infoValue: { color: 'white', fontSize: 16 },
});



