import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  Modal,
  Alert,
} from "react-native";
import {
  useModifyPost,
  useRemovePost,
  useViewOnePost,
  useViewPosts,
} from "../../hooks/usePost";
import { AntDesign } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const PostDetailScreen = ({ route }) => {
  const navigation = useNavigation();
  const { postId } = route.params;

  const { data: post } = useViewOnePost(postId);

  const { mutate: modifyMutate } = useModifyPost();
  const { mutate: removeMutate } = useRemovePost();

  const { refetch } = useViewPosts();
  const [editModalVisible, setEditModalVisible] = useState(false);

  //게시글 수정 데이터
  const [editData, setEditData] = useState({
    title: "", 
    content: "", 
  })

  const handlemodify = () => {
    modifyMutate(editData, {
      onSuccess: (data) => {
        Alert.alert("게시글 수정 성공!");
        refetch();
        navigation.replace("PostDetail", { postId });
      }, 
      onError: (err) => {
        Alert.alert("게시글 수정 실패: ", err.message);
      }, 
    });
  };

  const handleEditData = (field, value) => {
    setEditData({...editData, [field]: value});
  }

  //수정 중 닫기 버튼 눌렀을 때, 입력값 초기화
  const resetEditData = () => {
    if(post) {
      setEditData({
        title: post.title || "", 
        content: post.content || "", 
      })
    }
  }

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
              refetch();
            },
            onError: (err) => {
              Alert.alert("오류: ", err.message);
            },
          });
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      {post.postImageUrl && (
        <Image source={{ uri: post.postImageUrl }} style={styles.postImage} />
      )}

      <TouchableOpacity
        style={styles.modify}
        onPress={() => setEditModalVisible(true)}
      >
        <Entypo name="pencil" size={24} color="black" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.delete} onPress={handledelete}>
        <AntDesign name="delete" size={24} color="red" />
      </TouchableOpacity>

      <Text style={styles.title}>{post.title}</Text>
      <Text style={styles.content}>{post.content}</Text>

      <View style={styles.metaSection}>
        <Text style={styles.meta}>작성자: {post.profileName}</Text>
        <Text style={styles.meta}>작성 시간: {post.createdAt}</Text>
        <Text style={styles.meta}>
          조회수: {post.viewCount} · 좋아요: {post.likeCount}
        </Text>
      </View>

      <Text style={styles.commentTitle}>💬 댓글</Text>
      {post.comments.length === 0 ? (
        <Text style={styles.noComment}>아직 댓글이 없어요!</Text>
      ) : (
        post.comments.map((comment) => (
          <View key={comment.commentId} style={styles.commentBox}>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
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
      {/*게시글 수정 모달*/}
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
              <Button title={"저장"} onPress={handlemodify} />
              <Button
                title={"취소"}
                onPress={() => {
                  resetEditData();
                  setEditModalVisible(false);
                }}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    width: '90%',
    borderRadius: 16,
    padding: 20,
    maxHeight: '80%',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
});
