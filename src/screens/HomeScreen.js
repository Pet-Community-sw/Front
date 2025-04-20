import React, { useContext } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { UserContext } from "../context/User";
import { useNavigation } from "@react-navigation/native";
import PetProfile from "../components/PetProfile";
import WeatherHeader from "../components/weather";
import MatchingWidget from "../components/MatchingWidjet"

const HomeScreen = () => {
  const {token, logout, nickname} = useContext(UserContext);
  const navigation = useNavigation();

  const handleLogout = async () => {
    await logout();
    navigation.navigate("Login");
  }
  return(
    <View style={styles.container}> 
      {token !== undefined && (
      <View style={styles.headerRow}>
        <Text style={styles.welcomeText}>
          {nickname ? `${nickname}님 환영합니다!` : "환영합니다!"}
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
        <Text style={styles.sectionTitle}>커뮤니티</Text>
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
    paddingHorizontal: 10,
    marginTop: 20,
  },  
  logoutButton: {
    backgroundColor: "#E78F81",  
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: -10,
    alignSelf: "flex-end"
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
    flex: 1.5,
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
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FDFAF6", // 아이보리 (텍스트)
    marginBottom: 12,
  }
})

export default HomeScreen;