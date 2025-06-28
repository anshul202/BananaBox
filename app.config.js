// app.config.js
require('dotenv').config(); // This loads your .env file for local development

module.exports = {
  expo: {
    name: "BananaBox",
    slug: "BananaBox",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icons/logo.png",
    scheme: "bananabox",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/icons/logo.png",
        backgroundColor: "#161622"
      },
      edgeToEdgeEnabled: true,
      package: "com.anshul2021.BananaBox",
      versionCode: 1
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/icons/logo.png"
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/icons/logo.png",
          resizeMode: "contain",
          backgroundColor: "#161622"
        }
      ],
      "expo-web-browser"
    ],
    experiments: {
      typedRoutes: true
    },
    // This 'extra' block is the key to our solution
    extra: {
      // These values are loaded from your EAS Secrets during the build
      EXPO_PUBLIC_API_READ_ACCESS_KEY: process.env.EXPO_PUBLIC_API_READ_ACCESS_KEY,
      EXPO_PUBLIC_API_KEY: process.env.EXPO_PUBLIC_API_KEY,
      EXPO_PUBLIC_APPWRITE_PROJECT_ID: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID,
      EXPO_PUBLIC_APPWRITE_ENDPOINT: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT,
      EXPO_PUBLIC_MOVIE_DATABASE: process.env.EXPO_PUBLIC_MOVIE_DATABASE,
      EXPO_PUBLIC_MOVIE_DATABASE_METRIC_COLLECTION: process.env.EXPO_PUBLIC_MOVIE_DATABASE_METRIC_COLLECTION,
      EXPO_PUBLIC_SAVED_MOVIE: process.env.EXPO_PUBLIC_SAVED_MOVIE,
      // EAS Build automatically sets this variable, so we can use it to link our project
      eas: {
        projectId: process.env.EAS_PROJECT_ID ?? "cba12230-5966-4fa8-b727-21b165c65a4a" // Replace with your actual project ID as a fallback
      }
    }
  }
};


