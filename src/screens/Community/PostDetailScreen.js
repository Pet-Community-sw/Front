import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  Modal,
  Alert,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { UserContext } from "../../context/User";
import { useLikePost, useLikeList } from "../../hooks/useLikePost";
import {
  useModifyPost,
  useRemovePost,
  useViewOnePost,
  useViewPosts,
} from "../../hooks/usePost";
import {
  usePostComment,
  useModifyComment,
  useRemoveComment,
} from "../../hooks/usePostComment";
import { AntDesign, Entypo } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";
import { BASE_URL } from "../../api/apiClient";

const PostDetailScreen = ({ route }) => {
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const { loggedId } = useContext(UserContext);
  const { postId } = route.params;

  // ✅ 게시글 상세 / 좋아요 목록
  const { data: post } = useViewOnePost(postId);
  const { refetch: refetchPosts } = useViewPosts();
  const { data: likeListData, refetch: refetchLikes } = useLikeList(postId);

  // ✅ mutation hooks
  const { mutate: modifyMutate } = useModifyPost();
  const { mutate: removeMutate } = useRemovePost();
  const { mutate: likePostMutate } = useLikePost();
  const { mutate: postCommentMutate } = usePostComment();
  const { mutate: modifyCommentMutate } = useModifyComment();
  const { mutate: removeCommentMutate } = useRemoveComment();

  // ✅ 상태 관리
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editData, setEditData] = useState({
    postImageFile: "",
    title: "",
    content: "",
  });
  const [liked, setLiked] = useState(false);
  const [likeModalVisible, setLikeModalVisible] = useState(false);
  const [contentData, setContentData] = useState();
  const [contentEditData, setContentEditData] = useState();
  const [postImageRatio, setPostImageRatio] = useState(1);

  // ✅ 좋아요 상태 반영
  useEffect(() => {
    if (post?.like !== undefined) setLiked(post.like);
  }, [post]);

  /** 게시글 수정 */
  const handlemodify = () => {
    modifyMutate(editData, {
      onSuccess: () => {
        Alert.alert("게시글 수정 성공!");
        refetchPosts();
        navigation.replace("PostDetail", { postId });
      },
      onError: (err) => {
        Alert.alert("게시글 수정 실패", err.message);
      },
    });
  };

  /** 게시글 삭제 */
  const handledelete = () => {
    Alert.alert("정말 삭제하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        onPress: () => {
          removeMutate(postId, {
            onSuccess: () => {
              Alert.alert("게시글이 삭제되었습니다.");
              navigation.navigate("PostList");
              refetchPosts();
            },
            onError: (err) => {
              Alert.alert("오류", String(err.message));
            },
          });
        },
      },
    ]);
  };

  /** 수정 데이터 입력 */
  const handleEditData = (field, value) => {
    setEditData({ ...editData, [field]: value });
  };

  /** 수정 모달 초기화 */
  const resetEditData = () => {
    if (post) {
      setEditData({
        postImageFile: post.postImageFile || "",
        title: post.title || "",
        content: post.content || "",
      });
    }
  };

  /** ✅ 좋아요 토글 */
  const handleLike = () => {
    likePostMutate(
      { postId, postType: "COMMUNITY" },
      {
        onSuccess: (res) => {
          const msg =
            typeof res === "string" ? res : res?.message || JSON.stringify(res);

          const isLiked = msg.includes("생성"); // “좋아요 생성했습니다.” → true
          setLiked(isLiked);

          // ✅ 상세 캐시 즉시 반영 (재진입 시 상태 유지)
          queryClient.setQueryData(["posts", postId], (old) => {
            if (!old) return old;
            const prevLiked = !!old.like;
            const prevCount = Number(old.postResponseDto?.likeCount || 0);
            const countDelta = isLiked
              ? prevLiked
                ? 0
                : 1
              : prevLiked
              ? -1
              : 0;
            const nextCount = Math.max(0, prevCount + countDelta);

            return {
              ...old,
              like: isLiked,
              postResponseDto: old.postResponseDto
                ? { ...old.postResponseDto, likeCount: nextCount }
                : old.postResponseDto,
            };
          });

          // 목록/좋아요 리스트 새로고침
          refetchPosts();
          refetchLikes();
        },
        onError: (err) => {
          Alert.alert("좋아요 요청 실패", err.message);
        },
      }
    );
  };

  /** ✅ 좋아요 목록 보기 */
  const handleLikeList = () => {
    refetchLikes();
    setLikeModalVisible(true);
  };

  /** 댓글 등록 */
  const handleAddComment = () => {
    if (!contentData?.trim()) {
      Alert.alert("알림", "댓글 내용을 입력해주세요.");
      return;
    }

    postCommentMutate(
      { postId, content: contentData },
      {
        onSuccess: () => {
          setContentData("");
          queryClient.invalidateQueries(["comments", postId]);
          queryClient.invalidateQueries(["posts", postId]); // 게시글 상세 갱신
        },
        onError: (err) => {
          console.error("❌ 댓글 등록 실패:", err);
          Alert.alert("댓글 등록 실패", err.response?.data || err.message);
        },
      }
    );
  };

  /** 댓글 수정 */
  const handleModifyComment = ({ commentId }) => {
    if (!contentEditData?.trim()) {
      Alert.alert("알림", "수정할 댓글 내용을 입력해주세요.");
      return;
    }

    modifyCommentMutate(
      { commentId, postId, content: contentEditData },
      {
        onSuccess: () => {
          setContentEditData("");
          queryClient.invalidateQueries(["comments", postId]);
          queryClient.invalidateQueries(["posts", postId]);
        },
        onError: (err) => {
          console.error("❌ 댓글 수정 실패:", err);
          Alert.alert("댓글 수정 실패", err.response?.data || err.message);
        },
      }
    );
  };

  /** 댓글 삭제 */
  const handleRemoveComment = ({ commentId }) => {
    Alert.alert("댓글 삭제", "정말 삭제하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: () => {
          removeCommentMutate(
            { commentId },
            {
              onSuccess: () => {
                queryClient.invalidateQueries(["comments", postId]);
                queryClient.invalidateQueries(["posts", postId]);
                Alert.alert("삭제 완료", "댓글이 삭제되었습니다.");
              },
              onError: (err) => {
                console.error("❌ 댓글 삭제 실패:", err);
                Alert.alert(
                  "댓글 삭제 실패",
                  err.response?.data || err.message
                );
              },
            }
          );
        },
      },
    ]);
  };

  /** 이미지 경로 변환 */
  const getFullImageUri = (path) =>
    path
      ? `${BASE_URL.replace(/\/$/, "")}/${path.replace(/^\/+/, "")}`
      : undefined;

  return (
    <ScrollView style={styles.container}>
      {/* 헤더 카드: 작성자 + 액션 */}
      <View style={styles.headerCard}>
        <View style={styles.authorRow}>
          {post?.postResponseDto?.memberImageUrl ? (
            <Image
              source={{
                uri: getFullImageUri(post.postResponseDto.memberImageUrl),
              }}
              style={styles.avatar}
            />
          ) : (
            <View style={[styles.avatar, styles.avatarFallback]} />
          )}
          <View style={{ flex: 1 }}>
            <Text style={styles.authorName}>
              {post?.postResponseDto?.memberName || "익명"}
            </Text>
            <Text style={styles.createdText}>
              {post?.postResponseDto?.createdAt}
            </Text>
          </View>

          {post?.owner && (
            <View style={styles.actionsRow}>
              <TouchableOpacity
                onPress={() => setEditModalVisible(true)}
                style={styles.iconBtn}
              >
                <Entypo name="pencil" size={20} color="#333" />
              </TouchableOpacity>
              <TouchableOpacity onPress={handledelete} style={styles.iconBtn}>
                <AntDesign name="delete" size={20} color="#FF6B6B" />
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.statRow}>
          <View style={styles.chip}>
            <Text style={styles.chipText}>
              조회 {post?.postResponseDto?.viewCount ?? 0}
            </Text>
          </View>
          <TouchableOpacity onPress={handleLikeList}>
            <View style={[styles.chip, styles.likeChip]}>
              <AntDesign name="heart" size={14} color="#FF6B6B" />
              <Text style={[styles.chipText, { marginLeft: 6 }]}>
                좋아요 {post?.postResponseDto?.likeCount ?? 0}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* 타이틀 & 본문 */}
      <Text style={styles.title}>
        {post?.postResponseDto?.title || "제목 없음"}
      </Text>
      <Text style={styles.content}>{post?.content || "내용 없음"}</Text>

      {/* 본문 이미지 */}
      {post?.postResponseDto?.postImageUrl && (
        <Image
          source={{ uri: getFullImageUri(post.postResponseDto.postImageUrl) }}
          style={[styles.postImage, { aspectRatio: postImageRatio }]}
          resizeMode="contain"
          onLoad={(e) => {
            const w = e.nativeEvent?.source?.width;
            const h = e.nativeEvent?.source?.height;
            if (w && h) {
              setPostImageRatio(w / h);
            }
          }}
        />
      )}

      {/* 좋아요 버튼 영역 */}
      <View style={styles.likeRow}>
        <TouchableOpacity onPress={handleLike} style={styles.likeButton}>
          <AntDesign
            name={liked ? "like1" : "like2"}
            size={22}
            color={liked ? "#FF6B6B" : "#999"}
          />
          <Text style={[styles.likeText, liked && { color: "#FF6B6B" }]}>
            {liked ? "좋아요 취소" : "좋아요"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleLikeList}
          style={styles.likeListButton}
        >
          <Text style={styles.likeListText}>
            좋아요 {post?.postResponseDto?.likeCount ?? 0}명 보기
          </Text>
        </TouchableOpacity>
      </View>

      {/* ✅ 좋아요 목록 모달 (하단 카드) */}
      <Modal visible={likeModalVisible} animationType="fade" transparent>
        <View style={styles.likeModalBackdrop}>
          <View style={styles.likeModalCard}>
            <View style={styles.likeModalHeader}>
              <Text style={styles.likeModalTitle}>좋아요한 사람들</Text>
              <TouchableOpacity
                onPress={() => setLikeModalVisible(false)}
                style={styles.likeModalClose}
              >
                <Text style={styles.likeModalCloseText}>닫기</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 380 }}>
              {likeListData?.likeListDtos?.length > 0 ? (
                likeListData.likeListDtos.map((user, idx) => (
                  <View
                    key={`${user.memberId || idx}`}
                    style={styles.likeUserRow}
                  >
                    {user.memberImageUrl ? (
                      <Image
                        source={{ uri: getFullImageUri(user.memberImageUrl) }}
                        style={styles.likeUserAvatar}
                      />
                    ) : (
                      <View
                        style={[styles.likeUserAvatar, styles.likeUserFallback]}
                      />
                    )}
                    <Text style={styles.likeUserName}>{user.memberName}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.likeEmptyText}>
                  아직 좋아요한 사용자가 없습니다.
                </Text>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Text style={styles.commentTitle}>💬 댓글</Text>

      <View style={styles.commentArea}>
        <TextInput
          style={styles.input}
          placeholder="댓글을 입력하세요!"
          onChangeText={setContentData}
          value={contentData}
        />
        <TouchableOpacity
          onPress={handleAddComment}
          style={styles.commentButton}
        >
          <Text>추가</Text>
        </TouchableOpacity>
      </View>

      {post?.comments?.length === 0 ? (
        <Text style={styles.noComment}>아직 댓글이 없어요!</Text>
      ) : (
        post?.comments?.map((comment) => (
          <View key={comment.commentId} style={styles.commentBox}>
            <View style={styles.commentRow}>
              <Image
                source={{ uri: getFullImageUri(comment.memberImageUrl) }}
                style={styles.commentAvatar}
              />
              <View style={styles.commentContent}>
                <Text style={styles.commentWriter}>{comment.memberName}</Text>
                <Text>{comment.content}</Text>
                <Text style={styles.commentMeta}>{comment.createdAt}</Text>
              </View>
              {comment.owner && (
                <View style={styles.commentActions}>
                  <TouchableOpacity
                    style={styles.commentActionBtn}
                    onPress={() =>
                      handleModifyComment({ commentId: comment.commentId })
                    }
                  >
                    <Text style={styles.commentActionText}>수정</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.commentActionBtn,
                      { backgroundColor: "#f6d0c5" },
                    ]}
                    onPress={() =>
                      handleRemoveComment({ commentId: comment.commentId })
                    }
                  >
                    <Text
                      style={[styles.commentActionText, { color: "#7a3d2c" }]}
                    >
                      삭제
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
};

export default PostDetailScreen;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fffefc",
  },
  headerCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 16,
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  postImage: {
    width: "100%",
    height: 220,
    borderRadius: 16,
    marginBottom: 20,
  },
  title: {
    fontSize: 30,
    marginBottom: 10,
    color: "#333",
    marginTop: 10,
    fontFamily: "fontExtra",
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
    color: "#444",
    marginBottom: 20,
    fontFamily: "font",
  },
  metaSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    marginTop: -30,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#f4d8c6",
  },
  avatarFallback: {
    backgroundColor: "#F2F2F2",
  },
  authorName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginLeft: 13, 
  },
  createdText: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 2,
    marginLeft: 13, 
  },
  meta: {
    fontSize: 15,
    color: "#777",
    fontFamily: "cute",
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 16,
    marginBottom: 12,
  },
  iconBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#F7F7F7",
  },
  statRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F6F7FB",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  likeChip: {
    backgroundColor: "#FFF5F5",
    borderWidth: 1,
    borderColor: "#FFE3E3",
  },
  chipText: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "600",
  },
  likeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  likeButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFF5F5",
    borderWidth: 1,
    borderColor: "#FFE3E3",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  likeText: {
    color: "#666",
    fontWeight: "600",
  },
  likeListButton: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  likeListText: {
    color: "#374151",
    fontWeight: "600",
  },
  commentTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginVertical: 12,
    color: "#2b2118",
    fontFamily: "fontExtra", 
    paddingLeft: 4,
    marginTop: 20, 
    marginBottom: -2, 
  },
  commentBox: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    backgroundColor: "#fffaf7",
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#f3e5d7",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
  },
  commentRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#f0d6c5",
    backgroundColor: "#fef6f1",
  },
  commentContent: {
    flex: 1,
    marginLeft: 12,
  },
  commentWriter: {
    fontWeight: "600",
    color: "#2c2c2c",
    marginBottom: 4,
    fontSize: 15,
  },
  commentText: {
    fontSize: 14,
    color: "#444",
    lineHeight: 20,
    marginBottom: 6,
  },
  commentMeta: {
    fontSize: 12,
    color: "#b5a597",
  },
  commentActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginLeft: 10,
  },
  commentActionBtn: {
    backgroundColor: "#f8e9d0",
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
  },
  commentActionText: {
    color: "#5b4b3a",
    fontWeight: "600",
    fontSize: 13,
  },

  commentArea: {
    flexDirection: "row", 
    alignItems: "center",
    marginVertical: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: "#f0e0d0",
    borderRadius: 12,
    backgroundColor: "#fdf7f0",
  },

  input: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#ddd0c0",
    borderRadius: 8,
    backgroundColor: "#fffaf7",
    marginRight: 10,
  },
  commentButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: "#f8d57e",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  likeModalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },
  likeModalCard: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  likeModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  likeModalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  likeModalClose: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
  },
  likeModalCloseText: {
    color: "#374151",
    fontWeight: "600",
  },
  likeUserRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  likeUserAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
    backgroundColor: "#F3F4F6",
  },
  likeUserFallback: {
    backgroundColor: "#E5E7EB",
  },
  likeUserName: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "600",
  },
  likeEmptyText: {
    color: "#6B7280",
    textAlign: "center",
    paddingVertical: 20,
  },
});
