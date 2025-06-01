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
} from '../../hooks/useRecommend';
import { WalkingTogetherTab } from './WalkingTogetherTab';
import { FeedbackTab } from './FeedbackTab';
import { usePostComment } from '../../hooks/usePostComment';
import { useLikePost } from '../../hooks/useLikePost';

Geocoder.init('AIzaSyDEkqUwJoRAryq55TTOLdG4IfCqYn7ooC8');

export default function RecommendTab() {
  const [region, setRegion] = useState({    //초기값, 지도 이동, 장소 검색
    latitude: 37.648931,    //위도
    longitude: 127.064411,  //경도
    latitudeDelta: 0.05,    //위아래 줌 정도 (동네 정도)
    longitudeDelta: 0.01,   //좌우 줌 정도
  });

  const [searchInput, setSearchInput] = useState('');   //원하는 장소 입력
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [usePlaceMode, setUsePlaceMode] = useState(false);
  const [activeTab, setActiveTab] = useState('feedback');
  const [newComment, setNewComment] = useState('');
  const [like, setLike] = useState(false);

  const {
    data: locationData = [],
    refetch: refetchLocation,
  } = useViewLocation({
    minLatitude: region.latitude - region.latitudeDelta / 2,
    maxLatitude: region.latitude + region.latitudeDelta / 2,
    minLongitude: region.longitude - region.longitudeDelta / 2,
    maxLongitude: region.longitude + region.longitudeDelta / 2,
  });

  const {
    data: placeData = [],
    refetch: refetchPlace,
  } = useViewPlace({
    latitude: region.latitude,
    longitude: region.longitude,
  });

  const {
    data: postDetail,
    refetch: refetchPostDetail,
  } = useViewRecommendPostDetail(selectedPostId, {
    enabled: !!selectedPostId,
  });

  const { mutate: addComment } = usePostComment();
  const { mutate: toggleLike } = useLikePost();

  //게시글 상세 불러올 때마다 좋아요 수 새로고침
  useEffect(() => {
    if (postDetail) {
      setLike(postDetail.like);
    }
  }, [postDetail]);

  //지도 움직일 시, 마커 새로 받아옴
  useFocusEffect(
    useCallback(() => {
      if (!usePlaceMode) {
        refetchLocation();
      }
    }, [region, usePlaceMode])
  );

  //사용자가 장소 입력 시, 장소 1km 반경 마커 받아옴
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

  //지도 or 장소 글 목록 가져옴
  const postList = usePlaceMode ? placeData : locationData;

  const handleRegionChange = useCallback(
    (newRegion) => {
      if (    //약 10m 정도 이동해야 렌더링
        Math.abs(newRegion.latitude - region.latitude) > 0.0001 ||
        Math.abs(newRegion.longitude - region.longitude) > 0.0001
      ) {
        setRegion(newRegion);
        setUsePlaceMode(false);
      }
    },
    [region]
  );

  //댓글 반영
  const handleAddComment = () => {
    if (!newComment.trim()) return;
    addComment(
      {
        postId: selectedPostId,
        content: newComment,
        postType: 'RECOMMEND',
      },
      {
        onSuccess: () => {
          refetchPostDetail();
          setNewComment('');
        },
        onError: () => {
          Alert.alert('댓글 등록 실패', '잠시 후 다시 시도해주세요.');
        },
      }
    );
  };

  //좋아요 반영
  const handleToggleLike = () => {
    toggleLike(
      {
        postId: selectedPostId, // = recommendRoutePostId
        postType: "RECOMMEND",
      },
      {
        onSuccess: () => {
          setLike((prev) => !prev);
          refetchPostDetail(); 
        },
        onError: () => {
          Alert.alert("오류", "좋아요 요청에 실패했습니다.");
        },
      }
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <MapView
        provider="google"
        style={{ flex: 1 }}
        region={region}
        onRegionChangeComplete={handleRegionChange}
      >
        {/* 마커 표시 */}
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

      {/* 피드백, 함께 산책해요 탭으로 나뉨 */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {postDetail ? (
              <>
                <Text style={styles.modalTitle}>{postDetail.title}</Text>
                <Text style={styles.modalText}>{postDetail.content}</Text>
                <Text style={styles.modalText}>작성자: {postDetail.memberName}</Text>

                <TouchableOpacity
                  style={{ marginVertical: 8 }}
                  onPress={handleToggleLike}
                >
                  <Text style={{ fontSize: 16 }}>{like ? '❤️ 좋아요 취소' : '🤍 좋아요'}</Text>
                </TouchableOpacity>

                <FlatList
                  data={postDetail.comments}
                  keyExtractor={(item) => item.commentId.toString()}
                  renderItem={({ item }) => (
                    <View style={{ marginVertical: 4 }}>
                      <Text style={{ fontWeight: 'bold' }}>{item.memberName}</Text>
                      <Text>{item.content}</Text>
                      <Text style={{ fontSize: 12, color: '#888' }}>{item.createdAt}</Text>
                    </View>
                  )}
                  ListHeaderComponent={<Text style={{ fontSize: 16, fontWeight: 'bold' }}>💬 댓글</Text>}
                  ListEmptyComponent={<Text>댓글이 아직 없어요.</Text>}
                />

                <View style={{ flexDirection: 'row', marginTop: 10 }}>
                  <TextInput
                    value={newComment}
                    onChangeText={setNewComment}
                    placeholder="댓글을 입력하세요"
                    style={{ flex: 1, borderColor: '#ccc', borderWidth: 1, borderRadius: 8, padding: 8 }}
                  />
                  <TouchableOpacity
                    onPress={handleAddComment}
                    style={{ marginLeft: 8, paddingVertical: 10, paddingHorizontal: 14, backgroundColor: '#8DB596', borderRadius: 8 }}
                  >
                    <Text style={{ color: '#fff' }}>등록</Text>
                  </TouchableOpacity>
                </View>

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

                <View style={styles.tabContent}>
                  {activeTab === 'feedback' ? (
                    <FeedbackTab recommendRoutePostId={postDetail.recommendRoutePostId} />
                  ) : (
                    <WalkingTogetherTab recommendRoutePostId={postDetail.recommendRoutePostId} />
                  )}
                </View>
              </>
            ) : (
              <Text>불러오는 중...</Text>
            )}

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
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    paddingVertical: 4,
    fontFamily: "font"
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
    fontFamily: "fontExtra", 
    fontSize: 15,
    alignSelf: "center"
  },
  emptyBox: {
    position: "absolute",
    top: 100,
    alignSelf: "center",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  emptyText: {
    color: "#999",
    fontSize: 14,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    maxHeight: "90%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalText: {
    fontSize: 14,
    marginBottom: 6,
    color: "#333",
  },
  closeButton: {
    marginTop: 20,
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 14,
    color: "#999",
  },
  tabWrapper: {
  flexDirection: 'row',
  backgroundColor: '#F0F4F3',
  borderRadius: 12,
  overflow: 'hidden',
  marginTop: 20,
  marginBottom: 12,
},
tabButton: {
  flex: 1,
  paddingVertical: 10,
  alignItems: 'center',
},
activeTab: {
  backgroundColor: '#8DB596',
},
tabText: {
  fontSize: 14,
  fontWeight: '600',
  color: '#777',
},
activeTabText: {
  color: '#fff',
},
tabContent: {
  backgroundColor: '#FAFAFA',
  borderRadius: 12,
  padding: 12,
  borderWidth: 1,
  borderColor: '#E0E0E0',
},

});
