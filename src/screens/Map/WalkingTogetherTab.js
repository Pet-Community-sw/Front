import React, { useState, useCallback } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Modal,
    Alert,
} from "react-native";
import { MaterialIcons, Feather } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import {
    useViewWalkingTogether,
    useViewWalkingTogetherPostDetail,
} from "../../hooks/useWalkingTogether";

export const WalkingTogetherTab = ({ recommendRoutePostId }) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedPostId, setSelectedPostId] = useState(null);

    const {
        data: walks = [],
        refetch,
        isLoading,
    } = useViewWalkingTogether({ recommendRoutePostId });

    const {
        data: selectedPost,
        refetch: refetchDetail,
        isFetching: isDetailLoading,
    } = useViewWalkingTogetherPostDetail({
        walkingTogetherPostId: selectedPostId,
    });

    useFocusEffect(
        useCallback(() => {
            refetch();
        }, [])
    );

    const openModal = (postId) => {
        setSelectedPostId(postId);
        setModalVisible(true);
        refetchDetail();
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>🐾 함께 산책해요</Text>

            <FlatList
                data={walks}
                keyExtractor={(item) => item.walkingTogetherPostId?.toString()}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.card}
                        onPress={() => openModal(item.walkingTogetherPostId)}
                    >
                        <Text style={styles.walkTitle}>{item.title || "제목 없음"}</Text>
                        <Text style={styles.walkMeta}>
                            {item.scheduledTime || "시간 미정"} · {item.writerName || "작성자"}
                        </Text>
                        <View style={styles.matchButton}>
                            <MaterialIcons name="check-circle" size={18} color="#7EC8C2" />
                            <Text style={styles.matchText}>매칭 신청</Text>
                        </View>
                    </TouchableOpacity>
                )}
                ListEmptyComponent={
                    !isLoading && <Text style={styles.empty}>등록된 글이 없어요!</Text>
                }
            />

            {/* 상세 모달 */}
            <Modal visible={modalVisible} animationType="slide" transparent>
                <View style={styles.modalWrapper}>
                    <View style={styles.modalContent}>
                        {isDetailLoading ? (
                            <Text>불러오는 중...</Text>
                        ) : (
                            <>
                                <Text style={styles.modalTitle}>
                                    🐶 {selectedPost?.petName}와 산책해요
                                </Text>
                                <Text style={styles.meta}>일시: {selectedPost?.scheduledTime}</Text>
                                <Text style={styles.meta}>인원: {selectedPost?.currentCount} / {selectedPost?.limitCount}</Text>
                                <Text style={styles.meta}>등록일: {selectedPost?.createdAt}</Text>

                                {selectedPost?.filtering ? (
                                    <Text style={[styles.meta, { color: "red" }]}>
                                        ⚠️ 함께 산책이 제한된 대상입니다
                                    </Text>
                                ) : selectedPost?.isOwner ? (
                                    <View style={styles.buttonRow}>
                                        <TouchableOpacity onPress={handleEdit}>
                                            <Text style={styles.editButton}>수정</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={handleDelete}>
                                            <Text style={styles.deleteButton}>삭제</Text>
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    <TouchableOpacity style={styles.applyBtn}>
                                        <Text style={styles.applyText}>매칭 시작</Text>
                                    </TouchableOpacity>
                                )}


                                <TouchableOpacity
                                    style={styles.closeBtn}
                                    onPress={() => setModalVisible(false)}
                                >
                                    <Text style={styles.closeText}>닫기</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: "#FFF" },
    title: {
        fontSize: 22,
        fontWeight: "600",
        marginBottom: 12,
        fontFamily: "cute",
        color: "#333",
    },
    card: {
        backgroundColor: "#F6FDFC",
        padding: 14,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#D2EAE4",
    },
    walkTitle: {
        fontSize: 15,
        fontWeight: "600",
        marginBottom: 4,
        color: "#2C3E50",
    },
    walkMeta: {
        fontSize: 13,
        color: "#6B7B8C",
        marginBottom: 8,
    },
    matchButton: {
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "flex-start",
        backgroundColor: "#E8F7F1",
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
    },
    matchText: {
        marginLeft: 6,
        color: "#4CA195",
        fontWeight: "500",
        fontSize: 13,
    },
    empty: {
        textAlign: "center",
        color: "#aaa",
        fontSize: 14,
        marginTop: 40,
    },
    modalWrapper: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        padding: 20,
    },
    modalContent: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "700",
        marginBottom: 12,
    },
    meta: {
        fontSize: 14,
        marginBottom: 6,
        color: "#333",
    },
    applyBtn: {
        marginTop: 10,
        backgroundColor: "#7EC8C2",
        padding: 12,
        borderRadius: 8,
        alignItems: "center",
    },
    applyText: {
        color: "#fff",
        fontWeight: "600",
    },
    closeBtn: {
        marginTop: 12,
        alignItems: "center",
    },
    closeText: {
        color: "#7E7E7E",
        fontSize: 13,
    },
});
