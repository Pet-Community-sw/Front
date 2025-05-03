import React, { useContext } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { UserContext } from "../context/User";
import { useNavigation } from "@react-navigation/native";
import PetProfile from "../components/PetProfile";
import WeatherHeader from "../components/weather";
import MatchingWidget from "../components/MatchingWidjet"
import PostListScreen from "./Community/PostListScreen";

const HomeScreen = () => {
  const {token, logout, name} = useContext(UserContext);
  const navigation = useNavigation();

  const handleLogout = async () => {
    await logout();
    navigation.navigate("Welcome");
  }

  const posts = [
    { id: 1, title: "오늘 강아지랑 한강 다녀왔어요!", author: "효빈", date: "2025.04.21" },
    { id: 2, title: "산책로 추천해주세요~", author: "댕댕맘", date: "2025.04.20" },
  ];
  

  return(
    <View style={styles.container}> 
      {token !== undefined && (
      <View style={styles.headerRow}>
        <Text style={styles.welcomeText}>
          {name ? `${name}님 환영합니다!` : "환영합니다!"}
        </Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}> 
          <Text style={styles.logoutText}>로그아웃</Text> 
        </TouchableOpacity>
      </View>
)}
      <View style={styles.weather}>
        <WeatherHeader></WeatherHeader>
      </View>

      <View style={styles.petList}>
        <PetProfile></PetProfile>
      </View>

      <View style={styles.matching}>
        <MatchingWidget></MatchingWidget>
      </View>

      <View style={styles.community}>
      <Text style={styles.sectionTitle}>Community 💬</Text>
        {posts.slice(0, 3).map((post) => (
          <View key={post.id} style={styles.postPreview}>
            <Text style={styles.postTitle}>{post.title}</Text>
            <Text style={styles.postMeta}>
              {post.author} · {post.date}
            </Text>
          </View>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center", 
    backgroundColor: "#FDFAF6", // 아이보리 배경
    paddingBottom: 10,
    paddingHorizontal: 16,
  }, 
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",  // 가로 꽉 차게
    paddingHorizontal: 20,
    marginTop: 25,
  },  
  logoutButton: {
    backgroundColor: "#E78F81",  
    paddingVertical: 6,
    paddingHorizontal: 13,
    borderRadius: 8,
    marginTop: -0,
    marginRight: 10, 
    alignSelf: "flex-end",
    top: -7, 
  }, 
  logoutText: {
    color: "#FDFAF6",            
    fontWeight: "600",
    fontSize: 13,
  }, 
  weather: {
    marginTop: 7,
  }, 
  petList: {
    flex: 1.2,
    width: "100%", 
    justifyContent: "center", 
    alignItems: "center", 
    backgroundColor: "#FAF1E6", // 베이지
    borderRadius: 20,
    marginVertical: 10,
    padding: 15,
    shadowColor: "#99BC85",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  }, 
  matching: {
    flex: 2,
    width: "100%", 
    justifyContent: "center", 
    alignItems: "flex-start", 
    backgroundColor: "#E4EFE7", // 연한 민트 그린
    borderRadius: 20,
    marginVertical: 10,
    padding: 15,
    shadowColor: "#99BC85",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    height: "auto"
  }, 
  community: {
    flex: 2,
    width: "100%", 
    justifyContent: "center", 
    alignItems: "center", 
    backgroundColor: "#99BC85", // 세이지 그린
    borderRadius: 20,
    marginVertical: 10,
    padding: 15,
    shadowColor: "#99BC85",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  welcomeText: {
    fontSize: 20, 
    fontWeight: "bold",
    color: "#99BC85", // 세이지 그린
    marginBottom: 8,
    marginTop: -10, 
    marginLeft: 30, 
  },
  sectionTitle: {
    fontSize: 25,
    fontWeight: "600",
    color: "black", // 아이보리 (텍스트)
    marginBottom: 7,
    alignSelf: "flex-start", 
    marginLeft: "10", 
    marginTop: "5", 
  }, 
  postPreview: {
    width: "100%",
    backgroundColor: "#FDFAF6", // 아이보리
    padding: 10,
    borderRadius: 10,
    marginBottom: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  postTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#333",
  },
  postMeta: {
    fontSize: 12,
    color: "#777",
    marginTop: 4,
  },
  
})

export default HomeScreen;