import React, { useState, useEffect } from 'react';
import { View, FlatList, Image, TouchableOpacity, TextInput, Text, StyleSheet } from 'react-native';
import StoryWrapper from './StoryWrapper.js';

const Search = ({ data, setCurrentScreen, selectedKeyword }) => {
  const [searchText, setSearchText] = useState('');
  const [filteredProfiles, setFilteredProfiles] = useState([]);
  const [visible, setVisible] = useState(false);
  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState(null);
  const [selectedProfileIndex, setSelectedProfileIndex] = useState(null);
  const [newCategories, setNewCategories] = useState([]);


  useEffect(() => {
    filterProfiles();
  }, [searchText, data]);

  useEffect(() => {
    if (selectedKeyword) {
      setSearchText(selectedKeyword);
      filterProfiles();
    }
  }, [selectedKeyword]);

  const filterProfiles = () => {
    if (searchText === '') {
      // 모든 프로필을 표시
      const allProfiles = data.flatMap((category, catIndex) =>
        category.data.map((profile, proIndex) => ({
          ...profile,
          categoryIndex: catIndex,
          profileIndex: proIndex,
        }))
      );
      setFilteredProfiles(allProfiles);
    } else {
      // 검색 조건에 맞는 프로필을 필터링
      const allProfiles = data.flatMap((category, catIndex) =>
        category.data.map((profile, proIndex) => ({
          ...profile,
          categoryIndex: catIndex,
          profileIndex: proIndex,
        }))
      );

      const filtered = allProfiles.filter(profile => {
        const searchLower = searchText.toLowerCase();
        return (
          profile.title.toLowerCase().includes(searchLower) ||
          profile.press.toLowerCase().includes(searchLower) ||
          profile.storyData.some(story => 
            story.text.toLowerCase().includes(searchLower)
          ) || 
          (profile.keyword && profile.keyword.split(', ').some(keyword =>
            keyword.toLowerCase().includes(searchLower)
          ))
        );
      }).map((profile, index) => ({ ...profile, profileIndex: index }));
    
      setFilteredProfiles(filtered);
    }
  };

  const handleProfilePress = (item) => {
    const filteredCategories = [{
      name: "검색 결과",
      data: filteredProfiles // 이미 새로운 인덱스가 할당된 상태
    }];

    setNewCategories(filteredCategories);
    setSelectedCategoryIndex(0);
    setSelectedProfileIndex(item.profileIndex); // 필터링된 배열의 인덱스 사용
    setVisible(true);
  };


  // 태그 클릭 시 호출되는 함수
  const handleTagClick = (tag) => {
    // 검색 입력값을 업데이트하고 검색 수행
    console.log("Clicked tag:", tag);
    setSearchText(tag);
    filterProfiles();
    setCurrentScreen('search');
  };

  const handleKeywordSelect = (keyword) => {
    setSearchText(keyword);
    filterProfiles();       
    setVisible(false); 
  };

  const handleStoryComplete = () => {
    console.log("스토리가 완료되었습니다.");
  };

  const handleHomeClick = () => {
    setCurrentScreen('home');
  };

  const handleMypageClick = () => {
    setCurrentScreen('mypage');
  };


  return (
    <View style={styles.container}>
      <View style={styles.menuBar}>
        <TouchableOpacity style={styles.menuItem} onPress={handleHomeClick}>
          <Text>HOME</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} disabled>
          <Text>SEARCH</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={handleMypageClick}>
          <Text>MYPAGE</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchBoxContainer}>
        <TextInput
          style={styles.searchBox}
          placeholder="해시태그 검색은 #검색 해주세요"
          value={searchText}
          onChangeText={text => setSearchText(text)}
        />
      </View>

      <FlatList
        data={filteredProfiles} // 검색 결과에 따라 필터링된 프로필 목록
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.imageContainer}
            onPress={() => handleProfilePress(item)}
          >
            <Image source={{ uri: item.avatar }} style={styles.image} resizeMethod = "resize"/>
          </TouchableOpacity>
        )}
        keyExtractor={(item, index) => `${item.categoryIndex}-${item.profileIndex}-${index}`}
        numColumns={3}
      />
      {visible && (
        <StoryWrapper
          categories={newCategories}
          categoryIndex={selectedCategoryIndex}
          profileIndex={selectedProfileIndex}
          visible={visible}
          onClose={() => setVisible(false)}
          onStoryComplete={handleStoryComplete}
          onTagClick={handleTagClick}
          onKeywordSelect={handleKeywordSelect}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop: 20,
  },
  searchBoxContainer: {
    marginTop: 50, // 검색 상자의 위치 조정
    paddingHorizontal: 10
  },
  searchBox: {
    height: 40,
    borderWidth: 4,
    borderColor: '#ddd',
    paddingLeft: 10,
    borderRadius: 5,
    bottom: 10,
  },
  imageContainer: {
    flex: 1 / 3,
    aspectRatio: 1
  },
  image: {
    flex: 1,
    margin: 1
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
    zIndex: 9999
  },
  menuItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginBottom:10
  },
});

export default Search;