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
import { AntDesign } from "@expo/vector-icons";
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
<View style={styles.headerBox}>
  <View style={styles.headerLeft}>
    <Text style={styles.weatherText}>{weatherText}</Text>
    <Text style={styles.greetingText}>{greetingText}</Text>
  </View>

  <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
    <MaterialIcons name="logout" size={20} color="#fff" />
    <Text style={styles.logoutLabel}>로그아웃</Text>
  </TouchableOpacity>
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
                  style={styles.card}
                  activeOpacity={0.9}
                  onPress={() => navigation.navigate("PostDetail", { postId: item.postId })}
                >
                  {/* 헤더 */}
                  <View style={styles.cardHeader}>
                    {profileUri ? (
                      <Image source={{ uri: profileUri }} style={styles.cardAvatar} />
                    ) : (
                      <View style={[styles.cardAvatar, styles.cardAvatarFallback]} />
                    )}
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cardAuthor}>{item.memberName || "익명"}</Text>
                      <Text style={styles.cardCreated}>{item.createdAt}</Text>
                    </View>
                    <View style={styles.badgeRow}>
                      <View style={styles.badgeGray}><Text style={styles.badgeText}>조회 {item.viewCount ?? 0}</Text></View>
                      <View style={styles.likeInline}>
                        <AntDesign name="heart" size={12} color="#FF6B6B" />
                        <Text style={styles.likeInlineText}>{item.likeCount ?? 0}</Text>
                      </View>
                    </View>
                  </View>

                  {/* 타이틀 */}
                  <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>

                  {/* 본문 이미지 */}
                  {imageUri && (
                    <Image source={{ uri: imageUri }} style={styles.cardImage} />
                  )}
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </ScrollView>

      {showScrollTop && (
  <TouchableOpacity style={styles.scrollTopButton} onPress={scrollToTop}>
    <View style={styles.scrollTopInner}>
    <MaterialCommunityIcons name="arrow-up-bold-circle" size={50} color="#FFF" />
    </View>
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

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
  },

  /* 🌤️ 헤더 상단 */
  headerBox: {
    backgroundColor: "#E8F6F3", // 은은한 민트 배경
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 18,
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 2,
  },
  headerLeft: {
    flexShrink: 1,
    flex: 1,
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
  
  weatherText: {
    fontSize: 16,
    color: "#3C6255",
    marginBottom: 4,
    fontFamily: "font",
  },
  greetingText: {
    fontSize: 16,
    color: "#2C3E50",
    fontFamily: "cute",
    fontWeight: "600",
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#6A9C89",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    gap: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  logoutLabel: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },

  /* 🐶 펫 프로필 / 인사 */
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

  /* 💬 커뮤니티 */
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
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#F1F1F1",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  cardAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    marginRight: 10,
    backgroundColor: "#F3F4F6",
  },
  cardAvatarFallback: {
    backgroundColor: "#E5E7EB",
  },
  cardAuthor: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1F2937",
  },
  cardCreated: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: "row",
    gap: 6,
  },
  badgeGray: {
    backgroundColor: "#F6F7FB",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  likeInline: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF5F5",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "#FFE3E3",
    gap: 6,
  },
  likeInlineText: {
    fontSize: 11,
    color: "#FF6B6B",
    fontWeight: "700",
  },
  cardTitle: {
    fontSize: 16,
    color: "#111827",
    fontWeight: "700",
    marginBottom: 10,
  },
  cardImage: {
    width: "100%",
    height: 180,
    borderRadius: 12,
    backgroundColor: "#F3F3F3",
  },

  /* 🐾 말풍선 */
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

  /* ⬆️ 위로가기 버튼 */
  scrollTopButton: {
    position: "absolute",
    bottom: 28,
    right: 20,
    zIndex: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollTopInner: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#7EC8C2", // 민트
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    fontSize: 11,
    color: "#6B7280",      // 회색 계열 텍스트
    fontWeight: "600",
  },
  badgePinkText: {
    color: "#FF6B6B",      // 좋아요 배지 강조색
  },
  
});
