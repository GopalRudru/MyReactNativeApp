import React, { useEffect, useState, useMemo } from "react";
import { View, Platform, StyleSheet, Image } from "react-native";
import { WebView } from "react-native-webview";
import colors from "../../res/colors";
import { encodeToBase64 } from "../../utils/helpers";
import { createModuleLogger } from "../../utils/logger";

const GifView = ({ source, style }: { source: any; style?: any }) => {
  const [imgSrc, setImgSrc] = useState("");
  const width = style?.width || 100;
  const height = style?.height || 100;
  
  const logger = createModuleLogger("GifView");
useEffect(() => {
    const loadGif = async () => {
      try {
        if (Platform.OS === "ios") {
          const gifUri = Image.resolveAssetSource(source).uri;
          const base64 = await encodeToBase64(gifUri);
          setImgSrc(`data:image/gif;base64,${base64}`);
        } else {
          // source is already a file URI string
          setImgSrc(source);
        }
      } catch (error) {
        logger.error("Error loading gif:", error);
      }
    };

    loadGif();

    return () => {
      //logger.log("GIF unmounted ✅");
    };
  }, [source]);
  
  const html = `
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            margin: 0;
            padding: 0;
            background-color: white;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
          }
          img {
            width: ${width}px;
            height: ${height}px;
          }
        </style>
      </head>
      <body>
        <img src="${imgSrc}" />
      </body>
    </html>
  `;

  return (
    <View style={styles.container}>
        <WebView
          originWhitelist={["*"]}
          source={{ html }}
          style={[{ width, height, backgroundColor: "white" }]}
          useWebKit
          scrollEnabled={false}
          javaScriptEnabled={true}
          domStorageEnabled={true}
        />
      {/* )} */}
    </View>
  );
};

export default GifView;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.white,
  },
});
