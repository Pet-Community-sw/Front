import React from "react";
import { View, Button, Text } from "react-native";

const HomeScreen = ({navigation}) => {
  return(
    <View>
      <Text>홈화면</Text>
      <Button title="회원가입"
      onPress={() => navigation.navigate('Signup')}></Button>
    </View>
  )
}

export default HomeScreen;