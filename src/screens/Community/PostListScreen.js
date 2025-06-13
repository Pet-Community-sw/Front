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
  Alert,
} from "react-native";
import { useAddPost, useViewPosts } from "../../hooks/usePost";
import { AntDesign, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";

import { BASE_URL } from "../../api/apiClient";

const PostListScreen = ({ navigation }) => {
  const { data: posts = [], refetch } = useViewPosts();
  const [page, setPage] = useState(0);
  const [addModalVisible, setAddModalVisible] = useState(false);

  const PAGE_SIZE = 10;
  const TOTAL_PAGES = Math.ceil(posts.length / PAGE_SIZE);

  useFocusEffect(
    useCallback(() => {
      setPage(0);
      refetch();
    }, [])
  );

  useEffect(() => {
    refetch();
  }, [page]);

  const { mutate: addMutate } = useAddPost();

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
        const errorMessage =
          err?.response?.data?.message || "알 수 없는 오류가 발생했습니다.";
        Alert.alert("게시글 추가 실패", errorMessage);
      },
    });
  };

  const resetData = () => {
    setFormData({ postImageFile: "", profileId: "", title: "", content: "" });
  };

  const handleImagePick = async (callback) => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
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

  const pickImage = () => {
    handleImagePick((uri) => {
      setFormData((prevData) => ({
        ...prevData,
        postImageFile: {
          uri,
          name: uri.split("/").pop(),
          type: "image/jpeg",
        },
      }));
    });
  };

  const getImageUri = (relativePath) =>
    relativePath
      ? `${BASE_URL.replace(/\/$/, "")}/${relativePath.replace(/^\/+/, "")}`
      : undefined;


  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>💬 자유롭게 올리고 싶은 걸 올려보세요!</Text>
        <TouchableOpacity
          style={{ padding: 10, borderRadius: 100 }}
          onPress={() => setAddModalVisible(true)}
        >
          <MaterialCommunityIcons name="pencil-plus" size={30} color="#2A4759" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={posts}
        keyExtractor={(item) => item.postId.toString()}
        contentContainerStyle={{ paddingBottom: 32 }}
        renderItem={({ item }) => {

          const imageUri = getImageUri(item.postImageUrl);
          const profileUri = getImageUri(item.memberImageUrl);

          console.log("item.postImageUrl:", item.postImageUrl);

          return (
            <TouchableOpacity
              style={[
                item.postImageUrl
                  ? [styles.cardBase, styles.cardWithImage]
                  : [styles.cardBase, { flexDirection: "column", alignItems: "flex-start" }],
              ]}
              onPress={() => navigation?.navigate("PostDetail", { postId: item.postId })}
            >
              {item.postImageUrl && (
                <Image
                  source={{ uri: getImageUri(item.postImageUrl) }}
                  style={styles.thumbnail}
                />
              )}

              <View style={styles.textSection}>
                <Text style={styles.title}>{item.title}</Text>
                <View style={styles.metaRow}>
                  {profileUri && (
                    <Image
                      source={{ uri: profileUri }}
                      style={styles.profileImage}
                    />
                  )}
                  <Text style={styles.meta}>
                    {item.memberName} · {item.createdAt} · 조회수 {item.viewCount} · 좋아요 {item.likeCount}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>

          );
        }}

      />
      <View style={styles.pagination}>
        {Array.from({ length: TOTAL_PAGES }, (_, idx) => (
          <TouchableOpacity
            key={idx}
            style={[styles.pageButton, idx === page && styles.pageButtonSelected]}
            onPress={() => setPage(idx)}
          >
            <Text style={[styles.pageText, idx === page && styles.pageTextSelected]}>{idx + 1}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Modal visible={addModalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>✍️ 새 게시글</Text>

            <TouchableOpacity onPress={pickImage}>
              <View style={styles.imageUploadBox}>
                <Feather name="image" size={20} color="#7EC8C2" style={{ marginRight: 8 }} />
                <Text style={styles.imageUploadText}>이미지 첨부 (선택)</Text>
              </View>
            </TouchableOpacity>

            {formData.postImageFile ? (
              <View style={{ alignItems: "center", marginBottom: 12 }}>
                <Text style={{ color: "#666", marginBottom: 6 }}>
                  선택된 파일: {formData.postImageFile.name}
                </Text>
                <Image
                  source={{ uri: formData.postImageFile.uri }}
                  style={{ width: 120, height: 120, borderRadius: 8, borderWidth: 1, borderColor: "#ccc" }}
                />
              </View>
            ) : null}

            <TextInput
              placeholder="제목을 입력해주세요"
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
              style={styles.input}
            />
            <TextInput
              placeholder="내용을 입력해주세요"
              value={formData.content}
              onChangeText={(text) => setFormData({ ...formData, content: text })}
              style={[styles.input, { height: 100 }]}
              multiline
              textAlignVertical="top"
            />
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => {
                resetData();
                setAddModalVisible(false);
              }} style={styles.cancelButton}>
                <Text style={styles.cancelText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleAddPost} style={styles.submitButton}>
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
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4A7B9D",
    flex: 1,
  },
  cardBase: {
    width: "100%",
    padding: 14,
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: "#FAFAFA",
  },
  card: {
    backgroundColor: "#FAFAFA",
    borderRadius: 12,
    marginBottom: 12,
    padding: 14,
    flexDirection: "row",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 2,
  },
  cardWithImage: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardWithoutImage: {
    flexDirection: "column",
    alignItems: "flex-start",
  },
  profileImage: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 6,
  },

  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  textSection: {
    flex: 1,
    paddingRight: 0,
    paddingLeft: 0,
    width: "100%",
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
    color: "#2C3E50",
    marginBottom: 6,
    textAlign: "left",
  },
  meta: {
    fontSize: 12,
    color: "#6B7B8C",
    textAlign: "left",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
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
    width: "90%",
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#4A7B9D",
    textAlign: "center",
  },
  imageUploadBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E7F6F2",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  imageUploadText: {
    fontSize: 14,
    color: "#4A4A4A",
  },
  input: {
    backgroundColor: "#FDFDFD",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 14,
    fontSize: 14,
    color: "#333",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: "#F2F2F2",
  },
  submitButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: "#F47C7C",
  },
  cancelText: {
    color: "#888",
    fontWeight: "500",
  },
  submitText: {
    color: "#fff",
    fontWeight: "bold",
  },
});