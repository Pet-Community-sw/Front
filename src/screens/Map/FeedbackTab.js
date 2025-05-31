import React from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";

const feedbacks = [
  { id: 1, user: "효빈", content: "앱 너무 귀여워요! 산책 기능 잘 쓰고 있어요 💛" },
  { id: 2, user: "멍뭉맘", content: "피드 기능도 생기면 좋을 것 같아요~" },
  { id: 3, user: "고양이집사", content: "지도 기능이 조금 더 정확했으면 해요!" },
];

export const FeedbackTab = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>📝 유저 피드백</Text>
      <FlatList
        data={feedbacks}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.user}>{item.user}</Text>
            <Text style={styles.content}>{item.content}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#FFF" },
  title: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 12,
    fontFamily: "cute",
    color: "#333",
  },
  card: {
    backgroundColor: "#F9F9F9",
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E6E6E6",
  },
  user: {
    fontWeight: "600",
    fontSize: 14,
    marginBottom: 4,
    color: "#6D9886",
  },
  content: {
    fontSize: 14,
    color: "#444",
    fontFamily: "font",
  },
});
