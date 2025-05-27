// 감성 스타일 적용된 PostListScreen + 상단 버튼 개선/작성 메시지/작성자 프로필 추가
import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";


const samplePosts = [
  {
    postId: 1,
    title: "오늘 강아지랑 한강 다녀왔어요!",
    memberName: "효빈",
    memberImageUrl: "https://placekitten.com/50/50",
    timeAgo: "2시간 전",
    viewCount: 123,
    likeCount: 15,
    postImageUrl: "https://placekitten.com/200/200",
  },
  {
    postId: 2,
    title: "산책로 추천해주세요~",
    memberName: "댕댕맘",
    memberImageUrl: "https://placekitten.com/51/51",
    timeAgo: "어제",
    viewCount: 87,
    likeCount: 7,
    postImageUrl: "",
  },
];

const PostListScreen = () => {
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [formData, setFormData] = useState({ title: "", content: "" });

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>💬 자유롭게 올리고 싶은 걸 올려보세요!</Text>
        <TouchableOpacity style={{ padding: 12, borderRadius: 100 }}
           onPress={() => setAddModalVisible(true)}>
          <MaterialCommunityIcons name="pencil-plus" size={30} color="#2A4759" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={samplePosts}
        keyExtractor={(item) => item.postId.toString()}
        contentContainerStyle={{ paddingBottom: 32 }}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card}>
            {item.postImageUrl ? (
              <Image source={{ uri: item.postImageUrl }} style={styles.thumbnail} />
            ) : null}
            <View style={styles.textSection}>
              <Text style={styles.title}>{item.title}</Text>
              <View style={styles.metaRow}>
                {item.memberImageUrl && (
                  <Image source={{ uri: item.memberImageUrl }} style={styles.profileImage} />
                )}
                <Text style={styles.meta}>
                  {item.memberName} · {item.timeAgo} · 조회수 {item.viewCount} · 좋아요 {item.likeCount}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />

      <Modal visible={addModalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>✍️ 새 게시글</Text>

            <View style={styles.imageUploadBox}>
              <Feather name="image" size={20} color="#7EC8C2" style={{ marginRight: 8 }} />
              <Text style={styles.imageUploadText}>이미지 첨부 (선택)</Text>
            </View>

            <TextInput
              placeholder="제목을 입력해주세요"
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
              style={styles.input}
            />
            <TextInput
              placeholder="내용을 입력해주세요"
              value={formData.content}
              onChangeText={(text) => setFormData({ ...formData, content: text })}
              style={[styles.input, { height: 100 }]}
              multiline
            />
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setAddModalVisible(false)} style={styles.cancelButton}>
                <Text style={styles.cancelText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitButton}>
                <Text style={styles.submitText}>등록</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default PostListScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4A7B9D",
    flex: 1,
  },
  addIconWrapper: {
    backgroundColor: "#F47C7C",
    padding: 10,
    borderRadius: 100,
  },
  card: {
    backgroundColor: "#FAFAFA",
    borderRadius: 12,
    marginBottom: 12,
    padding: 14,
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 2,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: "#ddd",
  },
  textSection: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
    color: "#2C3E50",
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileImage: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 6,
  },
  meta: {
    fontSize: 12,
    color: "#6B7B8C",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    width: "90%",
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#4A7B9D",
  },
  imageUploadBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E7F6F2",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  imageUploadText: {
    fontSize: 14,
    color: "#4A4A4A",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 14,
    backgroundColor: "#FDFDFD",
    fontSize: 14,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: "#F2F2F2",
  },
  submitButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: "#F47C7C",
  },
  cancelText: {
    color: "#888",
    fontWeight: "500",
  },
  submitText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
