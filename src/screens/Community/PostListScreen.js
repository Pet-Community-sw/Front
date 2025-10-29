import React, { useState, useCallback, useMemo, useRef } from "react";
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
  Keyboard, 
  KeyboardAvoidingView, 
  TouchableWithoutFeedback
} from "react-native";
import { useAddPost, useViewPosts } from "../../hooks/usePost";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient"; // ✅ 그라데이션용
import { BASE_URL } from "../../api/apiClient";

const PostListScreen = ({ navigation }) => {
  const { data: posts = [], refetch } = useViewPosts();
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [query, setQuery] = useState("");
  const [sortMode, setSortMode] = useState("latest"); // latest | popular
  const [showScrollTop, setShowScrollTop] = useState(false);
  const listRef = useRef(null);

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [])
  );

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
        setFormData({ title: "", content: "", postImageFile: "" });
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

  const getImageUri = (relativePath) => {
    if (!relativePath) return null;
    return `${BASE_URL.replace(/\/$/, "")}/${relativePath.replace(/^\/+/, "")}`;
  };

  const filteredPosts = useMemo(() => {
    const base = Array.isArray(posts) ? posts : [];
    const byQuery = query.trim()
      ? base.filter((p) =>
          (p.title || "").toLowerCase().includes(query.trim().toLowerCase())
        )
      : base;
    const sorted = [...byQuery].sort((a, b) => {
      if (sortMode === "popular") {
        return (b.likeCount || 0) - (a.likeCount || 0);
      }
      return 0;
    });
    return sorted;
  }, [posts, query, sortMode]);

  return (
    <View style={styles.container}>
      {/* 상단 검색/정렬 바 */}
      <View style={styles.topBar}>
        <View style={styles.searchBox}>
          <Feather
            name="search"
            size={18}
            color="#9CA3AF"
            style={{ marginRight: 8 }}
          />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="제목 검색"
            placeholderTextColor="#9CA3AF"
            style={styles.searchInput}
          />
        </View>

        <View style={{ flexDirection: "row", gap: 6 }}>
          <TouchableOpacity
            onPress={() => setSortMode("latest")}
            style={[
              styles.sortChip,
              sortMode === "latest" && styles.sortChipActive,
            ]}
          >
            <Text
              style={[
                styles.sortChipText,
                sortMode === "latest" && styles.sortChipTextActive,
              ]}
            >
              최신순
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setSortMode("popular")}
            style={[
              styles.sortChip,
              sortMode === "popular" && styles.sortChipActive,
            ]}
          >
            <Text
              style={[
                styles.sortChipText,
                sortMode === "popular" && styles.sortChipTextActive,
              ]}
            >
              인기순
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.writeBtn}
          onPress={() => setAddModalVisible(true)}
        >
          <MaterialCommunityIcons name="pencil-plus" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* 게시글 리스트 */}
      <FlatList
        ref={listRef}
        data={filteredPosts}
        keyExtractor={(item) => item.postId.toString()}
        contentContainerStyle={{ paddingBottom: 120 }}
        onScroll={(e) => {
          const y = e.nativeEvent.contentOffset.y;
          setShowScrollTop(y > 300);
        }}
        scrollEventThrottle={16}
        renderItem={({ item }) => {
          const imageUri = getImageUri(item.postImageUrl);
          const profileUri = getImageUri(item.memberImageUrl);

          return (
            <TouchableOpacity
              style={styles.rowItem}
              activeOpacity={0.9}
              onPress={() =>
                navigation.navigate("PostDetail", { postId: item.postId })
              }
            >
              {/* 프로필 */}
              {profileUri ? (
                <Image source={{ uri: profileUri }} style={styles.rowAvatar} />
              ) : (
                <View style={[styles.rowAvatar, styles.cardAvatarFallback]} />
              )}

              {/* 본문 */}
              <View style={styles.rowCenter}>
                <Text style={styles.rowTitle} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={styles.rowMeta} numberOfLines={1}>
                  {item.memberName} · {item.createdAt}
                </Text>

                <View style={styles.rowStats}>
                  <View style={styles.statChipGray}>
                    <Feather name="eye" size={11} color="#6B7280" />
                    <Text style={styles.statText}> {item.viewCount ?? 0}</Text>
                  </View>
                  <View style={styles.statChipPink}>
                    <Feather name="heart" size={11} color="#FF6B6B" />
                    <Text style={[styles.statText, styles.badgePinkText]}>
                      {" "}
                      {item.likeCount ?? 0}
                    </Text>
                  </View>
                </View>
              </View>

              {/* 썸네일 */}
              {imageUri && (
                <Image source={{ uri: imageUri }} style={styles.rowThumb} />
              )}
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Feather name="message-circle" size={40} color="#9CA3AF" />
            <Text style={styles.emptyText}>아직 게시글이 없어요 🥲</Text>
            <Text style={styles.emptySubText}>첫 글을 작성해보세요!</Text>
          </View>
        }
      />

      {/* 글쓰기 모달 */}
      <Modal visible={addModalVisible} transparent animationType="slide">
        <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>✍️ 새 게시글</Text>

                <TouchableOpacity onPress={pickImage}>
                  <View style={styles.imageUploadBox}>
                    <Feather
                      name="image"
                      size={20}
                      color="#7EC8C2"
                      style={{ marginRight: 8 }}
                    />
                    <Text style={styles.imageUploadText}>
                      이미지 첨부 (선택)
                    </Text>
                  </View>
                </TouchableOpacity>

                {formData.postImageFile ? (
                  <View style={{ alignItems: "center", marginBottom: 12 }}>
                    <Text style={{ color: "#666", marginBottom: 6 }}>
                      선택된 파일: {formData.postImageFile.name}
                    </Text>
                    <Image
                      source={{ uri: formData.postImageFile.uri }}
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
                  placeholder="제목을 입력해주세요"
                  value={formData.title}
                  onChangeText={(text) =>
                    setFormData({ ...formData, title: text })
                  }
                  style={styles.input}
                />
                <TextInput
                  placeholder="내용을 입력해주세요"
                  value={formData.content}
                  onChangeText={(text) =>
                    setFormData({ ...formData, content: text })
                  }
                  style={[styles.input, { height: 100 }]}
                  multiline
                  textAlignVertical="top"
                />
                <View style={styles.modalActions}>
                  <TouchableOpacity
                    onPress={() => {
                      resetData();
                      setAddModalVisible(false);
                    }}
                    style={styles.cancelButton}
                  >
                    <Text style={styles.cancelText}>취소</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleAddPost}
                    style={styles.submitButton}
                  >
                    <Text style={styles.submitText}>등록</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>

      {/* 위로가기 버튼 */}
      {showScrollTop && (
        <TouchableOpacity
          onPress={() =>
            listRef.current?.scrollToOffset({ offset: 0, animated: true })
          }
          style={styles.scrollTopWrapper}
        >
          <LinearGradient
            colors={["#7EC8C2", "#F47C7C"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.scrollTopButton}
          >
            <Feather name="chevron-up" size={26} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default PostListScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#111827",
  },
  sortChip: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
  },
  sortChipActive: {
    backgroundColor: "#FFF5F5",
    borderWidth: 1,
    borderColor: "#FFE3E3",
  },
  sortChipText: {
    color: "#374151",
    fontWeight: "600",
    fontSize: 12,
  },
  sortChipTextActive: {
    color: "#FF6B6B",
  },
  writeBtn: {
    backgroundColor: "#7EC8C2",
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  rowItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F1F1F1",
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 3,
  },
  rowAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F3F4F6",
    marginRight: 10,
  },
  rowCenter: {
    flex: 1,
    gap: 4,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
  },
  rowMeta: {
    fontSize: 12,
    color: "#6B7280",
  },
  rowStats: {
    flexDirection: "row",
    gap: 8,
    marginTop: 2,
  },
  statChipGray: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F6F7FB",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  statChipPink: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF5F5",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: "#FFE3E3",
  },
  statText: {
    fontSize: 11,
    color: "#6B7280",
    fontWeight: "600",
  },
  badgePinkText: {
    color: "#FF6B6B",
  },
  rowThumb: {
    width: 58,
    height: 58,
    borderRadius: 8,
    marginLeft: 8,
    backgroundColor: "#F3F3F3",
  },
  scrollTopWrapper: {
    position: "absolute",
    right: 16,
    bottom: 28,
    zIndex: 100,
  },
  scrollTopButton: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 8,
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 100,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: "#4B5563",
    fontWeight: "600",
  },
  emptySubText: {
    fontSize: 13,
    color: "#9CA3AF",
    marginTop: 4,
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
