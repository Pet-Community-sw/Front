import React, { useEffect, useState, useContext, useQueryClient } from "react";
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
import {UserContext} from "../../context/User"
import { useLikePost, useLikeList } from "../../hooks/useLikePost";
import { useModifyPost, useRemovePost, useViewOnePost, useViewPosts } from "../../hooks/usePost";
import { usePostComment, useModifyComment, useRemoveComment } from "../../hooks/usePostComment";

import { AntDesign } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const PostDetailScreen = ({ route }) => {
  const navigation = useNavigation();
  const queryClient = useQueryClient();

  //현재 로그인한 멤버 아이디 가져오기
  const { loggedId } = useContext(UserContext);

  const { postId } = route.params;

  const { data: post } = useViewOnePost(postId);
  
  //게시글, 좋아요 목록 조회 훅
  const { refetch: refetchPosts } = useViewPosts();
  const { data: likeList, refetch: refetchLikes } = useLikeList(postId, "COMMUNITY");

  //게시글 수정, 삭제 훅
  const { mutate: modifyMutate } = useModifyPost();
  const { mutate: removeMutate } = useRemovePost();

  //좋아요 추가 훅
  const { mutate: likePostMutate } = useLikePost();
  
  //댓글 조회, 추가, 수정, 삭제 훅
  const { mutate: postCommentMutate } = usePostComment();
  const { mutate: modifyCommentMutate } = useModifyComment();
  const { mutate: removeCommentMutate } = useRemoveComment();

  const [editModalVisible, setEditModalVisible] = useState(false);

  //컴포넌트 렌더링 시, 해당 게시물 좋아요 했는지 확인
  useEffect(() => {
    if (post?.like !== undefined) {
      setLiked(post.like);  // 서버에서 받은 like 상태로 초기화
    }
  }, [post]);

  //게시글 수정 데이터
  const [editData, setEditData] = useState({
    title: "", 
    content: "", 
  })

  //좋아요 상태
  const [liked, setLiked] = useState(false);
  const [likeModalVisible, setLikeModalVisible] = useState(false);

  //댓글 데이터
  const [contentData, setContentData] = useState();
  const [contentEditData, setContentEditData] = useState();


  const handlemodify = () => {
    modifyMutate(editData, {
      onSuccess: (data) => {
        Alert.alert("게시글 수정 성공!");
        refetchPosts();
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

  //게시물 삭제
  const handledelete = () => {
    Alert.alert("정말 삭제하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        onSuccess: () => {
          removeMutate(postId, {
            onSuccess: () => {
              Alert.alert("게시글이 삭제되었습니다.");
              navigation.navigate("PostList");
              refetchPosts();
            },
            onError: (err) => {
              Alert.alert("오류: ", err.message);
            },
          });
        },
      },
    ]);
  };

  //좋아요 버튼 클릭 시
  const handleLike = () => {
    likePostMutate(
      {postId, postType: "COMMUNITY"}, 
      {
        onSuccess: (data) => {
        if (data?.includes("생성")) {
          setLiked(true);
        } else if (data?.includes("삭제")) {
          setLiked(false);
        }
        refetchPosts();
        refetchLikes();
      },
        onError: (err) => {
          Alert.alert("좋아요 요청 실패", err.message);
        }, 
      }
    );
  };

  //좋아요 목록 조회
  const handleLikeList = () => {
    refetchLikes();
    setLikeModalVisible(true);
  }

  //댓글 추가
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
        }
      }
    );
  };
  
  //댓글 수정
  const handleModifyComment = ({commentId}) => {
    if (!contentEditData?.trim()) return;
    modifyCommentMutate({
      commentId, postId, content: contentEditData
    }, {
      onSuccess: () => {
        setContentEditData("");
        queryClient.invalidateQueries(["posts", postId]);
      }, 
      onError: (err) => {
          Alert.alert("댓글 수정 실패", err.message);
      }
    })
  }

  //댓글 삭제
  const handleRemoveComment = ({commentId}) => {
    removeCommentMutate({
      commentId, 
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries(["posts", postId]);
      }, 
      onError: (err) => {
          Alert.alert("댓글 삭제 실패", err.message);
      }
    })
  }
  

  return (
    <ScrollView style={styles.container}>
      {post.postImageUrl && (
        <Image source={{ uri: post.postImageUrl }} style={styles.postImage} />
      )}

      {post.owner && (
        <>
        <TouchableOpacity
        style={styles.modify}
        onPress={() => setEditModalVisible(true)}
      >
        <Entypo name="pencil" size={24} color="black" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.delete} onPress={handledelete}>
        <AntDesign name="delete" size={24} color="red" />
      </TouchableOpacity>
      </>
      )}

      <Text style={styles.title}>{post.title}</Text>
      <Text style={styles.content}>{post.content}</Text>

      <View style={styles.metaSection}>
        <Text style={styles.meta}>작성자: {post.profileName}</Text>
        <Text style={styles.meta}>작성 시간: {post.createdAt}</Text>
        <Text style={styles.meta}>
          조회수: {post.viewCount}
        </Text>
        <Text styles={styles.meta} onPress={handleLikeList}>좋아요: {post.likeCount}</Text>
      </View>

      {/* 좋아요 버튼 */}
      <View style={{ marginVertical: 12 }}>
        <TouchableOpacity onPress={handleLike}>
          <AntDesign
            name={liked ? "like1" : "like2"}
            size={24}
            color={liked ? "#f66" : "#aaa"}
          />
        </TouchableOpacity>
      </View>

      {/* 좋아요 목록 모달*/}
      <Modal visible={likeModalVisible} animationType="slide" transparent={true}>
        <Text style={{ fontSize: 18, fontWeight: "bold" }}>좋아요 목록</Text>
        <ScrollView>
            {likeList?.map((likeList) => (
              <Text key={likeList.memberImageUrl}>{likeList.memberName}</Text>
            ))}
        </ScrollView>
        <Text onPress={() => setLikeModalVisible(false)}>닫기</Text>
      </Modal>

      <Text style={styles.commentTitle}>💬 댓글</Text>
      <View style={styles.commentArea}>
      <TextInput
        style={input}
        placeholder="댓글을 입력하세요!"
        onChangeText={setContentData}
        value={contentData}>
      </TextInput>
      <TouchableOpacity onPress={handleAddComment} style={commentButton}>
        <Text>추가</Text>
      </TouchableOpacity>
      </View>

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
            {comment.owner && (
              <>
              <TouchableOpacity
                onPress={handleModifyComment}>
              <Text>수정</Text>
            </TouchableOpacity>
            <TouchableOpacity
                onPress={handleRemoveComment}>
              <Text>삭제</Text>
            </TouchableOpacity>
            </>
           )}
            <Text style={styles.commentText}>{comment.memberImageUrl}{comment.content}</Text>
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
  commentArea: {
  flexDirection: "row",
  alignItems: "center",
  marginVertical: 12,
  padding: 8,
  backgroundColor: "white",
  borderRadius: 8,
  borderWidth: 1,
  borderColor: "#ddd",
},
input: {
  input: {
  flex: 1,
  paddingVertical: 8,
  paddingHorizontal: 12,
  borderWidth: 1,
  borderColor: "#ccc",
  borderRadius: 6,
  marginRight: 8,
},
},
commentButton: {
  paddingVertical: 8,
  paddingHorizontal: 12,
  backgroundColor: "#f8d57e",
  borderRadius: 6,
}, 
});
