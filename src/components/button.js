import React from "react";
import { StyleSheet, TouchableOpacity, Text } from "react-native";

const Button = props => {
  return (
    <TouchableOpacity style={styles.button}>
      <Text style={{color: 'white', fontSize: 20, justifyContent: 'center', 
        alignContent: 'center', 
      }}>{props.title}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    width: 150,
    height: 50, 
    backgroundColor: 'black', 
    alignItems: 'center',
    justifyContent: 'center', 
    padding: 10,
    borderRadius: 10, 
  }
})

export default Button;