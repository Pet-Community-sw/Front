import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const WeatherHeader = () => {
  return (
    <View style={styles.weatherContainer}>
      <Ionicons name="location-sharp" size={18} color="#555" />
      <Text style={styles.locationText}>서울</Text>
      <Text style={styles.weatherText}>| ☀️ 맑음 · 22°C</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  weatherContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  locationText: {
    marginLeft: 4,
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  weatherText: {
    marginLeft: 8,
    fontSize: 16,
    color: "#666",
  },
});

export default WeatherHeader;
