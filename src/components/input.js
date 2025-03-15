import React from "react";
import { StyleSheet, TextInput } from "react-native";

const Input = () => {
  return(
    <TextInput style={styles.input}
       placeholder="input text..."
       placeholderTextColor={'#57B4BA'}>
    </TextInput>
  )
}

const styles=StyleSheet.create({
  input: {
    width: 80, 
    height: 60, 
    margin: 5, 
    padding: 10, 
    borderRadius: 10, 
    fontSize: 24, 
  }
})

export default Input;