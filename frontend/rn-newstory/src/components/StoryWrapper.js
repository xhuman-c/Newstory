import React, { useState, useEffect, useRef } from "react";
import {
  SafeAreaView,
  View,
  Image,
  TouchableOpacity,
  Animated,
  Dimensions,
  Modal,
  PanResponder,
  StyleSheet,
  Text,
  Linking,
} from "react-native";

import { LinearGradient } from 'expo-linear-gradient';
import closeIcon from "../assets/x.png";
import linkIcon from "../assets/link.png";
import starIcon from "../assets/star.png"; // 별 아이콘(테두리만 있는 별)
import starIconFilled from "../assets/star-filled.png"; // 별 아이콘(채워진 별)
import AsyncStorage from '@react-native-async-storage/async-storage';

//폰트
import * as Font from "expo-font";

const width = Dimensions.get("window").width;
const height = Dimensions.get("window").height;

const StoryWrapper = ({
  categories,
  categoryIndex,
  profileIndex,
  visible,
  onClose,
  onStoryComplete,
  onKeywordSelect
}) => {
  // 상태 관리
  const [isReady, setIsReady] = useState(false);


  useEffect(() => {
    const loadFonts = async () => {
      await Font.loadAsync({
        // nanum: require("../../assets/fonts/NanumGothic-Bold.ttf"),
        // gmarket: require("../../assets/fonts/GmarketSansTTFMedium.ttf"),
        // cafe24: require("./assets/fonts/Cafe24Ssurround.ttf"),
      });
      setIsReady(true);
    };

    loadFonts();
  }, []);


  const [current, setCurrent] = useState({
    index: 0,
    profileIndex,
    categoryIndex,
  });
  const [isFileNameModalVisible, setIsFileNameModalVisible] = useState(false);
  const [fileName, setFileName] = useState("");
  const [isPaused, setIsPaused] = useState(false);
  

  // 슬라이드 애니메이션을 위한 초기 상태
  const slideAnim = useRef(new Animated.Value(0)).current;

  // 스토리 전환 애니메이션
  const transitionToNextStory = (onAnimationComplete) => {
    Animated.timing(slideAnim, {
      toValue: -width, // 화면 너비만큼 왼쪽으로 이동
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      slideAnim.setValue(0); // 애니메이션 종료 후 초기화
      if (onAnimationComplete) onAnimationComplete(); // 콜백 함수 호출
    });
  };


  // 별
  const currentStory = categories[current.categoryIndex].data[current.profileIndex];

  const handleStarClick = async () => {
    const currentProfileData = categories[current.categoryIndex].data[current.profileIndex];
  
    // 별 표시 상태 토글
    currentProfileData.isStarred = !currentProfileData.isStarred;
  
    try {
      const starredProfiles = await AsyncStorage.getItem('starredProfiles');
      let newStarredProfiles = starredProfiles ? JSON.parse(starredProfiles) : [];
  
      if (currentProfileData.isStarred) {
        // 별 표시된 경우 추가
        newStarredProfiles.push({
          id: currentProfileData.id,
          title: currentProfileData.title,
          imageUri: currentProfileData.avatar,
          url: currentProfileData.url
        });
      } else {
        // 별 표시 해제된 경우 제거
        newStarredProfiles = newStarredProfiles.filter(profile => profile.id !== currentProfileData.id);
      }
  
      await AsyncStorage.setItem('starredProfiles', JSON.stringify(newStarredProfiles));
    } catch (error) {
      console.error('별 표시된 프로필 저장 중 오류 발생:', error);
    }
  
    // categories 상태 업데이트
    setCurrent({ ...current });
  };


  // 스토리 정보를 보여주는 함수
  const showFileNameModal = () => {
    const currentFileName =
      categories[current.categoryIndex].data[current.profileIndex].url;

    setFileName(currentFileName);
    setIsFileNameModalVisible(true);
    setIsPaused(true); // 팝업이 열릴 때 일시정지
  };

  // 이미지 파일명 팝업이 닫힐 때 일시정지 해제
  const closeFileNameModal = () => {
    setIsFileNameModalVisible(false);
    setIsPaused(false);
  };

  const openURL = (url) => {
    Linking.openURL(url).catch((err) =>
      console.error("에러", err)
    );
  };

  // 해시태그 렌더 함수
  const renderTags = () => {
    const keywords = categories[current.categoryIndex].data[current.profileIndex].keyword;
    // 키워드가 없거나 빈 문자열인 경우 빈 배열 리턴
    if (!keywords || keywords.trim() === '') {
      return [];
    }
  
    const keywordArray = keywords.split(', ');
    return keywordArray.map((tag, index) => (
      <TouchableOpacity key={index} onPress={() => handleTagPress(tag)}>
        <Text style={styles.tag}>{tag} </Text>
      </TouchableOpacity>
    ));
  };

  // 태그 클릭 핸들러
  const handleTagPress = (tag) => {
    onKeywordSelect(tag);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isPaused) {
        let storyData =
          categories[current.categoryIndex].data[current.profileIndex]
            .storyData;

        if (current.index === storyData.length - 1) {
          transitionToNextStory(); // 스토리 전환 애니메이션 실행
        }

        // 기존 타이머 로직
        if (current.index < storyData.length - 1) {
          setCurrent((prevCurrent) => ({
            index: prevCurrent.index + 1,
            profileIndex: prevCurrent.profileIndex,
            categoryIndex: prevCurrent.categoryIndex,
          }));
        } else if (
          current.profileIndex <
          categories[current.categoryIndex].data.length - 1
        ) {
          setCurrent((prevCurrent) => ({
            index: 0,
            profileIndex: prevCurrent.profileIndex + 1,
            categoryIndex: prevCurrent.categoryIndex,
          }));
          onStoryComplete();
        } else {
          onClose(true);
          onStoryComplete();
        }
      }
    }, 7000);

    return () => clearTimeout(timer);
  }, [current, categories, onClose, isPaused, onStoryComplete]); // onStoryComplete 의존성 추가

  // 프로그레스 뷰
  const ProgressView = () => {
    const progressAnim = useRef(new Animated.Value(0)).current;
    let storyData =
      categories[current.categoryIndex].data[current.profileIndex].storyData;

    useEffect(() => {
      progressAnim.setValue(0);
      const animation = Animated.timing(progressAnim, {
        toValue: (width - 15) / storyData.length,
        duration: 7000,
        useNativeDriver: false,
      });

      if (!isPaused) {
        animation.start();
      }

      return () => {
        animation.stop();
      };
    }, [current, progressAnim, isPaused]);

    return (
      <Animated.Text style={{ backgroundColor: "#fff", width: progressAnim }} />
    );
  };

  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(categoryIndex);
  const [nextCategoryIndex, setNextCategoryIndex] = useState(categoryIndex);

  const updateCategoryIndex = (newIndex) => {
    setCurrentCategoryIndex(newIndex);
    setNextCategoryIndex(newIndex === categories.length - 1 ? 0 : newIndex + 1);
  };

  const position = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

  // 스와이프 로직
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return Math.abs(gestureState.dy) > 20;
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dy < -50) {
          Animated.spring(position, {
            toValue: { x: 0, y: -height },
            useNativeDriver: true
          }).start(() => updateCategoryIndex(nextCategoryIndex));
        } else {
          Animated.spring(position, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: true
          }).start();
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dy < -50) {
          // 마지막 카테고리가 아니면 다음 카테고리로 이동
          setCurrent((prev) => ({
            index: 0,
            profileIndex:
              prev.categoryIndex + 1 >= categories.length
                ? prev.profileIndex
                : 0,
            categoryIndex:
              prev.categoryIndex + 1 >= categories.length
                ? prev.categoryIndex
                : prev.categoryIndex + 1,
          }));
        } else if (gestureState.dy > 50) {
          // 첫 번째 카테고리가 아니면 이전 카테고리로 이동
          setCurrent((prev) => ({
            index: 0,
            profileIndex: prev.categoryIndex === 0 ? prev.profileIndex : 0,
            categoryIndex:
              prev.categoryIndex === 0 ? 0 : prev.categoryIndex - 1,
          }));
        }
      },
    })
  ).current;


  return (
    <Modal
      visible={visible}
      transparent={true}
      style={{ flex: 1, backgroundColor: "red", alignItems: "center", }}
    >
      <SafeAreaView style={styles.container}>
        <Animated.View
          {...panResponder.panHandlers}
          style={[
            { flex: 1, backgroundColor: "#222" },
            { transform: position.getTranslateTransform() }
          ]}
        >
          <LinearGradient
            colors={['rgba(67, 67, 67,0.8)', 'rgba(67, 67, 67, 0)', 'rgba(67, 67, 67, 0)']}
            style={styles.gradient} />
          <View style={styles.imageContainer}>

            <Animated.View
              style={[
                styles.imageContainer,
                { transform: [{ translateX: slideAnim }] }, // 슬라이드 애니메이션 적용
              ]}
            >

              <Image
                source={{
                  uri: categories[current.categoryIndex].data[
                    current.profileIndex
                  ].storyData[current.index].img,
                }}
                resizeMode="contain"
                resizeMethod = "resize"
                style={styles.imageStyle}
              />
              <View
                style={{
                  position: "absolute",
                  backgroundColor: "rgba(255, 255, 255, 0.80)",
                  width: width,
                  marginTop: 460,
                  alignItems: "center",
                  padding: 10,
                }}
              >
                {isReady && (
                  <Text
                    style={{
                      fontSize: 23,
                      lineHeight: 33,
                    }}
                    numberOfLines={7}      
                    ellipsizeMode="tail"  
                  >
                    {
                      categories[current.categoryIndex].data[current.profileIndex]
                        .storyData[current.index].text
                    }
                  </Text>
                )}
              </View>
            </Animated.View>

          </View>
          <View style={styles.statusTabContainer}>
            {categories[current.categoryIndex].data[
              current.profileIndex
            ].storyData.map((story, index) => (
              <View
                key={index}
                style={[
                  styles.statusTab,
                  { marginHorizontal: 3, backgroundColor: "#bbbbbb" },
                ]}
              >
                {current.index === index ? <ProgressView /> : null}
              </View>
            ))}
          </View>
          <TouchableOpacity
            onPress={() => {
              if (!isPaused) {
                if (current.index > 0) {
                  // 현재 스토리 인덱스가 0보다 크면 이전 스토리로 이동
                  setCurrent({ ...current, index: current.index - 1 });
                } else if (current.profileIndex > 0) {
                  // 첫 번째 스토리이고 첫 번째 프로필이 아닐 경우 이전 프로필의 마지막 스토리로 이동
                  const previousProfileIndex = current.profileIndex - 1;
                  const previousProfileStories =
                    categories[current.categoryIndex].data[previousProfileIndex]
                      .storyData;
                  setCurrent({
                    ...current,
                    index: previousProfileStories.length - 1, // 이전 프로필의 마지막 스토리 인덱스
                    profileIndex: previousProfileIndex,
                  });
                }
              }
            }}
            style={[styles.controller, { left: 1, zIndex: 999 }]}
          />
          <TouchableOpacity
            onPress={() => {
              if (!isPaused) {
                let storyData = categories[current.categoryIndex].data[current.profileIndex].storyData;
                if (current.index === storyData.length - 1) {
                  // 현재 스토리가 마지막 스토리일 경우
                  if (current.profileIndex < categories[current.categoryIndex].data.length - 1) {
                    // 다음 프로필로 이동할 때 애니메이션 효과 적용
                    transitionToNextStory(() => {
                      // 애니메이션이 완료된 후 다음 프로필의 첫 번째 스토리로 상태 업데이트
                      setCurrent({
                        index: 0,
                        profileIndex: current.profileIndex + 1,
                        categoryIndex: current.categoryIndex,
                      });
                    });
                  } else {
                    // 마지막 프로필이면 모달 닫기
                    onClose(true);
                  }
                } else {
                  // 다음 스토리로 이동
                  setCurrent({ ...current, index: current.index + 1 });
                }
              }
            }}
            style={[styles.controller, { right: 0, zIndex: 1 }]}
          ></TouchableOpacity>
          <TouchableOpacity
            onPress={showFileNameModal}
            style={{
              position: "absolute",
              right: 40,
              top: 15,
              padding: 10,
              zIndex: 9999,
            }}
          >
            <Image source={linkIcon} style={{ width: 20, height: 20 }} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleStarClick}
            style={{
              position: 'absolute',
              top: 15,
              left: 4,
              padding: 10,
              zIndex: 9999
            }}>
            <Image
              source={currentStory.isStarred ? starIconFilled : starIcon}
              style={styles.starIcon}
            />
          </TouchableOpacity>
          <View style={{position:'absolute', left:43, top:28}}>
            <Text style={{color:'white'}}>{categories[current.categoryIndex].name}</Text>
          </View>
          
          <TouchableOpacity
            onPress={() => onClose(true)}
            style={{
              position: "absolute",
              right: 4,
              top: 15,
              padding: 10,
              zIndex: 9999,
            }}
          >
            <Image source={closeIcon} style={{ width: 20, height: 20 }} />
          </TouchableOpacity>
        </Animated.View>

        {/* 출처 */}
        <View style={styles.pressInfoContainer}>
          <Text style={styles.pressInfoText}>출처:{categories[current.categoryIndex].data[current.profileIndex].press}</Text>
        </View>


        {/* 기사 정보를 보여주는 모달 */}
        <Modal
          visible={isFileNameModalVisible}
          transparent={true}
          animationType="slide-down"
          onRequestClose={closeFileNameModal}
        >
          <View style={styles.modalCenteredView}>
            <View style={styles.modalView}>
              <Text style={styles.modalText}>
                {
                  categories[current.categoryIndex].data[current.profileIndex]
                    .title
                }
              </Text>
              <TouchableOpacity
                onPress={() =>
                  openURL(
                    categories[current.categoryIndex].data[current.profileIndex]
                      .url
                  )
                }
              >
                <Text style={[styles.modalText, { color: 'blue' }]}>{fileName}</Text>
              </TouchableOpacity>
              <View style={styles.tagsContainer}>
                {renderTags()}
              </View>
              <TouchableOpacity
                style={styles.buttonClose}
                onPress={closeFileNameModal}
              >
                <Text style={styles.textStyle}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#000",
    flex: 1,
    paddingHorizontal: 10,
  },
  statusTabContainer: {
    position: "absolute",
    marginTop: 10,
    flexDirection: "row",
    width: "100%",
    zIndex: 40
  },
  statusTab: {
    height: 2,
    backgroundColor: "#bbbbbb",
    flex: 1,
  },
  imageContainer: {
    backgroundColor: "#222",
    height: "100%",
    flex: 1,
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '10%',
    zIndex: 10
  },
  imageStyle: {
    height: "100%",
  },
  controller: {
    position: "absolute",
    width: width / 2,
    height: height * 0.9,
    bottom: 0,
  },
  linkIcon: {
    position: "absolute",
    left: 10,
    top: 10,
    width: 50,
    height: 50,
  },
  starContainer: {
    position: 'absolute',
    top: 10,
    right: 370,
    alignItems: 'center',
    justifyContent: 'center',
  },
  starIcon: {
    width: 23,
    height: 23,
  },
  starCount: {
    color: '#fff',
    fontSize: 10,
  },
  modalCenteredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
  },
  buttonClose: {
    backgroundColor: "#2196F3",
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  pressInfoContainer: {
    position: "absolute",
    bottom: 10,
    left: 10,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    padding: 5,
    borderRadius: 5,
  },
  pressInfoText: {
    color: "#fff",
    fontSize: 14,
  },
  tag: {
    color: 'blue',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 10,
  },
});

export default StoryWrapper;