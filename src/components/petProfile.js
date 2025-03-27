//홈 화면 펫 프로필
import React, { useContext } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons, FontAwesome, MaterialIcons, Entypo, AntDesign } from '@expo/vector-icons';
import { ProfileContext } from "../context/Profile";

const PetProfile = () => {
  const {removeProfile} = useContext(ProfileContext);
  const handlemodify = () => {

  };

  const handleadd = () => {

  };

  const handledelete = async () => {
    await removeProfile();
  }

  return(
    <View style={styles.container}>
      <Text style={styles.title}>Your Pets</Text>
      <TouchableOpacity style={styles.modify} onPress={handlemodify}>
        <Entypo name="pencil" size={24} color="black" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.delete} onPress={handledelete}>
        <AntDesign name="delete" size={24} color="red" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.add} onPress={handleadd}>
        <Entypo name="plus" size={24} color="black" />
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    alignItems: "center", 
    justifyContent: "center", 
  }, 
  title: {
    fontWeight: "bold", 
  }, 
  modify: {
    padding: 10,
  }, 
  add: {
    padding: 10, 
  }
})

export default PetProfile;