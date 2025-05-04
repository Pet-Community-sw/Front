import React from "react";
import { View, Text, Image, StyleSheet, ScrollView } from "react-native";
import { useModifyPost, useRemovePost, useViewOnePost } from "../../hooks/usePost";

const PostDetailScreen = ({route}) => {
  const {postId} = route.params;

  const {mutate: modifyMutate} = useModifyPost();
  const {mutate: removeMutate} = useRemovePost();

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
