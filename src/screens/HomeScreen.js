import React from "react";
import { View, Text, StyleSheet } from "react-native";

const HomeScreen = () => {
  return(
    <View style={styles.container}> 
      
      <View style={styles.petList}>
        <Text>프로필</Text>
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