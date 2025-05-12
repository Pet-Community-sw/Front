import React, { useEffect, useState } from "react";
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
import { AntDesign } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

// 더미 게시글 데이터
const samplePost = {
  postImageUrl:
    "https://images.unsplash.com/photo-1601758003122-58e2f95c8fdd?auto=format&fit=crop&w=400&q=80",
  profileName: "멍냥",
  title: "테스트 글입니다",
  timeAgo: "방금 전",
  viewCount: 0,
  likeCount: 0,
};

const dummyPosts = Array.from({ length: 30 }, (_, idx) => ({
  ...samplePost,
  postId: idx + 1,
  title: `테스트 글 #${idx + 1}`,
}));

const PostMock = () => {
  const navigation = useNavigation();
  const [page, setPage] = useState(0);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const PAGE_SIZE = 10;
  const TOTAL_PAGES = Math.ceil(dummyPosts.length / PAGE_SIZE);

  const [formData, setFormData] = useState({
    postImageFile: "",
    profileId: "",
    title: "",
    content: "",
  });

  const paginatedPosts = dummyPosts.slice(
    page * PAGE_SIZE,
    (page + 1) * PAGE_SIZE
  );

  const handleAddPost = () => {
    Alert.alert("게시글이 등록된 것처럼 보입니다!");
    setAddModalVisible(false);
    setFormData({ postImageFile: "", profileId: "", title: "", content: "" });
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={paginatedPosts}
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
              <Image source={{ uri: item.postImageUrl }} style={styles.thumbnail} />
            )}
            <View style={styles.textSection}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.meta}>
                {item.profileName} · {item.timeAgo} · 조회수 {item.viewCount} · 좋아요 {item.likeCount}
              </Text>
            </View>
          </TouchableOpacity>
        )}
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

      <TouchableOpacity style={styles.addButton} onPress={() => setAddModalVisible(true)}>
        <AntDesign name="pluscircle" size={56} color="#E78F81" />
      </TouchableOpacity>

      <Modal visible={addModalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>게시글 작성</Text>
            <TextInput
              placeholder="제목"
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
              style={styles.input}
            />
            <TextInput
              placeholder="내용"
              value={formData.content}
              onChangeText={(text) => setFormData({ ...formData, content: text })}
              style={[styles.input, { height: 100 }]}
              multiline
            />
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setAddModalVisible(false)}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FDFAF6",
    paddingHorizontal: 16,
    paddingTop: 12
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 12,
    padding: 12,
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    elevation: 2
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: "#ddd"
  },
  textSection: {
    flex: 1
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 6
  },
  meta: {
    fontSize: 12,
    color: "#666"
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
    flexWrap: "wrap"
  },
  pageButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginHorizontal: 4,
    marginVertical: 4,
    backgroundColor: "#ddd",
    borderRadius: 6
  },
  pageButtonSelected: {
    backgroundColor: "#E78F81",
    marginBottom: 40
  },
  pageText: {
    color: "#333",
    fontWeight: "500"
  },
  pageTextSelected: {
    color: "#fff",
    fontWeight: "700"
  },
  addButton: {
    position: "absolute",
    bottom: 15,
    right: 15
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center"
  },
  modalContent: {
    backgroundColor: "white",
    width: "85%",
    padding: 20,
    borderRadius: 12
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12
  },
  cancelText: {
    color: "#999"
  },
  submitText: {
    color: "#E78F81",
    fontWeight: "bold"
  }
});


export default PostMock;
