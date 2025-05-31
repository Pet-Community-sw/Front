import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Modal,
  Button,
  TextInput,
  StyleSheet,
  Keyboard,
  TouchableOpacity,
} from 'react-native';
import MapView, { Marker,  } from 'react-native-maps';
import Geocoder from 'react-native-geocoding';

Geocoder.init('YOUR_API_KEY'); // 실제 동작 필요 시 유효한 Google Maps API 키

const mockPosts = [
  {
    recommendRoutePostId: 1,
    title: '한적한 공원 산책길',
    content: '강아지와 함께 걷기 좋은 조용한 공원이에요!',
    memberName: '효빈님',
    locationLatitude: 37.648931,
    locationLongitude: 127.064411,
  },
  {
    recommendRoutePostId: 2,
    title: '카페 옆 강변길',
    content: '물소리를 들으며 산책할 수 있는 강변입니다.',
    memberName: '현서님',
    locationLatitude: 37.6495,
    locationLongitude: 127.0622,
  },
];

export default function Mock() {
  const [region, setRegion] = useState({
    latitude: 37.648931,
    longitude: 127.064411,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  const [searchInput, setSearchInput] = useState('');
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

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
      console.error('Geocode error:', err);
      alert('장소를 찾을 수 없습니다. 정확한 명칭으로 다시 시도해주세요.');
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

  const selectedPost = mockPosts.find((post) => post.recommendRoutePostId === selectedPostId);

  return (
    <View style={{ flex: 1 }}>
      <MapView
        provider="google"
        style={{ flex: 1 }}
        region={region}
        onRegionChangeComplete={handleRegionChange}
      >
        {mockPosts.map((post) => (
          <Marker
            key={post.recommendRoutePostId}
            coordinate={{
              latitude: Number(post.locationLatitude),
              longitude: Number(post.locationLongitude),
            }}
            title={post.title}
            description={post.memberName}
            onPress={() => {
              setSelectedPostId(post.recommendRoutePostId);
              setModalVisible(true);
            }}
          />
        ))}
      </MapView>

      <View style={styles.searchBox}>
        <TextInput
          style={styles.input}
          placeholder="📍 원하시는 장소를 입력해주세요"
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
            {selectedPost ? (
              <>
                <Text style={styles.modalTitle}>{selectedPost.title}</Text>
                <Text style={styles.modalText}>{selectedPost.content}</Text>
                <Text style={styles.modalText}>작성자: {selectedPost.memberName}</Text>
              </>
            ) : (
              <Text>불러오는 중...</Text>
            )}
            <Button title="닫기" onPress={() => setModalVisible(false)} />
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
    width: '85%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  modalText: {
    fontSize: 15,
    marginBottom: 6,
  },
});
