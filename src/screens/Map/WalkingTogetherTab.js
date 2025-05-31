import React from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

const walks = [
  { id: 1, title: "망원동 저녁 산책 같이 가요!", user: "효빈", time: "오늘 오후 7시" },
  { id: 2, title: "성수동 강아지 산책 구함 🐶", user: "댕댕이집사", time: "내일 오전 10시" },
];

export const WalkingTogetherTab = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🐾 함께 산책해요</Text>
      <FlatList
        data={walks}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card}>
            <Text style={styles.walkTitle}>{item.title}</Text>
            <Text style={styles.walkMeta}>{item.time} · {item.user}</Text>
            <View style={styles.matchButton}>
              <MaterialIcons name="check-circle" size={18} color="#7EC8C2" />
              <Text style={styles.matchText}>매칭 신청</Text>
            </View>
          </TouchableOpacity>
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
    backgroundColor: "#F6FDFC",
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#D2EAE4",
  },
  walkTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 4,
    color: "#2C3E50",
  },
  walkMeta: {
    fontSize: 13,
    color: "#6B7B8C",
    marginBottom: 8,
  },
  matchButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#E8F7F1",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  matchText: {
    marginLeft: 6,
    color: "#4CA195",
    fontWeight: "500",
    fontSize: 13,
  },
});
