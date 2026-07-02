module.exports = ({ config }) => {
  return {
    ...config,
    name: "Genesis Bus Company",
    slug: "bus-booking-genesis",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/tenants/genesis/icon.png",
    userInterfaceStyle: "light",
    plugins: [
      [
        "expo-splash-screen",
        {
          image: "./assets/tenants/genesis/splash.png",
          resizeMode: "contain",
          backgroundColor: "#121212",
        },
      ],
      "@react-native-community/datetimepicker",
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.genesisbus.app",
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/tenants/genesis/adaptive-icon.png",
        backgroundColor: "#121212",
      },
      package: "com.genesisbus.app",
    },
    web: {
      favicon: "./assets/favicon.png",
    },
    extra: {
      tenantId: "genesis",
      eas: {
        projectId: process.env.EAS_PROJECT_ID || undefined,
      },
    },
  };
};
