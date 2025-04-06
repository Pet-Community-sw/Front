import React, { useContext } from "react";
import { View, Text, StyleSheet, Button } from "react-native";
import { UserContext } from "../context/User";
import { useNavigation } from "@react-navigation/native";
import PetProfile from "../components/PetProfile";

const HomeScreen = () => {
  const {token, logout, nickname} = useContext(UserContext);
  const navigation = useNavigation();

  const handleLogout = async () => {
    await logout();
    navigation.navigate("Login");
  }
  return(
    <View style={styles.container}> 
      {token && (
        <View>
        <Text style={{ fontSize: 20, fontWeight: "bold" }}>
        {nickname ? `${nickname}님 환영합니다!` : "환영합니다!"}
      </Text>
      <Button style={styles.logout}
        title="로그아웃"
        onPress={handleLogout}>
      </Button>
      </View>
    )}

      <View style={styles.petList}>
        <PetProfile></PetProfile>
      </View>

      <View style={styles.matching}>
        <Text>산책 매칭</Text>
      </View>

      <View style={styles.community}>
        <Text>커뮤니티</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center", 
    backgroundColor: "white", 
    paddingBottom: 50,
  }, 
  logout: {
    backgroundColor: "transparent", 
    textDecorationLine: "underline", 
  }, 
  petList: {
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center", 
    backgroundColor: "#FFF5E4"
  }, 
  matching: {
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center", 
    backgroundColor: "#FFF5E4"
  }, 
  community: {
    flex: 2, 
    justifyContent: "center", 
    alignItems: "center", 
    backgroundColor: "#FFF5E4"
  }
})

export default HomeScreen;