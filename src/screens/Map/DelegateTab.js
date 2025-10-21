// screens/DelegateTab.js
import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
  Image,
  ScrollView,
  FlatList,
  TextInput,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import Geocoder from "react-native-geocoding";
import { useFocusEffect } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import { debounce } from "lodash";
import {
  useAddDelegate,
  useViewLocationDelegate,
  useViewDelegatePostDetail,
  useViewDelegateApplicants,
  useApplicateDelegate,
  useSelectDelegateApplicant,
  useAuthDelegateRecord,
  useStartAuthorizedDelegate,
  useStartDelegateWalk,
} from "../../hooks/useDelegate";
import { useViewProfile } from "../../hooks/useProfile";
import { useProfileSession } from "../../context/SelectProfile";
import { useWalkStart, useWalkFinish, useGetWalkLocation } from "../../hooks/useWalkRecord";
import { BASE_URL } from "../../api/apiClient";

// Geocoder 초기화
Geocoder.init("AIzaSyDEkqUwJoRAryq55TTOLdG4IfCqYn7ooC8");

import DelegateWriteModal from "../../components/Modal/delegateWriteModal";

const DelegateTab = () => {
  // ------------------ 상태 ------------------
  const [modalVisible, setModalVisible] = useState(false); // 글쓰기 modal
  const [selectProfileModalVisible, setSelectProfileModalVisible] =
    useState(false); // 프로필 선택 modal
  const [selectingLocationVisible, setSelectingLocationVisible] =
    useState(false); // 위치 선택 모드
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [selectedPetProfileId, setSelectedPetProfileId] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false); // 상세 조회 modal
  const [selectedPosts, setSelectedPosts] = useState(new Set()); // 선정된 게시글 ID들
  const [selectedApplicants, setSelectedApplicants] = useState(new Map()); // 게시글별 선정된 지원자 ID
  const [authorizedPosts, setAuthorizedPosts] = useState(new Set()); // 권한 부여된 게시글 ID들
  const [chatRoomIds, setChatRoomIds] = useState(new Map()); // 게시글별 채팅방 ID
  const [walkRecordId, setWalkRecordId] = useState(null);
  const [isWalkStarted, setIsWalkStarted] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [locationName, setLocationName] = useState("");
  const [showBubble, setShowBubble] = useState(true); // 말풍선 표시 여부
  const [supportMessageModalVisible, setSupportMessageModalVisible] = useState(false); // 지원 메시지 입력 모달
  const [supportMessage, setSupportMessage] = useState(""); // 지원 메시지

  // 글쓰기 폼 상태
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [price, setPrice] = useState("");
  const [scheduledTime, setScheduledTime] = useState(null);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [requireProfile, setRequireProfile] = useState(true);
  const [locationLatitude, setLocationLatitude] = useState(null);
  const [locationLongitude, setLocationLongitude] = useState(null);
  const [allowedRadiusMeters, setAllowedRadiusMeters] = useState("");

  // ------------------ API ------------------
  // 플러스 버튼을 눌렀을 때만 데이터 조회
  const { data: postList = [], refetch: refetchPosts, isLoading, error } =
    useViewLocationDelegate({
      minLatitude: 37.643931,
      maxLatitude: 37.653931,
      minLongitude: 127.059411,
      maxLongitude: 127.069411,
    });
  const { mutate: createDelegatePost } = useAddDelegate();
  const { mutate: applyDelegate } = useApplicateDelegate(() => {
    // 지원 성공 시 모달 닫기
    setDetailModalVisible(false);
  });
  const { mutate: selectApplicant } = useSelectDelegateApplicant((data, variables) => {
    // 지원자 선정 성공 시 해당 게시글과 지원자 ID, 채팅방 ID를 저장
    const selectedMemberId = variables?.memberId; // API 호출 시 전달한 memberId 사용 (안전하게)
    const chatRoomId = data?.chatRoomId;
    
      console.log("선정 콜백 호출됨:", { selectedPostId, selectedMemberId, chatRoomId });
      console.log("selectedPostId 타입:", typeof selectedPostId);
      console.log("selectedMemberId 타입:", typeof selectedMemberId);
      console.log("chatRoomId:", chatRoomId);
      console.log("variables:", variables);
      console.log("data:", data);
    
    if (selectedPostId && selectedMemberId) {
      setSelectedPosts(prev => {
        const newSet = new Set([...prev, selectedPostId]);
        console.log("selectedPosts 업데이트:", newSet);
        return newSet;
      });
      setSelectedApplicants(prev => {
        const newMap = new Map([...prev, [selectedPostId, selectedMemberId]]);
        console.log("selectedApplicants 업데이트:", newMap);
        console.log("Map에 저장된 키-값 쌍:", Array.from(newMap.entries()));
        return newMap;
      });
      if (chatRoomId) {
        setChatRoomIds(prev => {
          const newMap = new Map([...prev, [selectedPostId, chatRoomId]]);
          console.log("chatRoomIds 업데이트:", newMap);
          return newMap;
        });
      }
      
      // 지원자 선정 후 자동으로 권한 부여
      console.log("지원자 선정 후 권한 부여 시작");
      console.log("authRecord 호출 전:", { selectedPostId });
      try {
        authRecord({ delegateWalkPostId: selectedPostId });
        console.log("authRecord 호출 완료");
      } catch (error) {
        console.error("authRecord 호출 에러:", error);
        // 권한 부여 실패 시에도 임시로 권한 부여된 것으로 처리
        console.log("권한 부여 실패, 임시로 권한 부여 처리");
        setAuthorizedPosts(prev => {
          const newSet = new Set([...prev, selectedPostId]);
          console.log("임시 authorizedPosts 업데이트:", newSet);
          return newSet;
        });
      }
      
      // 권한 부여 API 상태 확인을 위한 추가 로그
      console.log("authRecord 함수:", authRecord);
      console.log("authRecord 타입:", typeof authRecord);
      
      console.log("지원자 선정 완료, 게시글 ID:", selectedPostId, "선정된 지원자 ID:", selectedMemberId, "채팅방 ID:", chatRoomId);
    }
  });
  const { mutate: authRecord } = useAuthDelegateRecord(() => {
    // 권한 부여 성공 시 해당 게시글을 권한 부여된 목록에 추가
    console.log("authRecord 콜백 실행됨!");
    console.log("selectedPostId:", selectedPostId);
    if (selectedPostId) {
      setAuthorizedPosts(prev => {
        const newSet = new Set([...prev, selectedPostId]);
        console.log("권한 부여 완료, 게시글 ID:", selectedPostId);
        console.log("authorizedPosts 업데이트:", newSet);
        return newSet;
      });
    } else {
      console.log("selectedPostId가 없음:", selectedPostId);
    }
  });
  const { mutate: startWalk } = useWalkStart();
  const { mutate: finishWalk } = useWalkFinish();
  const { data: profiles = [], refetch: refetchProfiles } = useViewProfile();
  const { selectProfile } = useProfileSession();

  // 현재 사용자 ID (임시로 첫 번째 프로필 ID 사용)
  const currentUserId = profiles?.[0]?.profileId || null;

  // 상세 조회 API
  const { data: postDetail, isLoading: isDetailLoading, error: detailError } = useViewDelegatePostDetail(selectedPostId);
  const { data: applicants, isLoading: isApplicantsLoading, error: applicantsError } = useViewDelegateApplicants(selectedPostId);
  
  // 상세 조회 데이터 로그
  console.log("🔍 selectedPostId:", selectedPostId);
  console.log("🔍 postDetail:", postDetail);
  console.log("🔍 isDetailLoading:", isDetailLoading);
  console.log("👥 applicants:", applicants);
  console.log("👥 isApplicantsLoading:", isApplicantsLoading);
  console.log("🔍 detailError:", detailError);

  // 위치 좌표를 주소로 변환하는 함수
  const convertLocationToAddress = async (latitude, longitude) => {
    try {
      const response = await Geocoder.from(latitude, longitude);
      const address = response.results[0].formatted_address;
      setLocationName(address);
    } catch (error) {
      console.error("❌ 위치 변환 실패:", error);
      setLocationName("위치 정보를 가져올 수 없습니다.");
    }
  };

  
  // selectedPostId가 변경될 때마다 로그
  React.useEffect(() => {
    if (selectedPostId) {
      console.log("🚀 selectedPostId 변경됨:", selectedPostId);
    }
  }, [selectedPostId]);

  // postDetail이 로드되면 위치 변환
  React.useEffect(() => {
    if (postDetail && postDetail.locationLatitude && postDetail.locationLongitude) {
      convertLocationToAddress(postDetail.locationLatitude, postDetail.locationLongitude);
    }
  }, [postDetail]);


  // ------------------ 지도 초기 위치 ------------------
  const [region, setRegion] = useState({
    latitude: 37.648931,
    longitude: 127.064411,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  const [selectedLocation, setSelectedLocation] = useState(region);

  // 탭 들어올 때 프로필만 조회
  useFocusEffect(
    useCallback(() => {
      // 프로필만 조회, 대리 산책자 글은 플러스 버튼을 눌렀을 때만 조회
      refetchProfiles();
      setSelectProfileModalVisible(true);
    }, [])
  );

  // 프로필 선택
  const handleSelectProfile = async () => {
    console.log("🚀 handleSelectProfile 시작, selectedPetProfileId:", selectedPetProfileId);
    
    if (!selectedPetProfileId) {
      console.log("❌ selectedPetProfileId가 없음");
      return;
    }
    
    try {
      console.log("🔄 selectProfile 호출 시작...");
      await selectProfile(selectedPetProfileId);
      console.log("✅ selectProfile 완료");
      
      await new Promise((resolve) => setTimeout(resolve, 200)); // 토큰 반영 대기 시간 증가
      console.log("⏰ 대기 완료");
      
      setSelectProfileModalVisible(false);
      // 프로필 선택 완료 후 데이터 조회
      console.log("🔄 프로필 선택 완료, 데이터 조회 시작");
      setTimeout(() => {
        refetchPosts();
      }, 500); // 토큰 반영을 위한 추가 대기 시간
      console.log("🎉 모달 전환 완료");
    } catch (error) {
      console.error("❌ selectProfile error:", error);
      Alert.alert("오류", "프로필 선택 중 문제가 발생했습니다.");
    }
  };

  // 글 등록
  const handleAddPost = () => {
    console.log("🚀 handleAddPost 시작");
    
    if (
      !title ||
      !content ||
      !price ||
      !locationLatitude ||
      !locationLongitude
    ) {
      Alert.alert("입력 오류", "제목/내용/가격/위치를 모두 입력해주세요.");
      return;
    }

    const payload = {
        title,
        content,
        price: Number(price),
        locationLongitude: Number(locationLongitude),
        locationLatitude: Number(locationLatitude),
      allowedRadiusMeters: Number(allowedRadiusMeters),
      scheduledTime: scheduledTime ? scheduledTime.toISOString() : null,
        requireProfile,
    };

    console.log("📤 Delegate Post 요청 payload:", JSON.stringify(payload, null, 2));
    console.log("🔄 createDelegatePost 호출 중...");

    createDelegatePost(payload, {
      onSuccess: (data) => {
        console.log("✅ API 요청 성공:", data);
        Alert.alert("등록 완료", "대리 산책자 글이 등록되었습니다!");
        setModalVisible(false);
          resetForm();
        // 등록 성공 후 목록 새로고침
        console.log("🔄 등록 완료, 목록 새로고침 시작");
        refetchPosts();
      },
      onError: (err) => {
        console.error("❌ API 요청 실패:", err);
        console.error("❌ 에러 상세:", {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status,
        });
        Alert.alert("등록 실패", err.message || "서버 오류");
      },
    });
  };

  const resetForm = () => {
    setTitle("");
    setContent("");
    setPrice("");
    setScheduledTime(null);
    setRequireProfile(false);
    setLocationLatitude(null);
    setLocationLongitude(null);
  };

  // 🔹 지도 이동 시 디바운스로 데이터 리패치
  const debouncedRefetch = useCallback(
    debounce(() => {
      console.log("🔄 지도 이동 감지, 데이터 새로고침");
      refetchPosts();
    }, 800),
    []
  );

  const handleRegionChange = (newRegion) => {
    const latMoved = Math.abs(newRegion.latitude - region.latitude) > 0.0005;
    const lngMoved = Math.abs(newRegion.longitude - region.longitude) > 0.0005;
    
    if (latMoved || lngMoved) {
      console.log("🗺️ 지도 영역 변경:", {
        from: { lat: region.latitude, lng: region.longitude },
        to: { lat: newRegion.latitude, lng: newRegion.longitude }
      });
      setRegion(newRegion);
      debouncedRefetch();
    }
  };
  const handleSelectingRegion = (r) => setSelectedLocation(r);

  return (
    <View style={styles.container}>
      {/* ✅ 지도 본체 */}
      <MapView
        provider="google"
        style={{ flex: 1 }}
        region={selectingLocationVisible ? selectedLocation : region}
        zoomControlEnabled
        zoomEnabled
        onRegionChangeComplete={
          selectingLocationVisible ? handleSelectingRegion : handleRegionChange
        }
      >


        {/* 기본 모드일 때만 게시글 마커 표시 */}
        {!selectingLocationVisible &&
          Array.isArray(postList) &&
          postList.length > 0 &&
          postList.map((post, index) => {
            console.log("🗺️ delegateWalkPostId:", post.delegateWalkPostId);
            // 위치가 0,0인 경우 테스트용 위치 사용
            let latitude = Number(post.locationLatitude);
            let longitude = Number(post.locationLongitude);
            
            if (latitude === 0 && longitude === 0) {
              // 서울 근처 테스트용 위치들
              const testLocations = [
                { lat: 37.5665, lng: 126.9780 }, // 서울시청
                { lat: 37.5665, lng: 126.9780 + (index * 0.01) }, // 약간씩 다른 위치
                { lat: 37.5665 + (index * 0.01), lng: 126.9780 },
              ];
              const testLoc = testLocations[index % testLocations.length];
              latitude = testLoc.lat;
              longitude = testLoc.lng;
            }
            
            // 유효한 좌표인지 확인
            if (!latitude || !longitude || isNaN(latitude) || isNaN(longitude)) {
              return null;
            }
            
            return (
            <Marker
              key={`marker-${post.delegatePostId || index}-${Date.now()}`}
              coordinate={{
                latitude: latitude,
                longitude: longitude,
              }}
              title={post.title}
              description={post.content}
              onPress={() => {
                console.log("🎯 마커 클릭됨, 전체 post 객체:", post);
                console.log("🎯 마커 클릭됨, delegateWalkPostId:", post.delegateWalkPostId);
                console.log("🎯 마커 클릭됨, postId:", post.postId);
                console.log("🎯 마커 클릭됨, id:", post.id);
                // delegateWalkPostId를 우선적으로 사용
                const finalPostId = post.delegateWalkPostId;
                
                if (!finalPostId) {
                  console.error("❌ delegateWalkPostId가 없습니다!");
                  console.error("❌ post 객체:", post);
                  Alert.alert("오류", "게시글 ID를 찾을 수 없습니다.");
                  return;
                }
                
                setSelectedPostId(finalPostId);
                setDetailModalVisible(true);
                console.log("🎯 selectedPostId 설정 완료:", finalPostId);
                console.log("🎯 finalPostId 타입:", typeof finalPostId);
              }}
              tracksViewChanges={false}
            >
              <MaterialIcons 
                name="place" 
                size={50} 
                color={selectedPosts.has(post.delegateWalkPostId || post.postId || post.id) ? "#000000" : "#FF0000"} 
              />
            </Marker>
            );
          })}
      </MapView>

      {/* 🔹 귀여운 말풍선 */}
      {showBubble && !selectingLocationVisible && !modalVisible && (
        <View style={styles.bubbleContainer}>
          <View style={styles.bubble}>
            <Text style={styles.bubbleText}>🐕🤝</Text>
            <Text style={styles.bubbleMessage}>
              아이콘의 위치는 {'\n'}반려동물을 넘겨주는 곳입니다!
            </Text>
      <TouchableOpacity
              style={styles.bubbleCloseButton}
              onPress={() => setShowBubble(false)}
      >
              <Text style={styles.bubbleCloseText}>×</Text>
      </TouchableOpacity>
            <View style={styles.bubbleTail} />
          </View>
        </View>
      )}

      {/* ✅ 위치 선택 모드일 때만 중앙 마커 + 안내 표시 */}
      {selectingLocationVisible && (
        <>
          {/* 중앙 마커 */}
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: [{ translateX: -20 }, { translateY: -40 }],
            }}
          >
            <MaterialIcons name="place" size={40} color="#E53935" />
          </View>

          {/* 하단 안내 + 버튼 */}
          <View style={styles.overlayBottom}>
            <Text style={styles.overlayText}>
              📍 지도를 움직여 위치를 선택하세요
            </Text>

          <TouchableOpacity
              style={styles.applyBtn}
              onPress={async () => {
                // 선택된 위치의 주소를 변환
                try {
                  const response = await Geocoder.from(selectedLocation.latitude, selectedLocation.longitude);
                  const address = response.results[0].formatted_address;
                  setLocationName(address); // 입력창에 표시될 주소 설정
                } catch (error) {
                  console.error("❌ 위치 변환 실패:", error);
                  setLocationName("위치 정보를 가져올 수 없습니다.");
                }
                
                setLocationLatitude(selectedLocation.latitude);
                setLocationLongitude(selectedLocation.longitude);
                setSelectingLocationVisible(false);
              setModalVisible(true);
            }}
          >
              <Text style={styles.applyText}>이 위치로 선택</Text>
          </TouchableOpacity>

            <TouchableOpacity
              style={{ marginTop: 10 }}
              onPress={() => setSelectingLocationVisible(false)}
            >
              <Text style={styles.closeText}>닫기</Text>
            </TouchableOpacity>
          </View>
        </>
      )}



      {/* 대리 산책자 구하기 버튼 */}
      {!selectingLocationVisible && (
        <TouchableOpacity style={styles.delegateButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.delegateButtonText}>🐕 대리 산책자 구하기</Text>
        </TouchableOpacity>
      )}

      {/* 🐾 프로필 선택 모달 */}
      <Modal
        visible={selectProfileModalVisible}
        animationType="slide"
        transparent
      >
        <View style={styles.profileModalWrapper}>
          <View style={styles.profileModalContent}>
            <ScrollView style={{ maxHeight: 360 }}>
              <Text style={styles.profileModalTitle}>
                🐶 대리 산책할 펫을 선택하세요
              </Text>

              {Array.isArray(profiles) && profiles.length === 0 && (
                <Text style={{ color: "#666", marginBottom: 12 }}>
                  등록된 프로필이 없습니다. 먼저 프로필을 추가해주세요.
                </Text>
              )}

              {profiles.map((profile) => (
                <TouchableOpacity
                  key={profile.profileId}
                  style={[
                    styles.profileCard,
                    selectedPetProfileId === profile.profileId && {
                      borderColor: "#7EC8C2",
                      borderWidth: 2,
                    },
                  ]}
                  onPress={() => setSelectedPetProfileId(profile.profileId)}
                >
                  <Image
                    source={
                      profile.petImageUrl
                        ? { uri: `${BASE_URL}${profile.petImageUrl}` }
                        : require("../../../assets/icon.png")
                    }
                    style={styles.profileImage}
                  />
                  <Text style={styles.profileName}>{profile.petName}</Text>
                </TouchableOpacity>
              ))}

              <TouchableOpacity
                style={[
                  styles.profileApplyBtn,
                  { opacity: selectedPetProfileId ? 1 : 0.6 },
                ]}
                disabled={!selectedPetProfileId}
                onPress={handleSelectProfile}
              >
                <Text style={styles.profileApplyText}>선택하기</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.profileApplyBtn, { backgroundColor: "#ccc" }]}
                onPress={() => setSelectProfileModalVisible(false)}
              >
                <Text style={styles.profileApplyText}>닫기</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 📝 글쓰기 모달 */}
      <DelegateWriteModal
        visible={modalVisible}
        title={title}
        setTitle={setTitle}
        content={content}
        setContent={setContent}
        price={price}
        setPrice={setPrice}
        scheduledTime={scheduledTime}
        setDatePickerVisibility={setDatePickerVisibility}
        isDatePickerVisible={isDatePickerVisible}
        handleConfirmDate={(date) => {
          setScheduledTime(date);
          setDatePickerVisibility(false);
        }}
        requireProfile={requireProfile}
        setRequireProfile={setRequireProfile}
        locationName={locationName}
        onSubmit={handleAddPost}
        onClose={() => setModalVisible(false)}
        locationLatitude={locationLatitude}
        locationLongitude={locationLongitude}
        allowedRadiusMeters={allowedRadiusMeters}
        setAllowedRadiusMeters={setAllowedRadiusMeters}
        onOpenLocation={() => {
          // 글쓰기 → 지도 선택 모드로 전환
          setModalVisible(false);
          setSelectingLocationVisible(true);
        }}
      />

      {/* 상세 조회 모달 */}
      <Modal
        visible={detailModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setDetailModalVisible(false)}
      >
        <View style={styles.detailModalWrapper}>
          <View style={styles.detailModalContent}>
            <View style={styles.detailModalHeader}>
              <Text style={styles.detailModalTitle}>🐕 대리 산책자 상세</Text>
              <TouchableOpacity
                onPress={() => setDetailModalVisible(false)}
                style={styles.detailCloseButton}
              >
                <MaterialIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            {isDetailLoading ? (
              <View style={styles.detailLoadingContainer}>
                <Text style={styles.detailLoadingText}>📱 로딩 중...</Text>
              </View>
            ) : detailError ? (
              <View style={styles.detailErrorContainer}>
                <Text style={styles.detailErrorText}>❌ 에러가 발생했습니다: {detailError.message}</Text>
              </View>
            ) : postDetail ? (
              <ScrollView style={styles.detailModalBody} showsVerticalScrollIndicator={false}>
                {/* 게시글 정보 카드 */}
                <View style={styles.detailCard}>
                  <View style={styles.detailTitleRow}>
                    <Text style={styles.detailTitle}>{postDetail.postResponseDto?.title || "제목이 없습니다."}</Text>
                    <TouchableOpacity style={styles.detailHeartButton}>
                      <Text style={[styles.detailHeart, postDetail.postResponseDto?.like ? styles.detailHeartFilled : styles.detailHeartEmpty]}>
                        {postDetail.postResponseDto?.like ? "❤️" : "🤍"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.detailContent}>{postDetail.content || "내용이 없습니다."}</Text>

                  {/* 반려동물 정보 - 제목과 내용 바로 아래 */}
                  <View style={styles.detailPetSection}>
                    <View style={styles.detailPetInfo}>
                      {postDetail.petImageUrl && (
                        <Image
                          source={{ uri: `${BASE_URL}${postDetail.petImageUrl}` }}
                          style={styles.detailPetImage}
                        />
                      )}
                      <View style={styles.detailPetText}>
                        <Text style={styles.detailPetName}>{postDetail.petName || "정보 없음"}</Text>
                        <Text style={styles.detailPetLabel}>반려동물</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.detailMetaRow}>
                    <View style={styles.detailMetaItem}>
                      <Text style={styles.detailMetaLabel}>💰 가격</Text>
                      <Text style={styles.detailMetaValue}>{postDetail.price || 0}원</Text>
                    </View>
                    <View style={styles.detailMetaItem}>
                      <Text style={styles.detailMetaLabel}>📅 예정시간</Text>
                      <Text style={styles.detailMetaValue}>
                        {postDetail.scheduledTime ? new Date(postDetail.scheduledTime).toLocaleString() : "미정"}
                      </Text>
                    </View>
                  </View>

                  {/* 추가 정보 섹션 */}
                  <View style={styles.detailAdditionalInfo}>
                    <View style={styles.detailInfoRow}>
                      <Text style={styles.detailInfoLabel}>📍 위치</Text>
                      <Text style={styles.detailInfoValue}>
                        {locationName || "위치 정보를 불러오는 중..."}
                      </Text>
                    </View>
                    <View style={styles.detailInfoRow}>
                      <Text style={styles.detailInfoLabel}>📊 지원자 수</Text>
                      <Text style={styles.detailInfoValue}>{postDetail.applicantCount || 0}명</Text>
                    </View>
                    <View style={styles.detailInfoRow}>
                      <Text style={styles.detailInfoLabel}>⏰ 작성시간</Text>
                      <Text style={styles.detailInfoValue}>{postDetail.createdAt || "정보 없음"}</Text>
                    </View>
                    <View style={styles.detailInfoRow}>
                      <Text style={styles.detailInfoLabel}>🔍 필터링</Text>
                      <Text style={styles.detailInfoValue}>{postDetail.filtering ? "활성화" : "비활성화"}</Text>
                    </View>
                  </View>

                </View>


                {/* 지원 버튼 */}
                <View style={styles.applyButtonContainer}>
                  <TouchableOpacity 
                    style={styles.applyButton}
                    onPress={() => {
                      console.log("🐕 지원하기 버튼 클릭됨");
                      console.log("🐕 현재 selectedPostId:", selectedPostId);
                      
                      if (selectedPostId) {
                        setSupportMessageModalVisible(true);
                      } else {
                        console.error("❌ selectedPostId가 null 또는 undefined입니다!");
                        Alert.alert("오류", "게시글 정보를 찾을 수 없습니다.");
                      }
                    }}
                  >
                    <Text style={styles.applyButtonText}>🐕 지원하기</Text>
                  </TouchableOpacity>
                </View>

                {/* 지원자 목록 조회 버튼 (owner일 때만) */}
                {postDetail?.owner && (
                  <View style={styles.applicantsButtonContainer}>
                    <TouchableOpacity 
                      style={styles.applicantsButton}
                      onPress={() => {
                        console.log("👥 지원자 목록 조회 버튼 클릭됨");
                        console.log("👥 delegateWalkPostId:", selectedPostId);
                        // 지원자 목록 조회 API 호출
                        // 이미 useViewDelegateApplicants 훅이 자동으로 호출됨
                      }}
                    >
                      <Text style={styles.applicantsButtonText}>👥 지원자 목록 보기</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* 산책 시작 버튼 (권한 부여된 게시글의 선정된 지원자에게만) */}
                {(() => {
                  const selectedApplicantId = selectedApplicants.get(selectedPostId); // 이제 직접 memberId가 저장됨
                  const isSelectedApplicant = selectedApplicantId && selectedApplicantId === currentUserId; // 현재 사용자가 선정된 지원자인지 확인
                  const hasAuthorization = authorizedPosts.has(selectedPostId); // 권한 부여 여부
                  
                  console.log("🔍 산책 시작 버튼 조건 확인:", {
                    selectedPostId: selectedPostId,
                    selectedApplicantId: selectedApplicantId,
                    currentUserId: currentUserId,
                    isSelectedApplicant: isSelectedApplicant,
                    hasAuthorization: hasAuthorization,
                    authorizedPosts: authorizedPosts
                  });
                  
                  return isSelectedApplicant && hasAuthorization && (
                    <View style={styles.authorizationSection}>
                      <TouchableOpacity
                        style={styles.startWalkButton}
                        onPress={() => {
                          console.log("🏃 산책 시작 버튼 클릭됨");
                          startWalk({ walkRecordId: selectedPostId });
                        }}
                      >
                        <Text style={styles.startWalkButtonText}>🏃 산책 시작</Text>
                      </TouchableOpacity>
                    </View>
                  );
                })()}

                {/* 지원자 목록 */}
                {applicants && applicants.length > 0 && (
                  <View style={styles.applicantsSection}>
                    <Text style={styles.applicantsTitle}>👥 지원자 목록 ({applicants.length}명)</Text>
                    <FlatList
                      data={applicants}
                      keyExtractor={(item) => item.memberId?.toString() || item.id?.toString()}
                      scrollEnabled={false}
                      renderItem={({ item }) => {
                        const selectedApplicantId = selectedApplicants.get(selectedPostId); // 이제 직접 memberId가 저장됨
                        const isSelected = selectedApplicantId === item.memberId;
                        console.log("🔍 지원자 렌더링:", {
                          memberId: item.memberId,
                          selectedPostId: selectedPostId,
                          selectedApplicantId: selectedApplicantId,
                          selectedApplicants: selectedApplicants,
                          isSelected: isSelected
                        });
                        return (
                        <View style={[styles.applicantCard, isSelected && styles.selectedApplicantCard]}>
                          <View style={styles.applicantHeader}>
                            {item.memberImageUrl ? (
                              <Image
                                source={{ uri: `${BASE_URL}${item.memberImageUrl}` }}
                                style={styles.applicantAvatar}
                              />
                            ) : (
                              <View style={styles.applicantAvatar}>
                                <Text style={styles.applicantAvatarText}>👤</Text>
                              </View>
                            )}
                            <View style={styles.applicantInfo}>
                              <View style={styles.applicantNameRow}>
                                <Text style={styles.applicantName}>{item.memberName}</Text>
                                {isSelected && (
                                  <Text style={styles.selectedBadge}>✅ 선정됨</Text>
                                )}
                              </View>
                              <Text style={styles.applicantTime}>{item.createdAt}</Text>
                            </View>
                            <TouchableOpacity
                              style={styles.selectApplicantButton}
                              onPress={() => {
                                Alert.alert(
                                  "지원자 선택",
                                  `${item.memberName || `ID: ${item.memberId}`}님을 대리 산책자로 선택하시겠습니까?`,
                                  [
                                    { text: "취소", style: "cancel" },
                                    {
                                      text: "선택",
                                      onPress: () => {
                                        console.log("👤 지원자 선택:", item.memberId);
                                        console.log("👤 memberId 타입:", typeof item.memberId);
                                        console.log("👤 delegateWalkPostId:", selectedPostId);
                                        console.log("👤 전체 item 데이터:", item);
                                        selectApplicant({ 
                                          delegateWalkPostId: selectedPostId,
                                          memberId: item.memberId 
                                        });
                                      }
                                    }
                                  ]
                                );
                              }}
                            >
                              <Text style={styles.selectApplicantButtonText}>선택</Text>
                            </TouchableOpacity>
                          </View>
                          <Text style={styles.applicantMessage}>{item.message || "지원 메시지가 없습니다."}</Text>
                        </View>
                      )}
                      }/>
                  </View>
                )}

                {/* 산책 기록 시작/끝 버튼 */}
                {walkRecordId && (
                  <View style={styles.walkControlSection}>
                    <Text style={styles.walkControlTitle}>🚶‍♂️ 산책 기록</Text>
                    <View style={styles.walkButtonContainer}>
                      {!isWalkStarted ? (
                        <TouchableOpacity
                          style={styles.startWalkButton}
                          onPress={() => {
                            console.log("🚶‍♂️ 산책 시작, walkRecordId:", walkRecordId);
                            startWalk({ walkRecordId });
                            setIsWalkStarted(true);
                          }}
                        >
                          <Text style={styles.walkButtonText}>🏃‍♂️ 산책 시작</Text>
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity
                          style={styles.finishWalkButton}
                          onPress={() => {
                            console.log("🏁 산책 끝, walkRecordId:", walkRecordId);
                            finishWalk({ walkRecordId });
                            setIsWalkStarted(false);
                          }}
                        >
                          <Text style={styles.walkButtonText}>🏁 산책 끝</Text>
                        </TouchableOpacity>
                      )}
                      
                      <TouchableOpacity
                        style={styles.locationButton}
                        onPress={() => {
                          setShowLocationModal(true);
                        }}
                      >
                        <Text style={styles.walkButtonText}>📍 현재 위치 보기</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </ScrollView>
            ) : (
              <View style={styles.detailLoadingContainer}>
                <Text style={styles.detailLoadingText}>📭 데이터가 없습니다.</Text>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* 실시간 위치 정보 모달 */}
      <Modal
        visible={showLocationModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowLocationModal(false)}
      >
        <View style={styles.locationModalWrapper}>
          <View style={styles.locationModalContent}>
            <View style={styles.locationModalHeader}>
              <Text style={styles.locationModalTitle}>📍 실시간 위치</Text>
              <TouchableOpacity
                onPress={() => setShowLocationModal(false)}
                style={styles.locationCloseButton}
              >
                <MaterialIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.locationMapContainer}>
              <MapView
                style={styles.locationMap}
                region={{
                  latitude: 37.648931,
                  longitude: 127.064411,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
              >
                <Marker
                  coordinate={{
                    latitude: 37.648931,
                    longitude: 127.064411,
                  }}
                  title="현재 위치"
                  description="대리 산책자 위치"
                >
                  <MaterialIcons name="person" size={30} color="#7EC8C2" />
                </Marker>
              </MapView>
            </View>
          </View>
        </View>
      </Modal>

      {/* 지원 메시지 입력 모달 */}
      <Modal
        visible={supportMessageModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSupportMessageModalVisible(false)}
      >
        <View style={styles.supportMessageModalWrapper}>
          <View style={styles.supportMessageModalContent}>
            <View style={styles.supportMessageModalHeader}>
              <Text style={styles.supportMessageModalTitle}>💬 지원 메시지</Text>
              <TouchableOpacity
                onPress={() => setSupportMessageModalVisible(false)}
                style={styles.supportMessageCloseButton}
              >
                <Text style={styles.supportMessageCloseText}>×</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.supportMessageModalBody}>
              <Text style={styles.supportMessageLabel}>지원 메시지를 입력해주세요</Text>
              <TextInput
                style={styles.supportMessageInput}
                placeholder="지원하고 싶은 이유나 메시지를 입력해주세요"
                value={supportMessage}
                onChangeText={setSupportMessage}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
              
              <View style={styles.supportMessageButtonContainer}>
                <TouchableOpacity
                  style={styles.supportMessageCancelButton}
                  onPress={() => {
                    setSupportMessageModalVisible(false);
                    setSupportMessage("");
                  }}
                >
                  <Text style={styles.supportMessageCancelText}>취소</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.supportMessageSubmitButton}
                  onPress={() => {
                    console.log("💬 지원 메시지:", supportMessage);
                    console.log("💬 delegateWalkPostId:", selectedPostId);
                    
                    // 지원 메시지와 함께 API 호출
                    applyDelegate({ 
                      delegateWalkPostId: selectedPostId,
                      message: supportMessage 
                    });
                    
                    setSupportMessageModalVisible(false);
                    setSupportMessage("");
                  }}
                >
                  <Text style={styles.supportMessageSubmitText}>지원하기</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default DelegateTab;

const styles = StyleSheet.create({
  container: { flex: 1 },

  floatingButton: {
    position: "absolute",
    bottom: 30,
    right: 30,
    backgroundColor: "#2E86AB",
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },

  overlayBottom: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  overlayText: {
    fontSize: 16,
    backgroundColor: "rgba(255,255,255,0.9)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    color: "#333",
  },
  applyBtn: {
    marginTop: 10,
    backgroundColor: "#7EC8C2",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  applyText: {
    color: "#fff",
    fontWeight: "600",
  },
  closeText: {
    color: "#7E7E7E",
    fontSize: 13,
  },

  modalWrapper: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    width: "90%",
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 12 },

  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#F9FAFB",
    marginBottom: 10,
  },
  profileImage: { width: 50, height: 50, borderRadius: 25, marginRight: 10 },
  profileName: { fontSize: 16, color: "#333" },

  // 상세 조회 모달 스타일
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 10,
    width: "90%",
    maxHeight: "80%",
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  closeButton: {
    padding: 5,
  },
  modalBody: {
    padding: 20,
  },
  detailTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  detailContent: {
    fontSize: 16,
    color: "#666",
    marginBottom: 15,
    lineHeight: 24,
  },
  detailPrice: {
    fontSize: 16,
    color: "#2E86AB",
    fontWeight: "bold",
    marginBottom: 10,
  },
  detailLocation: {
    fontSize: 14,
    color: "#888",
    marginBottom: 10,
  },
  detailTime: {
    fontSize: 14,
    color: "#888",
    marginBottom: 10,
  },
  detailAuthor: {
    fontSize: 14,
    color: "#888",
    fontStyle: "italic",
  },
  loadingContainer: {
    padding: 20,
    alignItems: "center",
  },
  errorText: {
    color: "#ff4444",
    fontSize: 16,
    textAlign: "center",
  },

  // FeedbackTab과 동일한 스타일
  card: {
    backgroundColor: "#F9F9F9",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E6E6E6",
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  user: {
    fontWeight: "600",
    fontSize: 14,
    color: "#6D9886",
  },
  time: {
    fontSize: 12,
    color: "#888",
  },
  feedbackTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 4,
    color: "#2C3E50",
  },
  content: {
    fontSize: 14,
    color: "#444",
    marginBottom: 8,
  },
  likeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  heart: {
    fontSize: 18,
    marginRight: 6,
  },
  heartFilled: {
    color: "red",
  },
  heartEmpty: {
    color: "#aaa",
  },
  likes: {
    fontSize: 13,
    color: "#999",
  },

  // 상세 조회 모달 스타일 (새로운 디자인)
  detailModalWrapper: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  detailModalContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    width: "95%",
    maxHeight: "85%",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 8,
  },
  detailModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  detailModalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2C3E50",
  },
  detailCloseButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
  },
  detailModalBody: {
    padding: 20,
  },
  detailLoadingContainer: {
    padding: 40,
    alignItems: "center",
  },
  detailLoadingText: {
    fontSize: 16,
    color: "#7EC8C2",
    fontWeight: "600",
  },
  detailErrorContainer: {
    padding: 40,
    alignItems: "center",
  },
  detailErrorText: {
    fontSize: 16,
    color: "#FF6B6B",
    textAlign: "center",
    fontWeight: "500",
  },
  detailCard: {
    backgroundColor: "#F8FFFE",
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E8F5F3",
    marginBottom: 20,
  },
  detailProfileRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  detailAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    borderWidth: 2,
    borderColor: "#7EC8C2",
  },
  detailUserInfo: {
    flex: 1,
  },
  detailUserName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2C3E50",
    marginBottom: 4,
  },
  detailTime: {
    fontSize: 12,
    color: "#7F8C8D",
  },
  detailTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#2C3E50",
    marginBottom: 15,
    lineHeight: 28,
  },
  detailContent: {
    fontSize: 16,
    color: "#34495E",
    lineHeight: 24,
    marginBottom: 20,
  },
  detailMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  detailMetaItem: {
    flex: 1,
    backgroundColor: "#E8F5F3",
    padding: 12,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  detailMetaLabel: {
    fontSize: 12,
    color: "#7F8C8D",
    marginBottom: 4,
    fontWeight: "600",
  },
  detailMetaValue: {
    fontSize: 14,
    color: "#2C3E50",
    fontWeight: "700",
  },
  detailLikeRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF5F5",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FFE5E5",
  },
  detailHeart: {
    fontSize: 20,
    marginRight: 8,
  },
  detailHeartFilled: {
    color: "#FF6B6B",
  },
  detailHeartEmpty: {
    color: "#BDC3C7",
  },
  detailLikes: {
    fontSize: 14,
    color: "#7F8C8D",
    fontWeight: "600",
  },
  detailCommentsSection: {
    marginTop: 8,
  },
  detailCommentsTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2C3E50",
    marginBottom: 16,
  },
  detailCommentCard: {
    backgroundColor: "#F8F9FA",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: "#7EC8C2",
  },
  detailCommentHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  detailCommentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
  },
  detailCommentUserInfo: {
    flex: 1,
  },
  detailCommentUserName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2C3E50",
    marginBottom: 2,
  },
  detailCommentTime: {
    fontSize: 11,
    color: "#7F8C8D",
  },
  detailCommentContent: {
    fontSize: 14,
    color: "#34495E",
    lineHeight: 20,
  },
  detailNoComments: {
    padding: 40,
    alignItems: "center",
  },
  detailNoCommentsText: {
    fontSize: 14,
    color: "#BDC3C7",
    fontStyle: "italic",
  },

  // 프로필 선택 모달 스타일 (WalkingTogetherTab과 동일)
  profileModalWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  profileModalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    width: "80%",
  },
  profileModalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  profileApplyBtn: {
    backgroundColor: "#7EC8C2",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  profileApplyText: {
    color: "#fff",
    fontWeight: "600",
  },


  // 대리 산책자 구하기 버튼 스타일 (RecommendTab의 addButton과 동일)
  delegateButton: {
    position: "absolute",
    bottom: 30,
    left: 20,
    backgroundColor: "#6A9C89",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  delegateButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

  // 지원 버튼 스타일
  applyButtonContainer: {
    padding: 20,
    paddingTop: 10,
    marginBottom: 30,
  },
  applyButton: {
    backgroundColor: "#7EC8C2",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#7EC8C2",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 5,
  },
  applyButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },

  // 지원자 목록 스타일
  applicantsSection: {
    padding: 20,
    paddingTop:0,
    marginBottom: 30,
  },
  applicantsTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2C3E50",
    marginBottom: 15,
  },
  applicantCard: {
    backgroundColor: "#F8F9FA",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#7EC8C2",
  },
  applicantHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  applicantAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: "#E0E0E0",
    alignItems: "center",
    justifyContent: "center",
  },
  applicantAvatarText: {
    fontSize: 20,
    color: "#666",
  },
  applicantInfo: {
    flex: 1,
  },
  applicantName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2C3E50",
    marginBottom: 2,
  },
  applicantTime: {
    fontSize: 12,
    color: "#7F8C8D",
  },
  applicantMessage: {
    fontSize: 14,
    color: "#34495E",
    lineHeight: 20,
  },
  selectApplicantButton: {
    backgroundColor: "#7EC8C2",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  selectApplicantButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },

  // 선정된 지원자 스타일
  selectedApplicantCard: {
    backgroundColor: "#E8F5E8",
    borderColor: "#4CAF50",
    borderWidth: 2,
  },
  applicantNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  selectedBadge: {
    backgroundColor: "#4CAF50",
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },

  // 권한 부여 및 산책 시작 버튼 스타일
  authorizationSection: {
    padding: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },
  authorizeButton: {
    backgroundColor: "#FF9800",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
  },
  authorizeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  startWalkButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
  },
  startWalkButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  // 산책 기록 컨트롤 스타일
  walkControlSection: {
    padding: 20,
    paddingTop: 10,
  },
  walkControlTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2C3E50",
    marginBottom: 15,
  },
  walkButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  startWalkButton: {
    flex: 1,
    backgroundColor: "#27AE60",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  finishWalkButton: {
    flex: 1,
    backgroundColor: "#E74C3C",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  locationButton: {
    flex: 1,
    backgroundColor: "#3498DB",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  walkButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },

  // 추가 정보 섹션 스타일 (심플하게)
  detailAdditionalInfo: {
    marginTop: 12,
    padding: 12,
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
  },
  detailInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  detailInfoLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#495057",
    width: 80,
    marginRight: 12,
  },
  detailInfoValue: {
    fontSize: 14,
    color: "#212529",
    flex: 1,
  },
  detailPetInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  detailPetImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
  },

  // 반려동물 섹션 스타일 (심플하게)
  detailPetSection: {
    marginTop: 12,
    marginBottom: 12,
    padding: 12,
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
  },
  detailPetText: {
    flex: 1,
  },
  detailPetName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#212529",
    marginBottom: 2,
  },
  detailPetLabel: {
    fontSize: 12,
    color: "#6C757D",
  },

  // 제목 행 스타일
  detailTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  detailHeartButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#F8F9FA",
  },

  // 선택된 위치 정보 스타일
  selectedLocationInfo: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    padding: 12,
    borderRadius: 8,
    marginVertical: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  selectedLocationLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  selectedLocationText: {
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
  },

  // 실시간 위치 모달 스타일
  locationModalWrapper: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  locationModalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    width: "90%",
    height: "70%",
    overflow: "hidden",
  },
  locationModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  locationModalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2C3E50",
  },
  locationCloseButton: {
    padding: 4,
  },
  locationMapContainer: {
    flex: 1,
  },
  locationMap: {
    flex: 1,
  },
  
  // 🔹 말풍선 스타일
  bubbleContainer: {
    position: "absolute",
    top: 20,
    right: 20,
    zIndex: 1000,
  },
  bubble: {
    backgroundColor: "#758A93",
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 8,
    maxWidth: 250,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    position: "relative",
  },
  bubbleText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 2,
  },
  bubbleMessage: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 16,
  },
  bubbleCloseButton: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  bubbleCloseText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  bubbleTail: {
    position: "absolute",
    bottom: -6,
    right: 20,
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 6,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "#4CAF50",
  },
  
  // 지원자 목록 조회 버튼 스타일
  applicantsButtonContainer: {
    marginTop: 16,
    marginBottom: 16,
  },
  applicantsButton: {
    backgroundColor: "#2196F3",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    shadowColor: "#2196F3",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  applicantsButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  
  // 지원 메시지 모달 스타일
  supportMessageModalWrapper: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  supportMessageModalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    width: "90%",
    maxHeight: "60%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  supportMessageModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  supportMessageModalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2C3E50",
  },
  supportMessageCloseButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
  },
  supportMessageCloseText: {
    fontSize: 18,
    color: "#666",
    fontWeight: "bold",
  },
  supportMessageModalBody: {
    padding: 20,
  },
  supportMessageLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2C3E50",
    marginBottom: 12,
  },
  supportMessageInput: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#333",
    backgroundColor: "#FAFAFA",
    height: 100,
    textAlignVertical: "top",
    marginBottom: 20,
  },
  supportMessageButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  supportMessageCancelButton: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  supportMessageCancelText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "600",
  },
  supportMessageSubmitButton: {
    flex: 1,
    backgroundColor: "#758A93",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    shadowColor: "#758A93",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  supportMessageSubmitText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
