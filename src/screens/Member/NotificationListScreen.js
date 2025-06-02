import React, { useFocusEffect, useCallback, useContext } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useNotificationList } from "../../hooks/useNotification";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { NotificationContext } from "../context/Notification";

const NotificationScreen = () => {
  const navigation = useNavigation();
  const { data, isLoading, isError, refetch } = useNotificationList();
  const { setNewNoti } = useContext(NotificationContext);

  if (isLoading) return <Text style={styles.statusText}>불러오는 중...</Text>;
  if (isError)
    return <Text style={styles.statusText}>오류가 발생했습니다.</Text>;

  useFocusEffect(
    useCallback(() => {
      refetch();
      setNewNoti(false); //알림 목록 들어오면 빨간 뱃지 끔
    }, [])
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🔔 알림 목록</Text>
      </View>

      <FlatList
        data={data}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.message}>{item.message}</Text>
            <Text style={styles.time}>{item.createdAt}</Text>
            <Text style={styles.notiTime}>{item.notificationTime}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 48,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  backButton: {
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
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
    color: "#666",
    fontSize: 12,
    marginTop: 4,
  },
  notiTime: {
    color: "#aaa",
    fontSize: 11,
    marginTop: 2,
    fontStyle: "italic",
  },
  statusText: {
    textAlign: "center",
    marginTop: 30,
    fontSize: 16,
    color: "#999",
  },
});

export default NotificationScreen;
