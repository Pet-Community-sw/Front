import React from "react";
import { View, Text, Image, StyleSheet, ScrollView } from "react-native";

// 더미 데이터 사용
const dummyPost = {
  postId: 1,
  title: "안녕하세요",
  content: "부산 사는 상남자 리트리버입니데이",
  postImageUrl: "https://images.unsplash.com/photo-1601758123927-1971b1c5bbd5?auto=format&fit=crop&w=800&q=80",
  viewCount: 0,
  likeCount: 0,
  profileId: 1,
  profileName: "초이선자이",
  profileImageUrl: "/profile/sample.png",
  createdAt: "17분 전",
  owner: true,
  comments: [
    {
      commentId: 2,
      content: "댓글입니데이~",
      likeCount: 1,
      profileId: 1,
      profileDogName: "/profile/sample2.png",
      profileImageUrl: "초이선자이",
      createdAt: "방금 전",
      postId: 1,
      owner: true,
    },
  ],
};

const PostDetailScreen = () => {
  const post = dummyPost; // API 대신 더미 데이터 사용

  return (
    <ScrollView style={styles.container}>
      {post.postImageUrl && (
        <Image source={{ uri: post.postImageUrl }} style={styles.postImage} />
      )}

      <Text style={styles.title}>{post.title}</Text>
      <Text style={styles.content}>{post.content}</Text>

      <View style={styles.metaSection}>
        <Text style={styles.meta}>작성자: {post.profileName}</Text>
        <Text style={styles.meta}>작성 시간: {post.createdAt}</Text>
        <Text style={styles.meta}>조회수: {post.viewCount} · 좋아요: {post.likeCount}</Text>
      </View>

      <Text style={styles.commentTitle}>💬 댓글</Text>
      {post.comments.length === 0 ? (
        <Text style={styles.noComment}>아직 댓글이 없어요!</Text>
      ) : (
        post.comments.map((comment) => (
          <View key={comment.commentId} style={styles.commentBox}>
            <Text style={styles.commentWriter}>{comment.profileImageUrl}</Text>
            <Text style={styles.commentText}>{comment.content}</Text>
            <Text style={styles.commentMeta}>{comment.createdAt}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
};

export default PostDetailScreen;

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
});
