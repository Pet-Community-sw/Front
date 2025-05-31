import React, { useEffect } from "react";
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

export const FeedbackTab = ({ recommendRoutePostId }) => {
  const {
    data: feedback,
    refetch,
    isLoading,
    isError,
  } = useViewRecommendPostDetail(recommendRoutePostId);

  const { mutate: like, isLoading: isLiking } = useLikePost();

  useEffect(() => {
    refetch(); // 컴포넌트 진입 시 데이터 요청
  }, []);

  const handleLike = () => {
    if (!isLiking) {
      like({ postId: recommendRoutePostId });
    }
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
        {feedback.content ? (
          <Text style={styles.content}>{feedback.content}</Text>
        ) : (
          <Text style={styles.content}>아직 피드백 내용이 없습니다.</Text>
        )}

        {/* ❤️ 좋아요 */}
        <TouchableOpacity style={styles.likeRow} onPress={handleLike}>
          <Text style={[styles.heart, feedback.like ? styles.heartFilled : styles.heartEmpty]}>
            {feedback.like ? "❤️" : "🤍"}
          </Text>
          <Text style={styles.likes}>
            {feedback.likeCount}명에게 도움이 되었어요
          </Text>
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
});
