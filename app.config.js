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
    newArchEnabled: false,
    jsEngine: "hermes", 
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
      permissions: ["ACCESS_FINE_LOCATION"], 
      usesCleartextTraffic: true,
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    fonts: {
      "NanumGothic-Regular": "./assets/fonts/NanumGothic-Regular.ttf"
    },
    plugins: [
      "expo-font", 
      "expo-splash-screen"
    ],
    extra: {
      eas: {
        projectId: "c9ca1310-0088-4c5c-aaba-1bcb9a44a68c"
      }, 
      EXPO_PUBLIC_BASE_URL: process.env.EXPO_PUBLIC_BASE_URL,
    }
  }
};
