import React from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";

// 더미 알림 데이터
const dummyNotifications = Array.from({ length: 10 }, (_, idx) => ({
  id: idx,
  message: `테스트 알림 #${idx + 1}`,
  createdAt: `${idx + 1}분 전`,
}));

const Mock = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>🔔 알림 목록</Text>
      <FlatList
        data={dummyNotifications}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 32 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.message}>{item.message}</Text>
            <Text style={styles.time}>{item.createdAt}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FDFAF6",
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
    paddingHorizontal: 4,
    color: "#333",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    elevation: 2,
  },
  message: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 6,
  },
  time: {
    fontSize: 12,
    color: "#888",
  },
});

export default Mock;
