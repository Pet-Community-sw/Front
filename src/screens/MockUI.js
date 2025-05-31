import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  FlatList,
} from "react-native";

export const Mock = () => {
  const [feedback, setFeedback] = useState({
    memberImageUrl: "https://placekitten.com/100/100",
    memberName: "김효빈",
    createdAt: "2025-05-15",
    title: "정말 좋은 산책길이었어요!",
    content: "햇살도 좋고 강아지가 좋아했어요. 추천합니다!",
    likeCount: 12,
    like: false,
    comments: [
      {
        commentId: 1,
        memberImageUrl: "https://placekitten.com/101/101",
        memberName: "멍멍이주인",
        createdAt: "2025-05-16",
        content: "저도 여기 자주 가요!",
        likeCount: 5,
      },
    ],
  });

  const [commentInput, setCommentInput] = useState("");

  const handleSubmitComment = () => {
    if (!commentInput.trim()) return;
    const newComment = {
      commentId: Date.now(),
      memberImageUrl: "https://placekitten.com/102/102",
      memberName: "새 유저",
      createdAt: new Date().toISOString().split("T")[0],
      content: commentInput,
      likeCount: 0,
    };
    setFeedback((prev) => ({
      ...prev,
      comments: [...prev.comments, newComment],
    }));
    setCommentInput("");
  };

  const handleLike = () => {
    setFeedback((prev) => ({
      ...prev,
      like: !prev.like,
      likeCount: prev.like ? prev.likeCount - 1 : prev.likeCount + 1,
    }));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📝 유저 피드백</Text>

      <View style={styles.card}>
        <View style={styles.profileRow}>
          <Image
            source={{ uri: feedback.memberImageUrl }}
            style={styles.avatar}
          />
          <View>
            <Text style={styles.user}>{feedback.memberName}</Text>
            <Text style={styles.time}>{feedback.createdAt}</Text>
          </View>
        </View>

        <Text style={styles.feedbackTitle}>{feedback.title}</Text>
        {feedback.content ? (
          <Text style={styles.content}>{feedback.content}</Text>
        ) : (
          <Text style={styles.content}>아직 피드백 내용이 없습니다.</Text>
        )}

        <TouchableOpacity style={styles.likeRow} onPress={handleLike}>
          <Text
            style={[styles.heart, feedback.like ? styles.heartFilled : styles.heartEmpty]}
          >
            {feedback.like ? "❤️" : "🤍"}
          </Text>
          <Text style={styles.likes}>
            {feedback.likeCount}명에게 도움이 되었어요
          </Text>
        </TouchableOpacity>
      </View>

      <View style={{ marginTop: 24 }}>
        <Text style={{ fontWeight: "600", marginBottom: 6 }}>🖍️ 댓글 목록</Text>
        {feedback.comments.length > 0 ? (
          feedback.comments.map((comment) => (
            <View key={comment.commentId} style={{ marginBottom: 16 }}>
              <View style={styles.profileRow}>
                <Image
                  source={{ uri: comment.memberImageUrl }}
                  style={styles.avatar}
                />
                <View>
                  <Text style={styles.user}>{comment.memberName}</Text>
                  <Text style={styles.time}>{comment.createdAt}</Text>
                </View>
              </View>
              <Text style={styles.content}>{comment.content}</Text>
              <Text style={styles.likes}>❤️ {comment.likeCount}</Text>
            </View>
          ))
        ) : (
          <Text style={{ color: "#888" }}>댓글이 아직 없습니다.</Text>
        )}
      </View>

      <View style={{ marginTop: 20 }}>
        <Text style={{ fontWeight: "600", marginBottom: 6 }}>✍️ 댓글 달기</Text>
        <TextInput
          value={commentInput}
          onChangeText={setCommentInput}
          placeholder="댓글을 입력하세요"
          style={styles.input}
        />
        <TouchableOpacity onPress={handleSubmitComment} style={styles.submitBtn}>
          <Text style={{ color: "#fff", fontWeight: "600" }}>댓글 등록</Text>
        </TouchableOpacity>
      </View>
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
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E6E6E6",
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  user: {
    fontWeight: "600",
    fontSize: 14,
    color: "#6D9886",
  },
  time: {
    fontSize: 12,
    color: "#888",
  },
  feedbackTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 4,
    color: "#2C3E50",
  },
  content: {
    fontSize: 14,
    color: "#444",
    fontFamily: "font",
    marginBottom: 8,
  },
  likeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  heart: {
    fontSize: 18,
    marginRight: 6,
  },
  heartFilled: {
    color: "red",
  },
  heartEmpty: {
    color: "#aaa",
  },
  likes: {
    fontSize: 13,
    color: "#999",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  submitBtn: {
    backgroundColor: "#8DB596",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
});

export default Mock;
