import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

export default function MapsScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Maps</Text>
      <View style={styles.buttonRow}>
        <Button
          title="산책길 추천, 매칭"
        />
        <Button
          title="대리 산책자"
          onPress={() => navigation.navigate('mapDelegate')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 60,
    paddingHorizontal: 20,
    flex: 1,
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
