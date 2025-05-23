import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
} from "react-native";
import { useAddPost, useViewPosts } from "../../hooks/usePost";
import { AntDesign } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker"

const PostListScreen = ({ navigation }) => {
  const { data: posts = [], refetch } = useViewPosts();
  const [page, setPage] = useState(0);
  const [addModalVisible, setAddModalVisible] = useState(false);

  const PAGE_SIZE = 10;
  const TOTAL_PAGES = Math.ceil(posts.length / PAGE_SIZE);

  //이 컴포넌트가 화면에 다시 나타날 때마다 게시글 목록 새로 가져옴
  useFocusEffect(
    useCallback(() => {
      setPage(0);
      refetch();
    }, [])
  );

  //사용자가 페이지 버튼 눌렀을 때 해당하는 글 목록 보여주기
  useEffect(() => {
    refetch();
  }, [page]);

  const { mutate: addMutate } = useAddPost();

  //게시글 추가 데이터
  const [formData, setFormData] = useState({
    postImageFile: "",
    profileId: "",
    title: "",
    content: "",
  });

  const handleAddPost = () => {
    addMutate(formData, {
      onSuccess: (data) => {
        Alert.alert(`게시글 추가 성공! Id: ${data.postId}`);
        setAddModalVisible(false);
        navigation.navigate("PostDetail", { postId: data.postId });
      },
      onError: (err) => {
        Alert.alert("게시글 추가 실패: ", +err.message);
      },
    });
  };

  //추가 중 닫기 버튼 눌렀을 때, 입력값 초기화
  const resetData = () => {
    setFormData({ postImageFile: "", profileId: "", title: "", content: "" });
  };

  // 공통 이미지 선택 함수
  const handleImagePick = async (callback) => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.status !== "granted") {
      alert("이미지 접근 권한이 필요합니다.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      callback(result.assets[0].uri);
    } else {
      console.log("사용자가 선택을 취소함");
    }
  };

  // 게시글 이미지 업로드
  const pickImage = () => {
    handleImagePick((imageUri) => {
      setFormData((prevData) => ({
        ...prevData,
        postImageFile: imageUri,
      }));
    });
  };

  return (
    <View style={styles.container}>
      {/* 게시글 목록 */}
      <FlatList
        data={posts}
        keyExtractor={(item) => item.postId.toString()}
        contentContainerStyle={{ paddingBottom: 32 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              navigation?.navigate?.("PostDetail", { postId: item.postId })
            }
          >
            {item.postImageUrl && (
              <Image
                source={{ uri: item.postImageUrl }}
                style={styles.thumbnail}
              />
            )}
            <View style={styles.textSection}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.meta}>
                {item.memberImageUrl} · {item.memberName} · {item.timeAgo} ·
                조회수 {item.viewCount} · 좋아요 {item.likeCount}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />

      {/* 페이지네이션 버튼 생성 */}
      <View style={styles.pagination}>
        {Array.from({ length: TOTAL_PAGES }, (_, idx) => (
          <TouchableOpacity
            key={idx}
            style={[
              styles.pageButton,
              idx === page && styles.pageButtonSelected,
            ]}
            onPress={() => setPage(idx)}
          >
            <Text
              style={[styles.pageText, idx === page && styles.pageTextSelected]}
            >
              {idx + 1}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/*게시글 추가 모달*/}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setAddModalVisible(true)}
      >
        <AntDesign name="pluscircle" size={56} color="#E78F81" />
      </TouchableOpacity>

      <Modal visible={addModalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>게시글 작성</Text>

            <TouchableOpacity
              onPress={pickImage}
              style={[styles.input, { backgroundColor: "#9ACBD0" }]}
            >
              <Text
                style={{ color: "white", fontSize: 20, textAlign: "center" }}
              >
                이미지 등록
              </Text>
            </TouchableOpacity>

            {/* 추가한 이미지 미리보기 */}
            {formData.postImageFile ? (
              <View style={{ alignItems: "center", marginBottom: 12 }}>
                <Text style={{ color: "#666", marginBottom: 6 }}>
                  선택된 파일: {formData.postImageFile.split("/").pop()}
                </Text>
                <Image
                  source={{ uri: formData.postImageFile }}
                  style={{
                    width: 120,
                    height: 120,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: "#ccc",
                  }}
                />
              </View>
            ) : null}

            <TextInput
              placeholder="제목"
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
              style={styles.input}
            />
            <TextInput
              placeholder="내용"
              value={formData.content}
              onChangeText={(text) =>
                setFormData({ ...formData, content: text })
              }
              style={[styles.input, { height: 100 }]}
              multiline
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={() => {
                  resetData();
                  setAddModalVisible(false);
                }}
              >
                <Text style={styles.cancelText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleAddPost}>
                <Text style={styles.submitText}>등록</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default PostListScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FDFAF6",
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 12,
    padding: 12,
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    elevation: 2,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: "#ddd",
  },
  textSection: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 6,
  },
  meta: {
    fontSize: 12,
    color: "#666",
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
    flexWrap: "wrap",
  },
  pageButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginHorizontal: 4,
    marginVertical: 4,
    backgroundColor: "#ddd",
    borderRadius: 6,
  },
  pageButtonSelected: {
    backgroundColor: "#E78F81",
    marginBottom: 40,
  },
  pageText: {
    color: "#333",
    fontWeight: "500",
  },
  pageTextSelected: {
    color: "#fff",
    fontWeight: "700",
  },
  addButton: {
    position: "absolute",
    bottom: 15,
    right: 15,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    width: "85%",
    padding: 20,
    borderRadius: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  cancelText: {
    color: "#999",
  },
  submitText: {
    color: "#E78F81",
    fontWeight: "bold",
  },
});
