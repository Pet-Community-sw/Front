import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function MapScreen() {
  const [selectedTab, setSelectedTab] = useState('matching'); // 기본값: 산책 매칭

  return (
    <View style={styles.container}>
      <View style={styles.tabWrapper}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            selectedTab === 'matching' ? styles.activeButton : styles.inactiveButton,
          ]}
          onPress={() => setSelectedTab('matching')}
        >
          <Text
            style={[
              styles.tabText,
              selectedTab === 'matching' ? styles.activeText : styles.inactiveText,
            ]}
          >
            산책길 추천 & 매칭
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
            대리 산책자
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.contentArea}>
        {selectedTab === 'matching' ? (
          <Text style={styles.fakeContent}>[산책길 추천 & 매칭 화면]</Text>
        ) : (
          <Text style={styles.fakeContent}>[대리 산책자 화면]</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    backgroundColor: '#F6F6F6',
    paddingHorizontal: 20,
  },
  tabWrapper: {
    flexDirection: 'row',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#537D5D',
    marginTop: -40, 
  },
  tabButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeButton: {
    backgroundColor: '#D2D0A0',
  },
  inactiveButton: {
    backgroundColor: '#E0E0E0',
  },
  tabText: {
    fontSize: 20,
    fontFamily: 'cute',
  },
  activeText: {
    color: 'black',
  },
  inactiveText: {
    color: '#666',
  },
  contentArea: {
    marginTop: 40,
    alignItems: 'center',
  },
  fakeContent: {
    fontSize: 18,
    color: '#333',
    fontWeight: '500',
  },
});
