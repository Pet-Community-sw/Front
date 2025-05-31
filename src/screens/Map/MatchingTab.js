//지도 기반 산책 추천글, 산책 매칭 모달 이동
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
import MapView, { Marker } from 'react-native-maps';
import Geocoder from 'react-native-geocoding';
import { useFocusEffect } from '@react-navigation/native';
import {
  useViewLocation,
  useViewPlace,
  useViewRecommendPostDetail,
} from '../../hooks/useRecommend';

Geocoder.init('AIzaSyDEkqUwJoRAryq55TTOLdG4IfCqYn7ooC8');

export default function MatchingTab() {
  const [region, setRegion] = useState({  //중심 좌표, 확대 정도 저장
    latitude: 37.648931,    //중심 위도
    longitude: 127.064411,  //중심 경도
    latitudeDelta: 0.05,    //위아래 전체 높이(줌 정도), 위로 약 3키로 정도
    longitudeDelta: 0.05,   //좌우 전체 너비(줌 정도), 아래로 약 3키로 정도
  });

  const [searchInput, setSearchInput] = useState('');
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [usePlaceMode, setUsePlaceMode] = useState(false);

  const {
    data: locationData = [],
    refetch: refetchLocation,
  } = useViewLocation({
    minLatitude: region.latitude - region.latitudeDelta / 2,    //남쪽 하단
    maxLatitude: region.latitude + region.latitudeDelta / 2,    //북쪽 상단
    minLongitude: region.longitude - region.longitudeDelta / 2, //서쪽
    maxLongitude: region.longitude + region.longitudeDelta / 2, //남쪽
  });

  const {
    data: placeData = [],
    refetch: refetchPlace,
  } = useViewPlace({
    latitude: region.latitude,
    longitude: region.longitude,
  });

  const { data: postDetail } = useViewRecommendPostDetail(selectedPostId);
  
  //지도 영역이 바뀌면 추천글 데이터 새로 불러옴
  //단, usePlace 모드 일때는 다시 불러오지 않음
  useFocusEffect(
    useCallback(() => {
      if (!usePlaceMode) {
        refetchLocation();
      }
    }, [region, usePlaceMode])
  );

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

      await refetchPlace({ latitude: lat, longitude: lng });

      setUsePlaceMode(true);
      setSearchInput('');
      Keyboard.dismiss();
    } catch (err) {
      console.error('Geocode error:', err);
      alert('장소를 찾을 수 없습니다. 정확한 명칭으로 다시 시도해주세요.');
    }
  };

  const postList = usePlaceMode ? placeData : locationData;

  const handleRegionChange = useCallback(
    (newRegion) => {
      if (  //기존 좌표와 바뀐 좌표의 차이가 어느정도 날 때만 (대략 10m)
        Math.abs(newRegion.latitude - region.latitude) > 0.0001 ||
        Math.abs(newRegion.longitude - region.longitude) > 0.0001
      ) {
        setRegion(newRegion);
        setUsePlaceMode(false);
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
        onRegionChangeComplete={handleRegionChange}   //지도가 움직일 때마다 좌표 확인
      >
        {postList.map((post) => (
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

      {usePlaceMode && postList.length === 0 && (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>해당 지역에 추천글이 없습니다.</Text>
        </View>
      )}

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
            {postDetail ? (
              <>
                <Text style={styles.modalTitle}>{postDetail.title}</Text>
                <Text style={styles.modalText}>{postDetail.content}</Text>
                <Text style={styles.modalText}>작성자: {postDetail.memberName}</Text>
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
    backgroundColor: 'rgba(255, 255, 255, 0.9)', // 반투명 배경
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
  emptyBox: {
    position: 'absolute',
    top: 100,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  emptyText: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 10,
    elevation: 3,
  },
});
