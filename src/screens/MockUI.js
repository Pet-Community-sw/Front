import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

export default function Mock() {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  const dummyData = [
    {
      walkingTogetherPostId: 1,
      title: "망고랑 함께해요",
      scheduledTime: "2025-06-02 17:00",
      writerName: "효빈",
      petName: "망고",
      currentCount: 2,
      limitCount: 5,
      createdAt: "2025-06-01",
      filtering: false,
      isOwner: true,
    },
    {
      walkingTogetherPostId: 2,
      title: "루비 산책할 친구 구해요",
      scheduledTime: "2025-06-03 09:30",
      writerName: "루비맘",
      petName: "루비",
      currentCount: 1,
      limitCount: 3,
      createdAt: "2025-06-01",
      filtering: true,
      isOwner: false,
    },
  ];

  const openModal = (post) => {
    setSelectedPost(post);
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🐾 함께 산책해요</Text>

      <FlatList
        data={dummyData}
        keyExtractor={(item) => item.walkingTogetherPostId.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => openModal(item)}
          >
            <Text style={styles.walkTitle}>{item.title}</Text>
            <Text style={styles.walkMeta}>
              {item.scheduledTime} · {item.writerName}
            </Text>
            <View style={styles.matchButton}>
              <MaterialIcons name="check-circle" size={18} color="#7EC8C2" />
              <Text style={styles.matchText}>매칭 글 쓰기</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>등록된 글이 없어요!</Text>
        }
      />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalWrapper}>
          <View style={styles.modalContent}>
            {selectedPost ? (
              <>
                <Text style={styles.modalTitle}>
                  🐶 {selectedPost.petName}와 산책해요
                </Text>
                <Text style={styles.meta}>일시: {selectedPost.scheduledTime}</Text>
                <Text style={styles.meta}>
                  인원: {selectedPost.currentCount} / {selectedPost.limitCount}
                </Text>
                <Text style={styles.meta}>등록일: {selectedPost.createdAt}</Text>

                {selectedPost.filtering ? (
                  <Text style={[styles.meta, { color: "red" }]}>
                    ⚠️ 함께 산책이 제한된 대상입니다
                  </Text>
                ) : selectedPost.isOwner ? (
                  <View style={styles.buttonRow}>
                    <TouchableOpacity>
                      <Text style={styles.editButton}>수정</Text>
                    </TouchableOpacity>
                    <TouchableOpacity>
                      <Text style={styles.deleteButton}>삭제</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity style={styles.applyBtn}>
                    <Text style={styles.applyText}>매칭 시작</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.closeText}>닫기</Text>
                </TouchableOpacity>
              </>
            ) : (
              <Text>불러오는 중...</Text>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

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
  empty: {
    textAlign: "center",
    color: "#aaa",
    fontSize: 14,
    marginTop: 40,
  },
  modalWrapper: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
  },
  meta: {
    fontSize: 14,
    marginBottom: 6,
    color: "#333",
  },
  applyBtn: {
    marginTop: 10,
    backgroundColor: "#7EC8C2",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  applyText: {
    color: "#fff",
    fontWeight: "600",
  },
  closeBtn: {
    marginTop: 12,
    alignItems: "center",
  },
  closeText: {
    color: "#7E7E7E",
    fontSize: 13,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 20,
    marginTop: 10,
  },
  editButton: {
    color: "#555",
    fontWeight: "600",
  },
  deleteButton: {
    color: "red",
    fontWeight: "600",
  },
});
