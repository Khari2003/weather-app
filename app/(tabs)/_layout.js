import React, { useEffect, useState } from 'react';
import { Text, StyleSheet, View, ActivityIndicator, ScrollView, Image, TouchableOpacity, Modal } from 'react-native';
import axios from 'axios';
import { useRouter } from 'expo-router';
import Entypo from '@expo/vector-icons/Entypo';
import { LinearGradient } from 'expo-linear-gradient';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Feather from '@expo/vector-icons/Feather';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Drop from 'D:/Weather-App/assets/images/drop.svg'
import AntDesign from '@expo/vector-icons/AntDesign';

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
  const [reloadCount, setReloadCount] = useState(0); // Đếm số lần reload
  const name = new URLSearchParams(window.location.search).get("city") || "";
  
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [aqi, setAqi] = useState(null);
  const [nameCity, setNameCity] = useState("");
  const [favoriteCities, setFavoriteCities] = useState([]);
  const [isLiked, setIsLiked] = useState(false);
  const [country, setCountry] = useState("");
  // State thông báo thời tiết xấu
  const [notification, setNotification] = useState('');

  // Hàm kiểm tra và hiển thị thông báo ngoài trình duyệt
  const requestNotificationPermission = async () => {
    if (Notification.permission === 'granted') {
      return true;
    } else if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  };
  
  const showWebNotification = async (title, message) => {
    const isPermissionGranted = await requestNotificationPermission();
    if (isPermissionGranted) {
      new Notification(title, {
        body: message,
        icon: `https://openweathermap.org/img/wn/${weather[0].icon}@2x.png`, // Thay thế bằng đường dẫn tới biểu tượng của bạn
      });
    }
  };

  // Hàm hiển thị thông báo với nội dung message
  const showNotification = (message) => {
    setNotification(message); // Cập nhật thông báo
    setTimeout(() => setNotification(''), 5000); // Ẩn thông báo sau 5 giây
  };

  // useEffect để lấy dữ liệu thời tiết từ API khi component render
  useEffect(() => {
    if (name === "" && reloadCount < 1) {
      setReloadCount(prevCount => prevCount + 1); // Tăng biến đếm reload
      return;
    }

    axios.get(`http://localhost:3000/api/search?name=${name}`)
      .then(response => {
        if (response.data.length > 0) {
          const cityData = response.data[0];
          const lat = cityData.lat;
          const lon = cityData.lon;
          const cityNameVi = cityData.local_names?.vi || cityData.name;
          setCountry(cityData.country);

          // Fetch weather data
          axios.post(`http://localhost:3000/api/weather`, { lat, lon })
            .then(res => {
              setWeatherData(res.data);
              setAqi(res.data.aqi);
              setNameCity(cityNameVi);
              setLoading(false);

              if(res.data.alerts){
                showNotification(res.data.alerts)
              } else {
                showNotification('')
              }
            })
            .catch(error => {
              console.error("Error fetching weather data:", error);
              setError(error);
              setLoading(false);
            });
        } else {
          console.error("City not found");
          setError("City not found");
          setLoading(false);
        }
      })
      .catch(error => {
        setError(error);
        setLoading(false);
        // Hiển thị thông báo lỗi
        showWebNotification('Lỗi: Không thể tải thành phố.');
        showNotification('Lỗi: Không thể thành phố.');
      });
  }, [name, reloadCount]); 

  console.log(notification)

  useEffect(() => {
    const fetchFavoriteCities = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/favorites'); 
        setFavoriteCities(response.data);
        for (let i = 0; i < response.data.length; i++){
          if(response.data[i].name === nameCity && response.data[i].country === country){
            setIsLiked(true);
            break;
          }
        }
      } catch (error) {
        console.error("Error fetching favorite cities:", error);
      }
    };

    fetchFavoriteCities();
  }, [nameCity, country, isLiked]);

  useEffect(() => {
    // Tạo khoảng thời gian lặp để hiển thị thông báo
    const intervalId = setInterval(() => {
      const message = `${nameCity}, ${Math.round(weatherData.current.temp)}°C, Chất lượng không khí: ${getAQIDescription()}`;
      showWebNotification(message);
    }, 5000);

    // Dọn dẹp khi component bị huỷ
    return () => clearInterval(intervalId);
  }, [weatherData]);

  // Hàm gọi API để thêm thành phố vào danh sách yêu thích
  const handlePress = async () => {
    if (isLiked) {
      try {
          const res = await axios.delete('http://localhost:3000/api/favorites/delete', {
              data: {
                  name: nameCity,
                  country,
                  lat: weatherData.lat,
                  lon: weatherData.lon
              }
          });
          if (res.status === 200) {
              setIsLiked(false); // Đổi icon thành trái tim trống
              setFavoriteCities(favoriteCities.filter(city => city.name !== nameCity)); // Loại bỏ khỏi danh sách yêu thích
          } else {
              console.error("Failed to remove city from favorites");
          }
      } catch (error) {
          console.error("Error removing city from favorites:", error);
      }
    } else {
        try {
            const response = await axios.post('http://localhost:3000/api/save', {
                name: nameCity,
                country,
                lat: weatherData.lat,
                lon: weatherData.lon
            });

            if (response.status === 201) {
                setIsLiked(true); // Đổi icon thành trái tim đầy
                setFavoriteCities([...favoriteCities, response.data.city]); // Cập nhật danh sách yêu thích
            } else {
                console.error("Failed to add city to favorites");
            }
        } catch (error) {
            console.error("Error adding city to favorites:", error);
        }
      }
  };

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
      return {backgroundColor: '#FF9F45'};
    }else if(hour >= 5 && hour < 6){
      // Bình minh
      return {backgroundColor: '#FF9F45'};
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
  const { temp, weather, humidity, wind_speed, dew_point, pressure, uvi, visibility } = weatherData.current;

  console.log(weatherData)

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
          <TouchableOpacity onPress={() => router.push('/likeCity')}>
            <Entypo name="menu" size={50} color="white" />
          </TouchableOpacity>
          <Text style={styles.cityName}>{nameCity}</Text> {/* Hiển thị tên thành phố */}
          <TouchableOpacity style={{marginLeft: 20}} onPress={handlePress}>
            <AntDesign 
              name={isLiked ? "heart" : "hearto"}
              size={20} color='white'
            />
          </TouchableOpacity>
        </View>
        <View style={{flexDirection:'row', justifyContent:'space-between'}}>
          <View>
            <Text style={styles.temperature}>{Math.round(temp)}°</Text> {/* Hiển thị nhiệt độ hiện tại */}
            <Text style={styles.description}>{translateDescription(weather[0].description)}</Text> {/* Mô tả thời tiết */}
            <Text style={styles.tempRange}>
              {Math.round(weatherData.daily[0].temp.max)}° / {Math.round(weatherData.daily[0].temp.min)}° Cảm giác như {Math.round(feelsLikeTemp)}°
            </Text> {/* Nhiệt độ trong ngày và cảm giác như thế nào */}
          </View>
          <View style={{right:30}}>
            <Image source={{uri: `https://openweathermap.org/img/wn/${weather[0].icon}@2x.png`}} style={{width: 150, height: 150}}></Image>
          </View>
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
                <Text style={styles.hourPop}>{Math.round(item.pop)}%</Text> {/* Xác suất mưa */}
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
                <Text>{['Chủ nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'][new Date(item.dt * 1000).getDay()]}</Text>
              </View>
              <View style={styles.dayPop}>
                <Text>
                  {Math.round(item.pop)}% {/* Xác suất mưa trong tuần */}
                </Text>
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
      {notification !== '' && (
        <Modal
          transparent={true} // Cho phép hiển thị nội dung modal trên nền màn hình chính
          visible={notification !== ''} // Điều khiển hiển thị modal
          animationType="fade" // Thêm hiệu ứng fade khi mở modal
        >
          <View style={styles.notificationContainer}>
            <View style={[styles.notificationBox, getBackgroundColor()]}>
              <View>
                <Text style={styles.notificationText}>{notification[0].event}!!!</Text>
                <View style={{marginTop: 30}}>
                  <Text style={styles.notificationSubText}>Giờ bắt đầu: {new Date(notification[0].start * 1000).getHours()}:{new Date(notification[0].start * 1000).getMinutes().toString().padStart(2, '0')}</Text>
                  <Text style={styles.notificationSubText}>Giờ kết thúc: {new Date(notification[0].end * 1000).getHours()}:{new Date(notification[0].end * 1000).getMinutes().toString().padStart(2, '0')}</Text>
                </View>
              </View>
            </View>
          </View>
        </Modal>
      )}
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
  notificationContainer: {
    flex: 1, // Chiếm toàn bộ màn hình
    justifyContent: 'center', // Căn giữa theo trục dọc
    alignItems: 'center', // Căn giữa theo trục ngang
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Màu nền mờ (50%)
  },
  notificationBox: {
    backgroundColor: '#fff', // Nền trắng cho hộp thông báo
    paddingHorizontal: 20, // Khoảng cách nội dung với viền
    borderRadius: 10, // Bo tròn các góc
    shadowColor: '#000', // Màu bóng
    shadowOffset: { width: 0, height: 2 }, // Độ lệch của bóng
    shadowOpacity: 0.3, // Độ trong suốt của bóng
    shadowRadius: 4, // Độ lớn của bóng
    elevation: 5, // Độ nổi trên Android
    flexDirection: 'row',
    alignItems: 'center'
  },
  notificationText: {
    fontSize: 25, // Kích thước chữ
    textAlign: 'left', // Căn giữa chữ
    fontWeight: 'bold', // Chữ đậm
    color: 'red',
    marginTop: 30
  },
  notificationSubText:{
    fontSize: 16, // Kích thước chữ
    textAlign: 'left', // Căn giữa chữ
    fontWeight: 'bold', // Chữ đậm
    color: '#f2f2f1',
    marginVertical:10
  }
});



