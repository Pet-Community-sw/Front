import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Button from "../components/button";

const HomeScreen = ({navigation}) => {
  return(
    <View style={styles.container}>
      <Text>홈화면이에용</Text>
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
  }
})

export default HomeScreen;