// @ts-nocheck
import 'dotenv/config';

export default {
  expo: {
    name: "pet-app",
    slug: "pet-app",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    ios: {
      supportsTablet: true
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      config: {
        googleMaps: {
          apiKey: process.env.GOOGLE_MAPS_API_KEY
        }
      },
      package: "com.anonymous.petapp",
      permissions: ["ACCESS_FINE_LOCATION"]
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    fonts: {
      "NanumGothic-Regular": "./assets/fonts/NanumGothic-Regular.ttf"
    },
    plugins: [
      "expo-font"
    ]
  }
};
