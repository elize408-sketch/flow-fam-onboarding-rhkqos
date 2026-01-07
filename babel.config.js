
module.exports = function (api) {
  api.cache(true);

  const EDITABLE_COMPONENTS =
    process.env.EXPO_PUBLIC_ENABLE_EDIT_MODE === "TRUE" &&
    process.env.NODE_ENV === "development"
      ? [
          ["./babel-plugins/editable-elements.js", {}],
          ["./babel-plugins/inject-source-location.js", {}],
        ]
      : [];

  return {
    presets: ["babel-preset-expo"],
    plugins: [
      // Editable components (optioneel, development only)
      ...EDITABLE_COMPONENTS,

      // ✅ Expo Router (VERPLICHT voor app/ routing)
      "expo-router/babel",

      // Module resolver (aliases zoals @/contexts etc.)
      [
        "module-resolver",
        {
          root: ["./"],
          extensions: [
            ".ios.ts",
            ".android.ts",
            ".ts",
            ".ios.tsx",
            ".android.tsx",
            ".tsx",
            ".jsx",
            ".js",
            ".json",
          ],
          alias: {
            "@": "./",
            "@components": "./components",
            "@style": "./style",
            "@hooks": "./hooks",
            "@types": "./types",
            "@contexts": "./contexts",
            "@lib": "./lib",
          },
        },
      ],

      // Other babel plugins
      "@babel/plugin-proposal-export-namespace-from",

      // ⚠️ TEMPORARILY DISABLED TO TEST SILENT CRASH
      // "react-native-worklets/plugin",
    ],
  };
};
