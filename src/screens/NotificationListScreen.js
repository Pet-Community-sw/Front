import React from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { useNotificationList } from "../hooks/useNotification";

//알림 리스트 화면
const NotificationScreen = () => {
  const { data, isLoading, isError } = useNotificationList();

  if (isLoading) return <Text>불러오는 중...</Text>;
  if (isError) return <Text>오류가 발생했습니다.</Text>;

  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.item}>
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
    padding: 16,
    backgroundColor: "#fff",
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 12,
  },
  item: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  message: {
    fontSize: 16,
  },
  time: {
    color: "#888",
    fontSize: 12,
    marginTop: 4,
  },
});

export default NotificationScreen;