import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  TouchableOpacity,
  Animated,
  Easing,
  Linking,
  RefreshControl
} from "react-native";

import React, { useState, useEffect, useRef } from "react";
import logo from "./src/assets/logo.png";
import Profile from "./src/components/Profile.js";
import Search from "./src/components/Search.js";
import Mypage from "./src/components/Mypage.js";

import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  const [currentScreen, setCurrentScreenValue] = useState('home')
  const [visible, setVisible] = useState(false);
  const [categories, setCategories] = useState([]);
  const [breakingNews, setBreakingNews] = useState([]);
  const [selectedKeyword, setSelectedKeyword] = useState('');
  const [refreshing, setRefreshing] = useState(false); // 새로운 state 추가

  const fetchData = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/rss");
      const data = await response.json();
  
      // 별 표시된 프로필 목록 불러오기
      const savedProfiles = await AsyncStorage.getItem('starredProfiles');
      const starredProfiles = savedProfiles ? JSON.parse(savedProfiles) : [];
  
      // 카테고리 데이터에 별 표시 상태 업데이트
      const updatedCategories = data.categories.map(category => {
        return {
          ...category,
          data: category.data.map(profile => {
            const isStarred = starredProfiles.some(starred => starred.id === profile.id);
            return { ...profile, isStarred };
          })
        };
      });
  
      setCategories(updatedCategories);
    } catch (error) {
      console.error("에러 페칭 데이터:", error);
    }
    setRefreshing(false); // 데이터를 불러온 후 새로고침 상태를 비활성화
  };
  
  useEffect(() => {
    fetchData();
  }, []);

  const resetStarredProfiles = () => {
    const updatedCategories = categories.map(category => {
      return {
        ...category,
        data: category.data.map(profile => {
          return { ...profile, isStarred: false };
        })
      };
    });
    setCategories(updatedCategories);
  };

  const updateCategories = (newCategories) => {
    setCategories(newCategories);
  };

  const fetchBreakingNews = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/rss2");
      const data = await response.json();
      setBreakingNews(data);
    } catch (error) {
      console.error("Error fetching breaking news:", error);
    }
  };

  const setCurrentScreen = (screen) => {
    if (screen !== 'search') {
      setSelectedKeyword('');
    }
    setCurrentScreenValue(screen);
  };

  const handleKeywordSelect = (keyword) => {
    setSelectedKeyword(keyword);
    setCurrentScreen('search');
  };
  

  useEffect(() => {
    fetchBreakingNews();
  }, []); // 컴포넌트 마운트 시 한 번만 실행

  const scrollX = useRef(new Animated.Value(0)).current;
  const [breakingNewsWidth, setBreakingNewsWidth] = useState(0);

  useEffect(() => {
    let animation;
  
    if (currentScreen === 'home' && categories.length > 0 && categories[0].data.length > 0) {
      const breakingNewsTitles = categories[0].data.slice(0, 5).map(item => item.title);
      breakingNewsTitles.push(breakingNewsTitles[0]); // 첫 번째 아이템을 배열의 끝에 추가
  
      const totalWidth = breakingNewsTitles.reduce((acc, title) => acc + title.length * 10, 0);
      setBreakingNewsWidth(totalWidth);
  
      // 애니메이션 객체 초기화
      scrollX.setValue(0);
      animation = Animated.loop(
        Animated.timing(scrollX, {
          toValue: -totalWidth + breakingNewsWidth / 5, // 첫 번째 아이템이 다시 시작할 때까지만 이동
          duration: 32000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      animation.start();
    }
    
  
    return () => {
      if (animation) {
        animation.stop();
      }
      scrollX.setValue(0);
    };
  }, [currentScreen, categories, breakingNewsWidth]);
  
  // 속보 가져오기
  const renderBreakingNews = () => {
    if (!breakingNews.length) return [];

    return breakingNews.map((news, index) => (
      <TouchableOpacity key={index} onPress={() => Linking.openURL(news.url)}>
        <Animated.Text style={styles.breakingNewsText} numberOfLines={1}>
          {news.title + "          "} {/* 텍스트 사이의 간격 */}
        </Animated.Text>
      </TouchableOpacity>
    ));
  };

  useEffect(() => {
    fetchData();
  }, []);


  return (
    <>
      {currentScreen === 'home' ? (
        <SafeAreaView style={styles.container}>
          <View style={{width:'100%'}}>
            <View style={{ alignItems: "center", width:'100%'}}>
              <Image style={{ width: 330, height: 150, marginTop:-20}} source={logo} />
            </View>
            <View style={styles.breakingNewsContainer}>
              <Animated.View
                style={{ 
                  flexDirection: "row",
                  transform: [{ translateX: scrollX }],
                  width: breakingNewsWidth // 동적으로 계산된 너비 설정
                }}
              >
                {renderBreakingNews()}
              </Animated.View>
            </View>
          </View>
          <ScrollView
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={fetchData} // 새로고침시 fetchData 함수 호출
              />
            }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ marginTop:10, paddingBottom: 80 }}
          >
            {categories.map((category, idx) => (
              <ScrollView
                key={idx}
                showsHorizontalScrollIndicator={false}
                horizontal={true}
                style={{ marginTop: idx === 0 ? 0 : 10, marginLeft: 10}}
              >
                <View style={{ flexDirection: "row", marginLeft: 3 }}>
                  <View
                    style={{
                      width: 95,
                      height: 95,
                      borderWidth: 0.8,
                      borderColor: "gray",
                      borderRadius: 50,
                      alignItems: "center",
                      justifyContent: "center",
                      padding: 8,
                    }}
                  >
                    <Text style={{ fontSize: 12 }}>{category.name}</Text>
                  </View>
                  <View style={{ flexDirection: "row", marginLeft: 5 }}>
                    {category.data.map((item, index) => (
                      <Profile
                        key={index}
                        categories={categories}
                        categoryIndex={idx}
                        profileIndex={index}
                        onKeywordSelect={handleKeywordSelect}
                      />
                    ))}
                  </View>
                </View>
              </ScrollView>
            ))}
          </ScrollView>
          <View style={styles.menuBar}>
            <TouchableOpacity style={styles.menuItem} onPress={() => console.log("HOME 클릭")}>
              <Text>HOME</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => setCurrentScreen('search')}>
              <Text>SEARCH</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => setCurrentScreen('mypage')}>
              <Text>MYPAGE</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>

      ) : currentScreen === 'search' ? (
        <Search data={categories} setCurrentScreen={setCurrentScreen} selectedKeyword={selectedKeyword}/>

      ) : currentScreen === 'mypage' ? (
        <Mypage categories={categories} resetStarredProfiles={resetStarredProfiles} updateCategories={updateCategories} setCurrentScreen={setCurrentScreen} />
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  menuBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#d1d1d1',
  },
  menuItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginBottom:10
  },
  breakingNewsContainer: {
    backgroundColor: "black",
    height: 35,
    marginTop: -13,
    justifyContent: "center",
    overflow: "hidden", // 스크롤되는 텍스트가 컨테이너를 벗어나지 않도록 설정
  },
  breakingNewsText: {
    color: "white",
    paddingHorizontal: 30, // 좌우 간격 조정
  },
});