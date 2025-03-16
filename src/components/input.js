import React from "react";
import { StyleSheet, TextInput } from "react-native";

const Input = ({}) => {
  return(
    <TextInput style={styles.input}
       placeholder="input text..."
       placeholderTextColor={'#57B4BA'}>
    </TextInput>
  )
}

const styles=StyleSheet.create({
  input: {
    height: 40, 
    borderBottomWidth: 1, 
    marginBottom: 10, 
    paddingHorizontal: 8, 
  }, 
})

export default Input;