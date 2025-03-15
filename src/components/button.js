import React from "react";
import { StyleSheet, TouchableOpacity, Text } from "react-native";

const Button = ({ title, onPress, disabled }) => {
  return (
    <TouchableOpacity 
      style={[styles.button, disabled && styles.disabledButton]} 
      onPress={onPress} 
      disabled={disabled}
    >
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 350,
    height: 50, 
    backgroundColor: 'black', 
    alignItems: 'center',
    justifyContent: 'center', 
    padding: 10,
    borderRadius: 10, 
    marginTop: 10, 
  },
  disabledButton: {
    backgroundColor: "gray",
  },
  buttonText: {
    color: "white",
    fontSize: 15,
  }
});

export default Button;
