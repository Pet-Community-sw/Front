import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  Modal,
  TextInput,
  Button,
  TouchableOpacity,
} from "react-native";

const fakePost = {
  postId: 1,
  title: "테스트 게시글 제목",
  content: "이건 테스트용 게시글 내용입니다. 😎",
  profileName: "멍냥이",
  createdAt: "방금 전",
  postImageUrl: "https://placekitten.com/400/300",
  viewCount: 123,
  likeCount: 45,
  comments: [
    {
      commentId: 1,
      content: "첫 번째 댓글입니다!",
      profileImageUrl: "https://placekitten.com/50/50",
      profileName: "냥이",
      createdAt: "1분 전",
    },
    {
      commentId: 2,
      content: "두 번째 댓글~",
      profileImageUrl: "https://placekitten.com/51/51",
      profileName: "댕댕이",
      createdAt: "2분 전",
    },
  ],
};

export default function PostDetailMock() {
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editData, setEditData] = useState({
    title: fakePost.title,
    content: fakePost.content,
  });

  const handleEditData = (field, value) => {
    setEditData({ ...editData, [field]: value });
  };

  const [contentData, setContentData] = useState("");

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: fakePost.postImageUrl }} style={styles.postImage} />

      <TouchableOpacity style={styles.modify} onPress={() => setEditModalVisible(true)}>
        <Text style={{ fontWeight: "bold" }}>✏ 수정</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.delete}>
        <Text style={{ color: "red" }}>🗑 삭제</Text>
      </TouchableOpacity>

      <Text style={styles.title}>{fakePost.title}</Text>
      <Text style={styles.content}>{fakePost.content}</Text>

      <View style={styles.metaSection}>
        <Text style={styles.meta}>작성자: {fakePost.profileName}</Text>
        <Text style={styles.meta}>작성 시간: {fakePost.createdAt}</Text>
        <Text style={styles.meta}>
          조회수: {fakePost.viewCount} · 좋아요: {fakePost.likeCount}
        </Text>
      </View>

      <Text style={styles.commentTitle}>💬 댓글</Text>

      {/* ✅ 댓글 입력창 */}
      <View style={styles.commentInputRow}>
        <TextInput
          style={styles.commentInput}
          placeholder="댓글을 입력하세요!"
          value={contentData}
          onChangeText={setContentData}
        />
        <TouchableOpacity style={styles.commentButton}>
          <Text style={{ color: "#333" }}>추가</Text>
        </TouchableOpacity>
      </View>

      {fakePost.comments.length === 0 ? (
        <Text style={styles.noComment}>아직 댓글이 없어요!</Text>
      ) : (
        fakePost.comments.map((comment) => (
          <View key={comment.commentId} style={styles.commentBox}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Image
                source={{ uri: comment.profileImageUrl }}
                style={{ width: 30, height: 30, borderRadius: 15 }}
              />
              <Text style={styles.commentWriter}>{comment.profileName}</Text>
            </View>

            <Text style={styles.commentText}>{comment.content}</Text>
            <Text style={styles.commentMeta}>{comment.createdAt}</Text>
          </View>
        ))
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text>게시글 수정</Text>
            <ScrollView style={{ maxHeight: "80%" }}>
              <TextInput
                value={editData.title}
                placeholder="글 제목"
                onChangeText={(text) => handleEditData("title", text)}
              />
              <TextInput
                value={editData.content}
                placeholder="글 내용"
                onChangeText={(text) => handleEditData("content", text)}
              />
              <Button title={"저장"} onPress={() => setEditModalVisible(false)} />
              <Button title={"취소"} onPress={() => setEditModalVisible(false)} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#FDFAF6",
  },
  postImage: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 8,
  },
  content: {
    fontSize: 16,
    marginBottom: 12,
  },
  metaSection: {
    marginBottom: 16,
  },
  meta: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
  },
  commentTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginVertical: 8,
  },
  noComment: {
    fontSize: 14,
    color: "#999",
  },
  commentBox: {
    marginTop: 8,
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 8,
  },
  commentWriter: {
    fontWeight: "bold",
  },
  commentText: {
    fontSize: 14,
    marginTop: 4,
  },
  commentMeta: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },
  commentInputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  commentInput: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    marginRight: 8,
  },
  commentButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#FEEFC3",
    borderRadius: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    width: "90%",
    borderRadius: 16,
    padding: 20,
    maxHeight: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
});
