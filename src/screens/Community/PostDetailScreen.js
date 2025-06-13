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
  Button,
} from "react-native";
import { UserContext } from "../../context/User";
import {
  useLikePost,
  useLikeList,
} from "../../hooks/useLikePost";
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
  const { data: post } = useViewOnePost(postId);

  const { refetch: refetchPosts } = useViewPosts();
  const { data: likeList, refetch: refetchLikes } = useLikeList(postId, "COMMUNITY");

  const { mutate: modifyMutate } = useModifyPost();
  const { mutate: removeMutate } = useRemovePost();
  const { mutate: likePostMutate } = useLikePost();
  const { mutate: postCommentMutate } = usePostComment();
  const { mutate: modifyCommentMutate } = useModifyComment();
  const { mutate: removeCommentMutate } = useRemoveComment();

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editData, setEditData] = useState({ postImageFile: "", title: "", content: "" });
  const [liked, setLiked] = useState(false);
  const [likeModalVisible, setLikeModalVisible] = useState(false);
  const [contentData, setContentData] = useState();
  const [contentEditData, setContentEditData] = useState();

  useEffect(() => {
    if (post?.like !== undefined) {
      setLiked(post.like);
    }
  }, [post]);

  const handlemodify = () => {
    modifyMutate(editData, {
      onSuccess: () => {
        Alert.alert("게시글 수정 성공!");
        refetchPosts();
        navigation.replace("PostDetail", { postId });
      },
      onError: (err) => {
        Alert.alert("게시글 수정 실패: ", err.message);
      },
    });
  };

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

  const handleEditData = (field, value) => {
    setEditData({ ...editData, [field]: value });
  };

  const resetEditData = () => {
    if (post) {
      setEditData({
        postImageFile: post. postImageFile || "", 
        title: post.title || "",
        content: post.content || "",
      });
    }
  };

  const handleLike = () => {
    likePostMutate(
      { postId, postType: "COMMUNITY" },
      {
        onSuccess: (data) => {
          setLiked(data?.includes("생성"));
          refetchPosts();
          refetchLikes();
        },
        onError: (err) => {
          Alert.alert("좋아요 요청 실패", err.message);
        },
      }
    );
  };

  const handleLikeList = () => {
    refetchLikes();
    setLikeModalVisible(true);
  };

  const handleAddComment = () => {
    if (!contentData?.trim()) return;
    postCommentMutate(
      { postId, content: contentData, postType: "COMMUNITY" },
      {
        onSuccess: () => {
          setContentData("");
          queryClient.invalidateQueries(["posts", postId]);
        },
        onError: (err) => {
          Alert.alert("댓글 등록 실패", err.message);
        },
      }
    );
  };

  const handleModifyComment = ({ commentId }) => {
    if (!contentEditData?.trim()) return;
    modifyCommentMutate(
      { commentId, postId, content: contentEditData },
      {
        onSuccess: () => {
          setContentEditData("");
          queryClient.invalidateQueries(["posts", postId]);
        },
        onError: (err) => {
          Alert.alert("댓글 수정 실패", err.message);
        },
      }
    );
  };

  const handleRemoveComment = ({ commentId }) => {
    removeCommentMutate(
      { commentId },
      {
        onSuccess: () => {
          queryClient.invalidateQueries(["posts", postId]);
        },
        onError: (err) => {
          Alert.alert("댓글 삭제 실패", err.message);
        },
      }
    );
  };

  const getFullImageUri = (path) =>
    path ? `${BASE_URL.replace(/\/$/, "")}/${path.replace(/^\/+/, "")}` : undefined;

  return (
    <ScrollView style={styles.container}>
      {post?.postImageUrl && (
        <Image source={{ uri: post.postImageUrl }} style={styles.postImage} />
      )}

      {post?.owner && (
        <View style={styles.actionsRow}>
          <TouchableOpacity onPress={() => setEditModalVisible(true)}>
            <Entypo name="pencil" size={24} color="black" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handledelete}>
            <AntDesign name="delete" size={24} color="red" />
          </TouchableOpacity>
        </View>
      )}
      <View style={styles.metaSection}>
        <Image
          source={{ uri: getFullImageUri(post?.postResponseDto?.memberImageUrl) }}
          style={styles.avatar}
        />
      </View>

      <View>
        <Text style={styles.meta}>작성자: {post?.postResponseDto?.memberName}</Text>
        <Text style={styles.meta}>작성 시간: {post?.postResponseDto?.createdAt}</Text>
        <Text style={styles.meta}>조회수: {post?.postResponseDto?.viewCount}</Text>
        <Text style={styles.meta} onPress={handleLikeList}>좋아요 수: {post?.postResponseDto?.likeCount}</Text>
      </View>

      <Text style={styles.title}>{post?.postResponseDto?.title || "제목 없음"}</Text>
      <Text style={styles.content}>{post?.content || "내용 없음"}</Text>


      <TouchableOpacity onPress={handleLike} style={{ alignSelf: "flex-start" }}>
        <AntDesign
          name={liked ? "like1" : "like2"}
          size={24}
          color={liked ? "#f66" : "#aaa"}
        />
      </TouchableOpacity>

      <Modal
  visible={editModalVisible}
  animationType="slide"
  transparent={true}
  onShow={resetEditData}
>
  <View style={{
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 20,
  }}>
    <View style={{
      backgroundColor: "white",
      borderRadius: 12,
      padding: 20,
    }}>
      <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 10 }}>게시글 수정</Text>

      <TextInput
        placeholder="제목"
        value={editData.title}
        onChangeText={(text) => handleEditData("title", text)}
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          borderRadius: 8,
          padding: 10,
          marginBottom: 12,
        }}
      />
      <TextInput
        placeholder="내용"
        value={editData.content}
        onChangeText={(text) => handleEditData("content", text)}
        multiline
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          borderRadius: 8,
          padding: 10,
          height: 120,
          textAlignVertical: "top",
          marginBottom: 16,
        }}
      />
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <TouchableOpacity onPress={() => setEditModalVisible(false)}>
          <Text style={{ color: "#aaa" }}>취소</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handlemodify}>
          <Text style={{ color: "#007aff" }}>저장</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
</Modal>


      <Modal visible={likeModalVisible} animationType="slide" transparent={true}>
        <ScrollView style={{ backgroundColor: "white", padding: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: "bold" }}>좋아요 목록</Text>
          {likeList?.map((user) => (
            <Text key={user.memberImageUrl}>{user.memberName}</Text>
          ))}
          <Text onPress={() => setLikeModalVisible(false)}>닫기</Text>
        </ScrollView>
      </Modal>

      <Text style={styles.commentTitle}>💬 댓글</Text>

      <View style={styles.commentArea}>
        <TextInput
          style={styles.input}
          placeholder="댓글을 입력하세요!"
          onChangeText={setContentData}
          value={contentData}
        />
        <TouchableOpacity onPress={handleAddComment} style={styles.commentButton}>
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
                  <TouchableOpacity onPress={() => handleModifyComment({ commentId: comment.commentId })}>
                    <Text>수정</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleRemoveComment({ commentId: comment.commentId })}>
                    <Text>삭제</Text>
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
    fontFamily: "fontExtra"
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
    color: "#444",
    marginBottom: 20,
    fontFamily: "font"
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
    marginBottom: -10, 
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
  commentTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginVertical: 12,
    color: "#222",
  },
  noComment: {
    fontSize: 14,
    color: "#aaa",
    textAlign: "center",
    marginVertical: 20,
  },
  commentBox: {
    paddingVertical: 14,
    paddingHorizontal: 10,
    backgroundColor: "#fdf9f4",
    borderRadius: 12,
    marginBottom: 10,
  },
  commentRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#f0d6c5",
  },
  commentContent: {
    flex: 1,
    marginLeft: 12,
  },
  commentWriter: {
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  commentMeta: {
    fontSize: 12,
    color: "#bbb",
    marginTop: 4,
  },
  commentActions: {
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginLeft: 10,
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
});


