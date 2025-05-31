import React from "react";
import { View, Text, StyleSheet } from "react-native";

export const MockFeedbackTab = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>💬 피드백 (Mock)</Text>
      <Text style={styles.item}>“너무 귀여운 기능이에요!”</Text>
      <Text style={styles.item}>“산책길 공유 기능 최고!”</Text>
      <Text style={styles.item}>“개선 제안: 댓글도 달 수 있었으면!”</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 10 },
  title: { fontSize: 16, fontWeight: "bold", marginBottom: 6 },
  item: { fontSize: 13, marginBottom: 4, color: "#444" },
});
