import { StyleSheet, View, Text } from "react-native";

const MapScreen = () => {
  return(
    <View style={styles.container}>
      <Text>지도 스크린</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1, 
  }
})

export default MapScreen;