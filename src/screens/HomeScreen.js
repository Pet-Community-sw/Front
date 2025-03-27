import React, { useContext } from "react";
import { View, Text, StyleSheet, Button } from "react-native";
import { UserContext } from "../context/User";
import { useNavigation } from "@react-navigation/native";
import PetProfile from "../components/petProfile";

const HomeScreen = () => {
  const {token, logout} = useContext(UserContext);
  const navigation = useNavigation();

  const handleLogout = async () => {
    await logout();
    navigation.navigate("Login");
  }
  return(
    <View style={styles.container}> 
      {token && (
      <Button style={styles.logout}
        title="로그아웃"
        onPress={handleLogout}>
      </Button>)}

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

styles = StyleSheet.create({
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