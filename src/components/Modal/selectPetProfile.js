// 펫 프로필 선택 모달 
export default selectPetProfile = () => {
  return(
    <Modal
        visible={selectProfileModalVisible}
        animationType="slide"
        transparent
      >
        <View style={styles.modalWrapper}>
          <View style={styles.modalContent}>
            <ScrollView style={{ maxHeight: 300 }}>
              <Text style={styles.modalTitle}>
                🐶 함께 산책할 펫을 선택하세요
              </Text>
              {profiles.map((profile) => (
                <TouchableOpacity
                  key={profile.profileId}
                  style={[
                    styles.card,
                    selectedPetProfileId === profile.profileId && {
                      borderColor: "#7EC8C2",
                      borderWidth: 2,
                    },
                  ]}
                  onPress={() => setSelectedPetProfileId(profile.profileId)}
                >
                  <Image
                    source={{ uri: `${BASE_URL}${profile.petImageUrl}` }}
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: 25,
                      marginBottom: 8,
                    }}
                  />
                  <Text
                    style={{ fontFamily: "cute", fontSize: 20, marginLeft: 5 }}
                  >
                    {profile.petName}
                  </Text>
                </TouchableOpacity>
              ))}

              <TouchableOpacity
                style={styles.applyBtn}
                disabled={!selectedPetProfileId}
                onPress={handleSelectProfile}
              >
                <Text style={styles.applyText}>선택하기</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.applyBtn}
                onPress={() => setSelectProfileModalVisible(false)}
              >
                <Text style={styles.applyText}>닫기</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
  )
}


      