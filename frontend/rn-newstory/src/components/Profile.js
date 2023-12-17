import { Pressable, View, Image, Text } from "react-native";
import React, { useState } from "react";
import StoryWrapper from "./StoryWrapper.js";
import { LinearGradient } from 'expo-linear-gradient';

const Profile = ({ categories, categoryIndex, profileIndex, onKeywordSelect }) => {
  const [visible, setVisible] = useState(false);
  const profile = categories[categoryIndex].data[profileIndex];
  const [showFog, setShowFog] = useState(false); // 안개 효과 상태

  const handleStoryComplete = () => {
    setShowFog(true); // 모든 스토리 시청 후 안개 효과 적용
  };

  const handleProfilePress = () => {
    setVisible(!visible);
    setShowFog(true); // 클릭 시 안개 효과 적용
    console.log("프로필선택");
  };

  return (
    <>
      <Pressable onPress={handleProfilePress}>
        <View
          style={{
            padding: 3,
            alignItems: "center",
          }}
        >
          <LinearGradient
            colors={showFog ? ['#ffffff', '#ffffff'] : ['#ffe400', '#5d5d5d']} // 클릭 시 흰색 테두리
            style={{
              width: 94,
              height: 94,
              borderRadius: 47,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <View
              style={{
                width: 90,
                height: 90,
                borderRadius: 45,
                overflow: "hidden",
                position: "relative",
              }}
            >
              {/* 프로필 이미지 */}
              <Image
                style={{
                  width: 90,
                  height: 90,
                  borderRadius: 45,
                }}
                source={{ uri: profile.avatar }}
                resizeMethod = "resize"
              />
              {/* 안개 효과 레이어 */}
              {showFog && (
                <View
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(255, 255, 255, 0.5)', // 흰색 반투명
                    borderRadius: 45,
                  }}
                />
              )}
            </View>
          </LinearGradient>
        </View>
      </Pressable>
      {visible && (
        <StoryWrapper
          categories={categories}
          categoryIndex={categoryIndex}
          profileIndex={profileIndex}
          visible={visible}
          onClose={() => setVisible(false)}
          onStoryComplete={handleStoryComplete} // 콜백 함수 전달
          onKeywordSelect = {onKeywordSelect}
        />
      )}
    </>
  );
};

export default Profile;