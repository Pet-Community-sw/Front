import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Button from "../components/button";


const WelcomeScreen = ({navigation}) => {
  return(
    <View style={styles.container}>
      <Text style={styles.text}>멍냥로드에 오신 것을 환영합니다!</Text>
      <Button title="회원가입"
      onPress={() => navigation.navigate('Signup')}></Button>
      <Button title="로그인"
      onPress={() => navigation.navigate('Login')}></Button>
    </View>
  )
}

const styles = StyleSheet.create({  
  container: {
    flex: 1, 
    padding: 20, 
    backgroundColor: "white"
  }, 
  text: {
    fontSize: 30, 
    fontWeight: "bold"
  }
})

export default WelcomeScreen;