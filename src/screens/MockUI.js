import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  StyleSheet,
  Keyboard,
  TouchableOpacity,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import Geocoder from 'react-native-geocoding';

// 임의 컴포넌트
const FeedbackTab = () => {
  const dummyComments = [
    { id: 1, writer: '쪼꼬미맘', content: '여기 진짜 좋아요!' },
    { id: 2, writer: '두부아빠', content: '사람도 많지 않고 조용해서 강추' },
  ];

  return (
    <View style={styles.tabContent}>
      {dummyComments.map((c) => (
        <View key={c.id} style={styles.commentBox}>
          <Text style={styles.writer}>{c.writer}</Text>
          <Text style={styles.content}>{c.content}</Text>
        </View>
      ))}
    </View>
  );
};

const WalkingTogetherTab = () => {
  const dummyPosts = [
    {
      id: 101,
      petName: '초코',
      scheduledTime: '2025-06-01 17:00',
      limitCount: 3,
      currentCount: 2,
      petImageUrl: 'https://via.placeholder.com/50',
    },
  ];

  return (
    <View style={styles.tabContent}>
      {dummyPosts.map((p) => (
        <View key={p.id} style={styles.card}>
          <View style={styles.circle} />
          <View>
            <Text style={styles.petName}>{p.petName}</Text>
            <Text style={styles.info}>인원: {p.currentCount}/{p.limitCount}</Text>
            <Text style={styles.time}>{p.scheduledTime}</Text>
          </View>
        </View>
      ))}
    </View>
  );
};

Geocoder.init('YOUR_API_KEY');

export default function Mock() {
  const [region, setRegion] = useState({
    latitude: 37.648931,
    longitude: 127.064411,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  const [searchInput, setSearchInput] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('feedback');

  const handleSearch = async () => {
    if (!searchInput.trim()) {
      alert('장소를 입력해주세요.');
      return;
    }

    try {
      const geo = await Geocoder.from(searchInput);
      const { lat, lng } = geo.results[0].geometry.location;

      setRegion({
        latitude: lat,
        longitude: lng,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      });

      setSearchInput('');
      Keyboard.dismiss();
    } catch (err) {
      alert('장소를 찾을 수 없습니다.');
    }
  };

  const handleRegionChange = useCallback(
    (newRegion) => {
      if (
        Math.abs(newRegion.latitude - region.latitude) > 0.0001 ||
        Math.abs(newRegion.longitude - region.longitude) > 0.0001
      ) {
        setRegion(newRegion);
      }
    },
    [region]
  );

  return (
    <View style={{ flex: 1 }}>
      <MapView
        provider="google"
        style={{ flex: 1 }}
        region={region}
        onRegionChangeComplete={handleRegionChange}
      >
        <Marker
          coordinate={{
            latitude: 37.648931,
            longitude: 127.064411,
          }}
          title="추천 산책길"
          description="효빈이가 추천했어요"
          onPress={() => {
            setActiveTab('feedback');
            setModalVisible(true);
          }}
        />
      </MapView>

      <View style={styles.searchBox}>
        <TextInput
          style={styles.input}
          placeholder="📍 장소를 입력해주세요"
          value={searchInput}
          onChangeText={setSearchInput}
          placeholderTextColor="#888"
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>검색</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>한적한 공원 산책길</Text>
            <Text style={styles.modalText}>강아지와 함께 걷기 좋은 조용한 공원이에요!</Text>
            <Text style={styles.modalText}>작성자: 효빈</Text>

            <View style={styles.tabWrapper}>
              <TouchableOpacity
                style={[styles.tabButton, activeTab === 'feedback' && styles.activeTab]}
                onPress={() => setActiveTab('feedback')}
              >
                <Text style={[styles.tabText, activeTab === 'feedback' && styles.activeTabText]}>
                  💬 피드백
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tabButton, activeTab === 'walking' && styles.activeTab]}
                onPress={() => setActiveTab('walking')}
              >
                <Text style={[styles.tabText, activeTab === 'walking' && styles.activeTabText]}>
                  🐾 함께 산책해요
                </Text>
              </TouchableOpacity>
            </View>

            {activeTab === 'feedback' ? <FeedbackTab /> : <WalkingTogetherTab />}

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>닫기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  searchBox: {
    position: 'absolute',
    top: 10,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    zIndex: 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#eee',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 40,
  },
  searchButton: {
    backgroundColor: '#8DB596',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    flexShrink: 0,
    marginRight: 2,
  },
  searchButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 13,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    maxHeight: '85%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  modalText: {
    fontSize: 15,
    marginBottom: 4,
    color: '#555',
  },
  tabWrapper: {
    flexDirection: 'row',
    marginTop: 16,
    marginBottom: 10,
    backgroundColor: '#F0F4F3',
    borderRadius: 12,
    overflow: 'hidden',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#8DB596',
  },
  tabText: {
    fontSize: 14,
    color: '#555',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#fff',
  },
  tabContent: {
    gap: 10,
  },
  commentBox: {
    backgroundColor: '#F9F9F9',
    padding: 10,
    borderRadius: 10,
  },
  writer: {
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    color: '#555',
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#F0F4F3',
    borderRadius: 10,
    padding: 10,
    gap: 12,
    alignItems: 'center',
  },
  circle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#ccc',
  },
  petName: {
    fontWeight: 'bold',
    fontSize: 15,
  },
  info: {
    fontSize: 13,
    color: '#444',
  },
  time: {
    fontSize: 12,
    color: '#888',
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: '#ccc',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    fontWeight: 'bold',
    fontSize: 15,
  },
});
