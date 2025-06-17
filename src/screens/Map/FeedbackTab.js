//산책길 추천 코스 -> 산책길 피드백 탭
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
import { useViewRecommendPostDetail } from "../../hooks/useRecommend";
import { useLikePost } from "../../hooks/useLikePost";
import {
  usePostComment,
  useRemoveComment,
  useModifyComment, }
  from "../../hooks/usePostComment"

export const FeedbackTab = ({ recommendRoutePostId }) => {
  const {
    data: feedback,
    refetch,
    isLoading,
    isError,
  } = useViewRecommendPostDetail(recommendRoutePostId);

  const { mutate: like, isLoading: isLiking } = useLikePost();
  const { mutate: postComment } = usePostComment();
  const { mutate: removeComment } = useRemoveComment();
  const { mutate: modifyComment } = useModifyComment();

  const [commentInput, setCommentInput] = useState("");
  const [editCommentId, setEditCommentId] = useState(null);
  const [editCommentInput, setEditCommentInput] = useState("");

  /*useEffect(() => {
    refetch();
  }, []);*/

  const handleLike = () => {
    if (!isLiking) {
      like({ postId: recommendRoutePostId });
    }
  };

  const handleSubmitComment = () => {
    if (!commentInput.trim()) return;
    postComment(
      {
        postId: recommendRoutePostId,
        content: commentInput,
        postType: "RECOMMEND",
      },
      {
        onSuccess: () => {
          setCommentInput("");
        },
      }
    );
  };

  const handleDeleteComment = (commentId) => {
    removeComment({ commentId, postId: recommendRoutePostId, postType: "RECOMMEND" });
  };

  const handleEditComment = (commentId, content) => {
    setEditCommentId(commentId);
    setEditCommentInput(content);
  };

  const handleSubmitEdit = () => {
    if (!editCommentInput.trim()) return;
    modifyComment(
      {
        commentId: editCommentId,
        content: editCommentInput,
        postId: recommendRoutePostId,
        postType: "RECOMMEND",
      },
      {
        onSuccess: () => {
          setEditCommentId(null);
          setEditCommentInput("");
        },
      }
    );
  };

  if (isLoading) return <Text>불러오는 중...</Text>;
  if (isError || !feedback) return <Text>피드백을 불러오지 못했어요</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📝 유저 피드백</Text>

      <View style={styles.card}>
        <View style={styles.profileRow}>
          <Image source={{ uri: feedback.memberImageUrl }} style={styles.avatar} />
          <View>
            <Text style={styles.user}>{feedback.memberName}</Text>
            <Text style={styles.time}>{feedback.createdAt}</Text>
          </View>
        </View>

        <Text style={styles.feedbackTitle}>{feedback.title}</Text>
        <Text style={styles.content}>{feedback.content || "아직 피드백 내용이 없습니다."}</Text>

        <TouchableOpacity style={styles.likeRow} onPress={handleLike}>
          <Text style={[styles.heart, feedback.like ? styles.heartFilled : styles.heartEmpty]}>
            {feedback.like ? "❤️" : "🤍"}
          </Text>
          <Text style={styles.likes}>{feedback.likeCount}명에게 도움이 되었어요</Text>
        </TouchableOpacity>
      </View>

      {/* 댓글 목록 */}
      <View style={{ marginTop: 24 }}>
        <Text style={{ fontWeight: "600", marginBottom: 6 }}>🖍️ 댓글 목록</Text>
        {feedback.comments?.length > 0 ? (
          <FlatList
            data={feedback.comments}
            keyExtractor={(item) => item.commentId.toString()}
            renderItem={({ item }) => (
              <View style={{ marginBottom: 16 }}>
                <View style={styles.profileRow}>
                  <Image source={{ uri: item.memberImageUrl }} style={styles.avatar} />
                  <View>
                    <Text style={styles.user}>{item.memberName}</Text>
                    <Text style={styles.time}>{item.createdAt}</Text>
                  </View>
                </View>
                {editCommentId === item.commentId ? (
                  <>
                    <TextInput
                      value={editCommentInput}
                      onChangeText={setEditCommentInput}
                      style={styles.input}
                    />
                    <TouchableOpacity onPress={handleSubmitEdit} style={styles.submitBtn}>
                      <Text style={{ color: "#fff" }}>수정 완료</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <Text style={styles.content}>{item.content}</Text>
                    {item.owner && (
                      <View style={{ flexDirection: "row", gap: 10 }}>
                        <TouchableOpacity onPress={() => handleEditComment(item.commentId, item.content)}>
                          <Text style={{ fontSize: 13, color: "#555" }}>수정</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleDeleteComment(item.commentId)}>
                          <Text style={{ fontSize: 13, color: "red" }}>삭제</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </>
                )}
              </View>
            )}
          />
        ) : (
          <Text style={{ color: "#888" }}>댓글이 아직 없습니다.</Text>
        )}
      </View>

      {/* 댓글 입력 */}
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
