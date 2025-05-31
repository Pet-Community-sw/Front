import React from "react";
import { View, Text, StyleSheet } from "react-native";

export const MockMatchingTab = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🐾 함께 산책해요 (Mock)</Text>
      <Text style={styles.item}>“오늘 저녁 6시, 같이 걷기 원해요!”</Text>
      <Text style={styles.item}>“내일 오전에 강아지랑 산책 가실 분~”</Text>
      <Text style={styles.item}>“근처 공원 추천도 받아요 😄”</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 10 },
  title: { fontSize: 16, fontWeight: "bold", marginBottom: 6 },
  item: { fontSize: 13, marginBottom: 4, color: "#444" },
});
