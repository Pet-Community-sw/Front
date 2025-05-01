// components/PostPreviewList.js
import React from "react";
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity } from "react-native";

const PostPreviewList = ({ navigation }) => {
  const previewPosts = [
    {
      postId: 1,
      postImageUrl: "https://picsum.photos/seed/1/100/100",
      title: "산책 다녀왔어요 🐶",
      profileName: "멍멍이",
      timeAgo: "10분 전",
    },
    {
      postId: 2,
      postImageUrl: "https://picsum.photos/seed/2/100/100",
      title: "오늘은 고양이랑 놀았어요 🐱",
      profileName: "냥냥이",
      timeAgo: "1시간 전",
    },
    {
      postId: 3,
      postImageUrl: "https://picsum.photos/seed/3/100/100",
      title: "비 오는 날 산책 꿀팁 ☔",
      profileName: "산책왕",
      timeAgo: "어제",
    },
  ];

  return (
    <View>
      <FlatList
        data={previewPosts}
        keyExtractor={(item) => item.postId.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation?.navigate?.("PostDetail", { postId: item.postId })}
          >
            <Image source={{ uri: item.postImageUrl }} style={styles.thumbnail} />
            <View style={styles.textSection}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.meta}>
                {item.profileName} · {item.timeAgo}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
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
    fontSize: 14,
    fontWeight: "bold",
  },
  meta: {
    fontSize: 12,
    color: "#888",
  },
});

export default PostPreviewList;
