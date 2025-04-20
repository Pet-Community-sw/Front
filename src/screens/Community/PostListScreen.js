import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";

// 샘플 더미 게시글 하나
const samplePost = {
  postImageUrl: "https://images.unsplash.com/photo-1601758003122-58e2f95c8fdd?auto=format&fit=crop&w=400&q=80",
  profileId: 1,
  profileName: "멍냥",
  profileImageUrl: "/profile/이미지.jpg",
  title: "테스트 글입니다",
  timeAgo: "방금 전",
  viewCount: 0,
  likeCount: 0,
};

// 30개 더미 게시글 만들기
const dummyPosts = Array.from({ length: 30 }, (_, idx) => ({
  ...samplePost,
  postId: idx + 1,
  title: `테스트 글 #${idx + 1}`,
}));

const PostListScreen = ({ navigation }) => {
  const PAGE_SIZE = 10;
  const TOTAL_POSTS = dummyPosts.length;
  const TOTAL_PAGES = Math.ceil(TOTAL_POSTS / PAGE_SIZE);

  const [page, setPage] = useState(0);

  // 현재 페이지에 해당하는 게시물만 추출
  const posts = dummyPosts.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.postId.toString()}
        contentContainerStyle={{ paddingBottom: 32 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation?.navigate?.("PostDetail", { postId: item.postId })}
          >
            {item.postImageUrl ? (
              <Image source={{ uri: item.postImageUrl }} style={styles.thumbnail} />
            ) : null}

            <View style={styles.textSection}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.meta}>
                {item.profileName} · {item.timeAgo} · 조회수 {item.viewCount} · 좋아요 {item.likeCount}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />

      {/* 하단 페이지 버튼 */}
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
              style={[
                styles.pageText,
                idx === page && styles.pageTextSelected,
              ]}
            >
              {idx + 1}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
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
});
