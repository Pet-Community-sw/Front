import React, { useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";

import { UserContext } from "../context/User";
import { NotificationBell } from "../components/notification";

const pet = {
  name: "멍멍이",
  birthdate: "2025-05-27",
};

const posts = [
  { id: 1, title: "오늘 강아지랑 한강 다녀왔어요!", author: "효빈", date: "2025.04.21", likes: 12, comments: 3 },
  { id: 2, title: "산책로 추천해주세요~", author: "댕댕맘", date: "2025.04.20", likes: 5, comments: 1 },
  { id: 3, title: "우리 고양이 예쁘죠??", author: "냥이맘", date: "2025.04.20", likes: 0, comments: 1 },
  { id: 4, title: "산책 갔다왔어요~", author: "선재", date: "2025.04.20", likes: 4, comments: 1 },
  { id: 5, title: "이 간식 추천합니다~", author: "에렌", date: "2025.04.20", likes: 2, comments: 1 },
];

const HomeScreen = () => {
  const { logout, loading } = useContext(UserContext);
  const navigation = useNavigation();

  if (loading) return null;

  const handleLogout = async () => {
    await logout();
    navigation.navigate("Welcome");
  };

  const today = new Date().toISOString().slice(5, 10);
  const isBirthday = pet.birthdate?.slice(5, 10) === today;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.headerInfoText}>5월 24일 ☀️ 맑음 24º</Text>
        <View style={styles.rightHeader}>
          <NotificationBell onPress={() => navigation.navigate("NotificationList")} />
          <TouchableOpacity onPress={() => navigation.navigate("MyProfile")} style={styles.iconBtn}>
            <MaterialIcons name="person" size={28} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Text style={styles.logoutText}>로그아웃</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.petGreetingBox}>
        <Text style={styles.petGreetingText}>
          {isBirthday
            ? `🎉 오늘은 ${pet.name}의 생일이에요! 축하합니다 🥳`
            : `오늘도 ${pet.name}와 좋은 하루 보내세요 💛`}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🐾 내 반려동물</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.petItem}>
            <View style={styles.placeholderCircle} />
            <Text style={styles.petName}>{pet.name}</Text>
          </View>
        </ScrollView>
      </View>

      <View style={styles.divider} />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📍 산책 기능 바로가기</Text>
        <View style={styles.buttonRow}>
          <IconButton icon="paw" label="산책 매칭" onPress={() => navigation.navigate("Matching")} />
          <IconButton icon="run" label="대리 산책자" onPress={() => navigation.navigate("Walker")} />
          <IconButton icon="map" label="산책길 추천" onPress={() => navigation.navigate("MapRoute")} />
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💬 커뮤니티</Text>
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id.toString()}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.threadCard}
              onPress={() => navigation.navigate("PostDetail", { postId: item.id })}
            >
              <Text style={styles.threadTitle}>{item.title}</Text>
              <View style={styles.threadMetaRow}>
                <View style={styles.threadActions}>
                  <MaterialCommunityIcons name="heart" size={16} color="#F47C7C" />
                  <Text style={styles.metaText}>{item.likes}</Text>
                  <MaterialCommunityIcons name="comment-outline" size={16} color="#4A7B9D" style={{ marginLeft: 12 }} />
                  <Text style={styles.metaText}>{item.comments}</Text>
                </View>
                <Text style={styles.metaText}>{item.date} · {item.author}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>
    </ScrollView>
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
    fontSize: 25,
    color: "black",
    fontFamily: "cute",
    marginBottom: 12,
    marginLeft: 3,
    marginTop: 5,
    lineHeight: 30,
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
  petItem: {
    alignItems: "center",
    marginRight: 16,
    marginLeft: 10,
  },
  placeholderCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#6B7B8C",
  },
  petName: {
    marginTop: 6,
    fontSize: 17,
    color: "#333",
    fontFamily: "cute",
  },
  // ✅ 스레드형 커뮤니티용 스타일 수정
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
});

export default HomeScreen;
