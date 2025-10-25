import React, { useContext, useCallback, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Animated,
  Image,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";

import { UserContext } from "../context/User";
import { NotificationBell } from "../components/notification";
import PetProfile from "../components/petProfile";
// import { useViewProfile } from "../hooks/useProfile"; // PetProfile에서만 사용
import { Weather } from "../components/weather";
import { useViewPosts } from "../hooks/usePost";
import { BASE_URL } from "../api/apiClient";

const HomeScreen = () => {
  const { logout, loading } = useContext(UserContext);
  // const { data: profiles = [] } = useViewProfile(); // PetProfile에서만 사용
  const { data: posts = [], refetch } = useViewPosts();

  const scrollRef = useRef(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const handleScroll = (e) => {
    const offsetY = e.nativeEvent.contentOffset.y;
    setShowScrollTop(offsetY > 200); // 200 이상 스크롤 시 버튼 표시
  };

  const scrollToTop = () => {
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  const navigation = useNavigation();

  const weatherText = Weather();

  // PetProfile에서 profiles 데이터를 관리하므로 인사말은 간단하게 변경
  const greetingText = "오늘도 좋은 하루 보내세요! 💛";

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [])
  );

  const getImageUri = (relativePath) =>
    relativePath
      ? `${BASE_URL.replace(/\/$/, "")}/${relativePath.replace(/^\/+/, "")}`
      : undefined;

  if (loading) return null;

  const handleLogout = async () => {
    try {
      await logout();

      // 웹소켓 연결 끊기
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.close();
        console.log("🔌 웹소켓 연결 종료 (로그아웃)");
      }
    } catch (e) {
      console.log("서버 로그아웃 실패:", e);
    }
  };

  return (
    <>
      <ScrollView
        ref={scrollRef}
        style={styles.container}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <View style={styles.headerRow}>
          <Text style={styles.headerInfoText}>{weatherText}</Text>
          <View style={styles.rightHeader}>
            <NotificationBell
              onPress={() => navigation.navigate("NotificationList")}
            />
            <TouchableOpacity
              onPress={() => navigation.navigate("MyProfile")}
              style={styles.iconBtn}
            >
              <MaterialIcons name="person" size={28} color="#333" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleLogout}
              style={styles.logoutButton}
            >
              <Text style={styles.logoutText}>로그아웃</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.petGreetingBox}>
          <Text style={styles.petGreetingText}>{greetingText}</Text>
        </View>

        <View style={styles.petSection}>
          <Text style={styles.title}>🐶🐱 댕냥이 친구들</Text>
          <View style={styles.petProfileContainer}>
            <PetProfile />
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📍 산책 기능 바로가기</Text>
          <View style={styles.buttonRow}>
            <IconButton
              icon="paw"
              label="산책 매칭"
              onPress={() => navigation.navigate("Matching")}
            />
            <IconButton
              icon="run"
              label="대리 산책자"
              onPress={() => navigation.navigate("Walker")}
            />
            <IconButton
              icon="map"
              label="산책길 추천"
              onPress={() => navigation.navigate("MapRoute")}
            />
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💬 커뮤니티</Text>
          <FlatList
            data={posts}
            scrollEnabled={false}
            keyExtractor={(item) => item.postId.toString()}
            renderItem={({ item }) => {
              const imageUri = getImageUri(item.postImageUrl);
              const profileUri = getImageUri(item.memberImageUrl);

              return (
                <TouchableOpacity
                  style={styles.feedCard}
                  onPress={() =>
                    navigation.navigate("PostDetail", { postId: item.postId })
                  }
                >
                  {/* 상단 프로필 */}
                  <View style={styles.feedHeader}>
                    {profileUri && (
                      <Image
                        source={{ uri: profileUri }}
                        style={styles.profileImage}
                      />
                    )}
                    <Text style={styles.authorName}>{item.memberName}</Text>
                  </View>

                  {/* 게시글 이미지 */}
                  {imageUri && (
                    <Image
                      source={{ uri: imageUri }}
                      style={styles.feedImage}
                    />
                  )}

                  {/* 아래 정보 */}
                  <View style={styles.feedMeta}>
                    <Text style={styles.feedLikes}>
                      ❤️ 좋아요 {item.likeCount}
                    </Text>
                    <Text style={styles.feedCaption}>{item.title}</Text>
                    <Text style={styles.feedDate}>
                      {item.createdAt} · 조회수 {item.viewCount}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </ScrollView>
      {showScrollTop && (
        <TouchableOpacity style={styles.scrollTopButton} onPress={scrollToTop}>
          <MaterialCommunityIcons
            name="arrow-up-bold-circle"
            size={50}
            color="#6D9886"
          />
        </TouchableOpacity>
      )}
    </>
  );
};

const IconButton = ({ icon, label, onPress }) => (
  <TouchableOpacity style={styles.iconButton} onPress={onPress}>
    <View style={styles.iconCircle}>
      <MaterialCommunityIcons name={icon} size={26} color="#6D9886" />
    </View>
    <Text style={styles.iconLabel}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
  },
  scrollTopButton: {
    position: "absolute",
    bottom: 30,
    right: 20,
    zIndex: 100,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 10,
  },
  headerInfoText: {
    fontSize: 14,
    color: "#444",
    fontFamily: "font",
    flex: 1,
    marginLeft: 15,
    lineHeight: 20,
  },
  rightHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconBtn: {
    padding: 4,
  },
  logoutButton: {
    backgroundColor: "#F7B4C3",
    paddingVertical: 6,
    paddingHorizontal: 13,
    borderRadius: 8,
  },
  logoutText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 13,
  },
  petGreetingBox: {
    backgroundColor: "#F7F7F7",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    alignSelf: "flex-start",
    marginLeft: 5,
    borderWidth: 1,
    borderColor: "#7EC8C2",
  },
  petGreetingText: {
    fontSize: 14,
    color: "#333",
    fontFamily: "font",
  },
  divider: {
    height: 1,
    backgroundColor: "#D2E0DC",
    marginVertical: 10,
    marginHorizontal: 4,
  },
  section: {
    marginBottom: 10,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 28,
    color: "black",
    fontFamily: "cute",
    marginBottom: 15,
    marginLeft: 3,
    marginTop: 8,
    lineHeight: 34,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  iconButton: {
    alignItems: "center",
    padding: 8,
  },
  iconCircle: {
    backgroundColor: "#F3F4F6",
    padding: 10,
    borderRadius: 100,
  },
  iconLabel: {
    marginTop: 6,
    fontSize: 13,
    color: "#333",
    fontFamily: "font",
  },
  threadCard: {
    borderBottomWidth: 1,
    borderColor: "#E0E0E0",
    paddingVertical: 10,
    paddingHorizontal: 4,
    marginHorizontal: 5,
  },
  threadTitle: {
    fontSize: 15,
    fontWeight: "500",
    marginBottom: 6,
    color: "#2C3E50",
  },
  threadMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  threadActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaText: {
    fontSize: 12,
    color: "#6B7B8C",
    marginLeft: 4,
  },
  title: {
    fontSize: 28,
    color: "#333",
    textAlign: "left",
    alignSelf: "flex-start",
    width: "100%",
    paddingLeft: 20,
    marginLeft: 0,
    marginTop: 18,
    marginBottom: 5,
    fontFamily: "cute",
    lineHeight: 34,
  },
  feedCard: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderColor: "#eee",
    paddingBottom: 10,
  },
  feedHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    marginBottom: 6,
  },
  profileImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
  },
  authorName: {
    fontWeight: "600",
    fontSize: 14,
    color: "#333",
  },
  feedImage: {
    width: "100%",
    height: 280,
    backgroundColor: "#f3f3f3",
  },
  feedMeta: {
    paddingHorizontal: 10,
    marginTop: 8,
  },
  feedLikes: {
    fontWeight: "500",
    fontSize: 14,
    marginBottom: 2,
  },
  feedCaption: {
    fontSize: 14,
    color: "#222",
  },
  feedDate: {
    fontSize: 12,
    color: "#888",
    marginTop: 2,
  },

  // 댕냥이 친구들 영역 스타일
  petSection: {
    marginBottom: 20,
    marginTop: 10,
  },
  petProfileContainer: {
    backgroundColor: "transparent",
    padding: 4,
    marginTop: 4,
    marginHorizontal: 2,
  },
});

export default HomeScreen;
