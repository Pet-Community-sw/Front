//지도 스크린
//산책길 추천 코스 OR 대리 산책자 구하기 탭으로 나뉨
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import RecommendTab from './RecommendTab';
import DelegateTab from './DelegateTab';

export default function MapScreen() {
  const [selectedTab, setSelectedTab] = useState('recommend'); // 기본값: 산책 친구 찾기

  return (
    <View style={styles.container}>
      <View style={styles.tabWrapper}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            selectedTab === 'recommend' ? styles.activeButton : styles.inactiveButton,
          ]}
          onPress={() => setSelectedTab('recommend')}
        >
          <Text
            style={[
              styles.tabText,
              selectedTab === 'recommend' ? styles.activeText : styles.inactiveText,
            ]}
          >
            산책길 추천 코스 & 산책 매칭
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabButton,
            selectedTab === 'delegate' ? styles.activeButton : styles.inactiveButton,
          ]}
          onPress={() => setSelectedTab('delegate')}
        >
          <Text
            style={[
              styles.tabText,
              selectedTab === 'delegate' ? styles.activeText : styles.inactiveText,
            ]}
          >
            대리 산책자 구하기
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.contentArea}>
        {selectedTab === 'recommend' && <RecommendTab />}
        {selectedTab === 'delegate' && <DelegateTab />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F6F6',
  },
  tabWrapper: {
    flexDirection: 'row',
    height: 50,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeButton: {
    backgroundColor: '#8DB596',
  },
  inactiveButton: {
    backgroundColor: '#EAEFEF',
  },
  tabText: {
    fontSize: 15,
    fontFamily: "fontExtra"
  },
  activeText: {
    color: 'white',
  },
  inactiveText: {
    color: '#444',
  },
  contentArea: {
    flex: 1,
  },
});
