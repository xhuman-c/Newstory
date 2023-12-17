import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, TouchableOpacity, StyleSheet, FlatList, Image, Linking, SafeAreaView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Mypage = ({ categories, resetStarredProfiles, updateCategories, setCurrentScreen }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('user');
  const [password, setPassword] = useState('');
  const [feedData, setFeedData] = useState([]);

  useEffect(() => {
    async function loadStarredFeedData() {
      try {
        const savedProfiles = await AsyncStorage.getItem('starredProfiles');
        const profiles = savedProfiles ? JSON.parse(savedProfiles) : [];
        setFeedData(profiles);
      } catch (error) {
        console.error('별 표시된 프로필 로드 중 오류 발생:', error);
      }
    }
    loadStarredFeedData();
  }, []);

  useEffect(() => {
    async function checkLoginStatus() {
      try {
        const loginStatus = await AsyncStorage.getItem('isLoggedIn');
        if (loginStatus === 'true') {
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error('로그인 상태 확인 중 오류 발생:', error);
      }
    }

    checkLoginStatus();
  }, []);

  const handleReset = async () => {
    try {
      await AsyncStorage.removeItem('starredProfiles');
      alert('Star 데이터가 초기화되었습니다.');
      setFeedData([]);
      resetStarredProfiles();
    } catch (error) {
      console.error('데이터 초기화 중 오류 발생:', error);
    }
  };

  const handleLogin = async () => {
    if (username === 'user' && password === '1234') {
      setIsLoggedIn(true);
      try {
        await AsyncStorage.setItem('isLoggedIn', 'true');
        resetStarredProfiles;
      } catch (error) {
        console.error('로그인 상태 저장 중 오류 발생:', error);
      }
    } else {
      alert('올바른 사용자 이름과 비밀번호를 입력하세요.');
    }
  };

  const handleSignup = () => {
    // 회원가입 처리 로직
  };

  const handleHomeClick = () => {
    setCurrentScreen('home');
  };

  const handlesearchClick = () => {
    setCurrentScreen('search');
  };

  const handleLogout = async () => {
    setIsLoggedIn(false);
    try {
      await AsyncStorage.setItem('isLoggedIn', 'false');
    } catch (error) {
      console.error('로그아웃 상태 저장 중 오류 발생:', error);
    }
  };

  const handleDeleteItem = async (id) => {
    try {
      // AsyncStorage에서 삭제
      const savedProfiles = await AsyncStorage.getItem('starredProfiles');
      console.log(id+'를 삭제하려 함')
      let profiles = savedProfiles ? JSON.parse(savedProfiles) : [];
      profiles = profiles.filter(profile => profile.id !== id);
      await AsyncStorage.setItem('starredProfiles', JSON.stringify(profiles));
      
      // 로컬 상태 업데이트
      setFeedData(profiles);
  
      // categories 데이터에서도 삭제된 아이템 업데이트
      const updatedCategories = categories.map(category => {
        return {
          ...category,
          data: category.data.map(profile => {
            return profile.id === id ? { ...profile, isStarred: false } : profile;
          })
        };
      });
  
      updateCategories(updatedCategories);
    } catch (error) {
      console.error('기사 삭제 중 오류 발생:', error);
    }
  };

  const renderFeedItem = ({ item }) => (
    <View style={styles.feedItem}>
      <TouchableOpacity onPress={() => Linking.openURL(item.url)}>
        <Image source={{ uri: item.imageUri }} style={styles.feedImage} />
        <Text style={styles.profileTitle}>{item.title}</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.deleteButton} 
        onPress={() => handleDeleteItem(item.id)}>
        <Text style={styles.deleteButtonText}>X</Text>
      </TouchableOpacity>
    </View>
  );
  
  return (
    <SafeAreaView style={styles.container}>
      {isLoggedIn ? (
        <View style={styles.loggedInContainer}>
          <Text style={styles.title}>{username}님의 관심사</Text>
          <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
            <Text style={styles.resetButtonText}>초기화</Text>
          </TouchableOpacity>
          <FlatList
            data={feedData}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderFeedItem}
            contentContainerStyle={styles.flatListContent}
          />
        </View>
      ) : (
        <View style={styles.loginContainer}>
          <TextInput
            placeholder="username"
            value={username}
            onChangeText={setUsername}
            style={styles.input}
          />
          <TextInput
            placeholder="password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
          />
          <Button title="Login" onPress={handleLogin} />
          <Button title="Sign up" onPress={handleSignup} />
        </View>
      )}

      <View style={styles.menuBar}>
        <TouchableOpacity style={styles.menuItem} onPress={handleHomeClick}>
          <Text>HOME</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={handlesearchClick}>
          <Text>SEARCH</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
          <Text>LOGOUT</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  loggedInContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
  },
  loginContainer: {
    flex:1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  topButtonContainer: {
    flexDirection: 'row',
    // justifyContent: 'space-between',
    paddingTop: 50, // SafeAreaView와 함께 사용하여 추가적인 상단 여백 제공
  },
  resetButton: {
    position: 'absolute',
    left: 10,
    top: 40,
    padding: 10,
    backgroundColor: '#ddd',
    borderRadius: 5,
    zIndex:20
  },
  resetButtonText: {
    fontSize: 16,
    color: 'black',
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    width: 200,
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
  flatListContent: {
    marginTop:50,
    paddingBottom: 100,
  },
  feedItem: {
    marginBottom: 20,
    textAlign:'center'
  },
  feedImage: {
    left:0,
    width: 390,
    height: 390,
    borderRadius: 10,
  },
  title: {
    fontSize: 18,
    marginBottom: 20,
  },
  deleteButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'black',
    borderRadius: 10,
    padding: 7,
    zIndex: 20
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  logoutButton: {
    position: 'absolute',
    top: 0,
    left: 280,
    zIndex: 1,
  },
  profileTitle: {
    position: 'absolute',
    left:5,
    bottom: 15, 
    fontSize: 18,
    color: 'white',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', 
    borderRadius: 5,
  }
});

export default Mypage;