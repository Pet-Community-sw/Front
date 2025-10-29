import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Modal,
} from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import { AntDesign } from "@expo/vector-icons";
import { useLikePost, useLikeList } from "../../hooks/useLikePost";
import { useViewRecommendPostDetail } from "../../hooks/useRecommend";
import { BASE_URL } from "../../api/apiClient";

export const FeedbackTab = ({ recommendRoutePostId }) => {
  const queryClient = useQueryClient();

  const {
    data: feedback,
    refetch,
    isLoading,
    isError,
  } = useViewRecommendPostDetail(recommendRoutePostId, {
    enabled: !!recommendRoutePostId,
  });

  const { mutate: likeMutate } = useLikePost();
  const { data: likeListData, refetch: refetchLikes } =
    useLikeList(recommendRoutePostId);

  const [liked, setLiked] = useState(false);
  const [likeModalVisible, setLikeModalVisible] = useState(false);

  useEffect(() => {
    if (feedback?.like !== undefined) setLiked(feedback.like);
  }, [feedback]);

  useEffect(() => {
    if (recommendRoutePostId) refetch();
  }, [recommendRoutePostId]);

  const handleLike = () => {
    likeMutate(
      { postId: recommendRoutePostId, postType: "RECOMMEND" },
      {
        onSuccess: (res) => {
          const msg =
            typeof res === "string" ? res : res?.message || JSON.stringify(res);
          const isLiked = msg.includes("생성");
          setLiked(isLiked);
          queryClient.invalidateQueries([
            "recommendPostDetail",
            recommendRoutePostId,
          ]);
          refetchLikes();
          refetch();
        },
      }
    );
  };

  if (isLoading)
    return <Text style={styles.statusText}>불러오는 중...</Text>;
  if (isError || !feedback)
    return <Text style={styles.statusText}>피드백을 불러오지 못했어요</Text>;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>📝 유저 피드백</Text>

      {/* 🔹 피드백 본문 카드 */}
      <View style={styles.feedbackContainer}>
        <View style={styles.profileRow}>
          <Image
            source={{
              uri: feedback.memberImageUrl
                ? `${BASE_URL}${feedback.memberImageUrl}`
                : undefined,
            }}
            style={styles.avatar}
          />
          <View>
            <Text style={styles.user}>{feedback.memberName}</Text>
            <Text style={styles.time}>{feedback.createdAt}</Text>
          </View>
        </View>

        <Text style={styles.feedbackTitle}>{feedback.title}</Text>
        <Text style={styles.feedbackContent}>
          {feedback.content || "아직 피드백 내용이 없습니다."}
        </Text>

        <View style={styles.likeRow}>
          <TouchableOpacity onPress={handleLike} style={styles.likeButton}>
            <AntDesign
              name={liked ? "heart" : "hearto"}
              size={22}
              color={liked ? "#ff6262" : "#999"}
            />
            <Text
              style={[styles.likeText, liked && { color: "#ff6262" }]}
            >{`좋아요 ${feedback.likeCount}`}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setLikeModalVisible(true)}>
            <Text style={styles.likeListText}>좋아요 목록 보기</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 💗 좋아요 목록 */}
      <Modal visible={likeModalVisible} animationType="slide" transparent={false}>
        <View style={styles.likeModalContainer}>
          <View style={styles.likeModalHeader}>
            <Text style={styles.likeModalTitle}>좋아요한 사람들</Text>
            <TouchableOpacity onPress={() => setLikeModalVisible(false)}>
              <Text style={styles.closeBtn}>닫기</Text>
            </TouchableOpacity>
          </View>

          {likeListData?.likeListDtos?.length > 0 ? (
            <ScrollView>
              {likeListData.likeListDtos.map((user, idx) => (
                <View key={idx} style={styles.likeUserRow}>
                  {user.memberImageUrl ? (
                    <Image
                      source={{ uri: `${BASE_URL}${user.memberImageUrl}` }}
                      style={styles.likeUserAvatar}
                    />
                  ) : (
                    <View
                      style={[styles.likeUserAvatar, styles.likeUserFallback]}
                    />
                  )}
                  <Text style={styles.likeUserName}>{user.memberName}</Text>
                </View>
              ))}
            </ScrollView>
          ) : (
            <Text style={styles.likeEmptyText}>
              아직 좋아요한 사용자가 없습니다.
            </Text>
          )}
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 18,
    backgroundColor: "#fff",
  },

  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#2c2c2c",
    marginBottom: 20,
    fontFamily: "cute",
  },

  feedbackContainer: {
    backgroundColor: "#fefaf6",
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: "#f3e5d7",
    marginBottom: 28,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },

  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },

  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1,
    borderColor: "#f4d8c6",
    marginRight: 12,
    backgroundColor: "#fff",
  },

  user: {
    fontWeight: "700",
    fontSize: 16,
    color: "#3d2a21",
  },

  time: {
    fontSize: 12,
    color: "#a58b7b",
    marginTop: 3,
  },

  feedbackTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2b2118",
    marginBottom: 8,
    fontFamily: "fontExtra",
  },

  feedbackContent: {
    fontSize: 15,
    lineHeight: 22,
    color: "#4b4037",
    fontFamily: "font",
    marginBottom: 14,
  },

  likeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },

  likeButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#fff2f2",
    borderWidth: 1,
    borderColor: "#ffdede",
  },

  likeText: {
    fontWeight: "600",
    color: "#6b6b6b",
  },

  likeListText: {
    fontSize: 14,
    color: "#5b4b3a",
    textDecorationLine: "underline",
  },

  // ✅ 좋아요 모달 (배경 제거, 전체 확장)
  likeModalContainer: {
    flex: 1,
    backgroundColor: "#fffaf7",
    paddingTop: 60,
    paddingHorizontal: 20,
  },

  likeModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    borderBottomWidth: 1,
    borderColor: "#f0e0d0",
    paddingBottom: 8,
  },

  likeModalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2b2118",
    fontFamily: "fontExtra",
  },

  closeBtn: {
    fontSize: 15,
    color: "#a47148",
    fontWeight: "600",
  },

  likeUserRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 0.8,
    borderColor: "#f3e5d7",
  },

  likeUserAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: "#f8f1eb",
  },

  likeUserName: {
    fontSize: 15,
    color: "#3c2b1e",
    fontWeight: "600",
  },

  likeUserFallback: {
    backgroundColor: "#e5d9c8",
  },

  likeEmptyText: {
    textAlign: "center",
    marginTop: 40,
    color: "#b3a89e",
    fontSize: 14,
  },

  statusText: {
    textAlign: "center",
    marginTop: 40,
    color: "#888",
  },
});
