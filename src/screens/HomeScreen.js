import React, { useContext, useCallback, useRef, useState, useEffect } from "react";
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
import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserContext } from "../context/User";
import { NotificationBell } from "../components/notification";
import PetProfile from "../components/petProfile";
import { Weather } from "../components/weather";
import { useViewPosts } from "../hooks/usePost";
import { BASE_URL } from "../api/apiClient";
import { connectStomp } from "../api/chatiing/stompClient";

const HomeScreen = () => {
  const { logout, loading } = useContext(UserContext);
  const { data: posts = [], refetch } = useViewPosts();

  const scrollRef = useRef(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const handleScroll = (e) => {
    const offsetY = e.nativeEvent.contentOffset.y;
    setShowScrollTop(offsetY > 200);
  };

  const scrollToTop = () => {
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  const navigation = useNavigation();
  const weatherText = Weather();
  const greetingText = "오늘도 좋은 하루 보내세요! 💛";

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [])
  );

  useEffect(() => {
    const initStomp = async () => {
      const token = await AsyncStorage.getItem("accessToken");
      if (token) {
        await connectStomp(token);
        console.log("✅ 홈 진입 후 STOMP 연결 성공");
      }
    };
    initStomp();
  }, []);
  
  const getImageUri = (relativePath) =>
    relativePath
      ? `${BASE_URL.replace(/\/$/, "")}/${relativePath.replace(/^\/+/, "")}`
      : undefined;

  if (loading) return null;

  const handleLogout = async () => {
    try {
      await logout();
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

        {/* 🐕 펫 말풍선 */}
        <PetSpeechBubble />

        <View style={styles.divider} />

        {/* 📍 산책 기능 바로가기 섹션 완전 제거 */}

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
                  <View style={styles.feedHeader}>
                    {profileUri && (
                      <Image
                        source={{ uri: profileUri }}
                        style={styles.profileImage}
                      />
                    )}
                    <Text style={styles.authorName}>{item.memberName}</Text>
                  </View>

                  {imageUri && (
                    <Image
                      source={{ uri: imageUri }}
                      style={styles.feedImage}
                    />
                  )}

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

/* ✅ WalkCheckCard 추가 (서버 연동 없이 작동) */
const PetSpeechBubble = () => {
  const speechMessages = [
    "오늘은 산책가기 딱 좋은 날이에요! 🌤️",
    "오늘은 잔디밭에서 뛰어놀자! 🌱",
    "바람이 시원해서 산책하기 좋아요! 💨",
    "오늘은 친구들과 만나서 놀고 싶어요! 🐕",
    "햇살이 따뜻해서 나가고 싶어요! ☀️",
    "오늘은 공원에서 뛰어놀까요? 🏞️",
    "산책하면서 맛있는 간식도 먹고 싶어요! 🍖",
    "오늘은 새로운 길로 산책해볼까요? 🛤️",
    "날씨가 좋아서 산책하기 딱이에요! 🌈",
    "오늘은 물놀이도 하고 싶어요! 💦"
  ];

  const [currentMessage, setCurrentMessage] = useState(
    speechMessages[Math.floor(Math.random() * speechMessages.length)]
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessage(speechMessages[Math.floor(Math.random() * speechMessages.length)]);
    }, 60000); // 1분마다 메시지 변경

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.speechBubbleContainer}>
      <View style={styles.speechBubble}>
        <Text style={styles.speechBubbleText}>{currentMessage}</Text>
        <View style={styles.speechBubbleTail} />
      </View>
    </View>
  );
};

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
    backgroundColor: "#9CA3AF",
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
    fontSize: 15,
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

  /* 🐕 펫 말풍선 스타일 */
  speechBubbleContainer: {
    alignItems: "flex-start",
    marginVertical: 10,
    marginHorizontal: 10,
    marginLeft: 20,
    marginTop: -10,
  },
  speechBubble: {
    backgroundColor: "#E8F5E8",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    maxWidth: "80%",
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  speechBubbleText: {
    fontSize: 17,
    color: "#2C3E50",
    fontFamily: "cute",
    textAlign: "left",
    lineHeight: 22,
    flexWrap: "wrap",
  },
  speechBubbleTail: {
    position: "absolute",
    top: -6,
    left: 20,
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderBottomWidth: 6,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "#E8F5E8",
  },
});

export default HomeScreen;
