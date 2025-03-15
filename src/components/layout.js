import React from "react";
import { StyleSheet, View, Text } from "react-native";

const Header = () => {
  return(
    <View style={[styles.container, styles.header]}>
      <Text style={styles.text}>Header</Text>
    </View>
  );
};


const Contents = ({children}) => {
  return(
    <View style={[styles.container, styles.contents]}>
      {children}
    </View>
  )
}


const Footer = () => {
  return(
    <View style={[styles.container, styles.footer]}>
      <Text style={styles.text}>Footer</Text>
    </View>
  )
}


export { Header, Contents, Footer };

const styles= StyleSheet.create({
  container: {
    width: '100%', 
    alignItems: 'center', 
    justifyContent: 'center', 
    height: 80, 
  }, 
  header: {
    flex: 1, 
    backgroundColor: '#f1c40f', 
  }, 
  contents: {
    flex: 3, 
    backgroundColor: '#1abc9c', 
    alignItems: 'center', 
    justifyContent: 'center', 
    width: '100%', 
  }, 
  footer: {
    flex: 1, 
    backgroundColor: '#3498db'
  }, 
  text: {
    fontSize: 26, 
  }, 
});