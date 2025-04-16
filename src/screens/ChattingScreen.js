import { StyleSheet, Text, View } from "react-native";

const ChattingScreen = () => {
  return(
    <View style={styles.container}>
      <Text>채팅 스크린</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,     
  }
})

export default ChattingScreen;