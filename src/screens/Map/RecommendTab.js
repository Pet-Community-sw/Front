//지도 기반 산책 추천글, 산책 매칭 모달 이동
//마커 클릭 시 피드백, 함께 산책해요 탭으로 이동
//어떤 탭으로 보여줄지만 결정하는 역할.
//실제로 데이터 불러오는 탭은 FeedbackTab, WalkingTogetherTab
import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  StyleSheet,
  Keyboard,
  TouchableOpacity,
  FlatList,
  Image,
  Alert,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import Geocoder from 'react-native-geocoding';
import { useFocusEffect } from '@react-navigation/native';
import {
  useViewLocation,
  useViewPlace,
  useViewRecommendPostDetail,
  useAddRecommend,
} from '../../hooks/useRecommend';
import { WalkingTogetherTab } from './WalkingTogetherTab';
import { FeedbackTab } from './FeedbackTab';
import { usePostComment } from '../../hooks/usePostComment';
import { useLikePost } from '../../hooks/useLikePost';

Geocoder.init('AIzaSyDEkqUwJoRAryq55TTOLdG4IfCqYn7ooC8');

export default function RecommendTab() {
  const [region, setRegion] = useState({
    latitude: 37.648931,
    longitude: 127.064411,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  const [searchInput, setSearchInput] = useState('');
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [usePlaceMode, setUsePlaceMode] = useState(false);
  const [activeTab, setActiveTab] = useState('feedback');
  const [newComment, setNewComment] = useState('');
  const [like, setLike] = useState(false);
  const [writeModalVisible, setWriteModalVisible] = useState(false);
  const [selectingLocation, setSelectingLocation] = useState({
    latitude: 37.648931,
    longitude: 127.064411,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  //산책길 추천 글
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [locationName, setLocationName] = useState("");

  const { mutate: addRecommendPost } = useAddRecommend();

  const { data: locationData = [], refetch: refetchLocation } = useViewLocation({
    minLatitude: region.latitude - region.latitudeDelta / 2,
    maxLatitude: region.latitude + region.latitudeDelta / 2,
    minLongitude: region.longitude - region.longitudeDelta / 2,
    maxLongitude: region.longitude + region.longitudeDelta / 2,
  });

  const { data: placeData = [], refetch: refetchPlace } = useViewPlace({
    latitude: region.latitude,
    longitude: region.longitude,
  });

  const { data: postDetail, refetch: refetchPostDetail } = useViewRecommendPostDetail(
    selectedPostId,
    { enabled: !!selectedPostId }
  );

  const { mutate: addComment } = usePostComment();
  const { mutate: toggleLike } = useLikePost();

  useEffect(() => {
    if (postDetail) setLike(postDetail.like);
  }, [postDetail]);

  useFocusEffect(
    useCallback(() => {
      if (!usePlaceMode) refetchLocation();
    }, [region, usePlaceMode])
  );

  const handleSearch = async () => {
    if (!searchInput.trim()) return alert("장소를 입력해주세요.");
    try {
      const geo = await Geocoder.from(searchInput);
      const { lat, lng } = geo.results[0].geometry.location;
      setRegion({ latitude: lat, longitude: lng, latitudeDelta: 0.02, longitudeDelta: 0.02 });
      await refetchPlace({ latitude: lat, longitude: lng });
      setUsePlaceMode(true);
      setSearchInput('');
      Keyboard.dismiss();
    } catch (err) {
      alert("장소를 찾을 수 없습니다.");
    }
  };

  const postList = usePlaceMode ? placeData : locationData;

  const handleRegionChange = useCallback(
    (newRegion) => {
      if (
        Math.abs(newRegion.latitude - region.latitude) > 0.0001 ||
        Math.abs(newRegion.longitude - region.longitude) > 0.0001
      ) {
        setRegion(newRegion);
        setUsePlaceMode(false);
      }
    },
    [region]
  );

  const handleSubmit = () => {
    if (!title || !content) {
      Alert.alert("제목과 내용을 입력해주세요.");
      return;
    }
    const postData = {
      locationLongitude: region.longitude,
      locationLatitude: region.latitude,
      locationName: locationName || "사용자 선택 위치",
      content,
      title,
    };
    addRecommendPost(postData, {
      onSuccess: () => {
        Alert.alert("등록 완료", "산책길 추천이 등록되었습니다.");
        setWriteModalVisible(false);
        setTitle("");
        setContent("");
      },
      onError: () => {
        Alert.alert("등록 실패", "다시 시도해주세요.");
      },
    });
  };

  useEffect(() => {
    Geocoder.from(region.latitude, region.longitude)
      .then((json) => {
        const address = json.results[0].formatted_address;
        setLocationName(address);
      })
      .catch((error) => console.warn(error));
  }, [region]);

  return (
    <View style={{ flex: 1 }}>
      {/* 검색창 */}
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

      <MapView
        provider="google"
        style={{ flex: 1 }}
        region={region}
        onRegionChangeComplete={handleRegionChange}
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

        {writeModalVisible && (
          <Marker
            coordinate={{
              latitude: region.latitude,
              longitude: region.longitude,
            }}
            title="선택한 위치"
          />
        )}
      </MapView>

      {/* 산책길 추천 추가 버튼 */}
      <TouchableOpacity
        onPress={() => setWriteModalVisible(true)}
        style={{
          position: 'absolute',
          bottom: 30,
          right: 20,
          backgroundColor: '#6A9C89',
          paddingVertical: 12,
          paddingHorizontal: 20,
          borderRadius: 24,
          elevation: 5,
        }}
      >
        <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>산책길 추천 추가</Text>
      </TouchableOpacity>

      {/* 등록 모달 */}
      <Modal visible={writeModalVisible} animationType="fade" transparent>
        <View style={styles.modalWrapper}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>산책길 추천 코스 추가</Text>

            {/* 위치 설정 버튼 */}
            <TouchableOpacity onPress={() => setSelectingLocation(true)}>
              <Text style={{ color: "#4A90E2", marginBottom: 8 }}>
                📍 지도에서 위치 설정하기
              </Text>
              <Text style={{ color: "#444", marginBottom: 6 }}>
                📍 선택한 위치: {locationName || "불러오는 중..."}
              </Text>

            </TouchableOpacity>

            <TextInput
              placeholder="제목을 입력하세요"
              value={title}
              onChangeText={setTitle}
              style={styles.titleInput}
            />
            <TextInput
              placeholder="내용을 입력하세요"
              value={content}
              onChangeText={setContent}
              multiline
              numberOfLines={4}
              style={styles.contentInput}
            />
            <TouchableOpacity style={styles.applyBtn} onPress={handleSubmit}>
              <Text style={styles.applyText}>등록</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setWriteModalVisible(false)}
            >
              <Text style={styles.closeText}>닫기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 지도에서 위치 선택 모달 */}
      <Modal visible={selectingLocation} animationType="slide">
        <View style={{ flex: 1 }}>
          <MapView
            style={{ flex: 1 }}
            region={{
              ...region,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            zoomEnabled={false}
            scrollEnabled={false}
            rotateEnabled={false}
            pitchEnabled={false}
          >
            <Marker coordinate={region} />
          </MapView>


          <TouchableOpacity
            onPress={() => setSelectingLocation(false)}
            style={{
              backgroundColor: "#6A9C89",
              padding: 14,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "white", fontWeight: "bold" }}>
              이 위치로 선택
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}


const styles = StyleSheet.create({
  searchBox: {
    position: "absolute",
    top: 15,
    left: 16,
    right: 16,
    backgroundColor: "white",
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 5,
    zIndex: 10
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    paddingVertical: 4,
  },
  searchButton: {
    backgroundColor: "#8DB596",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    width: "20%",
  },
  searchButtonText: {
    color: "#fff",
    fontSize: 15,
    alignSelf: "center"
  },
  modalWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    width: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  applyBtn: {
    backgroundColor: "#6A9C89",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  applyText: {
    color: "white",
    fontSize: 16,
  },
  closeBtn: {
    marginTop: 10,
    alignItems: "center",
  },
  closeText: {
    color: "#666",
  },
  titleInput: {
    fontSize: 16,
    color: "#333",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
    marginBottom: 12,
  },
  contentInput: {
    fontSize: 16,
    color: "#333",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
    height: 100,
    textAlignVertical: "top",
    marginBottom: 12,
  },
});
