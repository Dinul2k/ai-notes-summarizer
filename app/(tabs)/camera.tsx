// app/camera.tsx
import React, { useRef, useState } from "react";
import { View, Button, Alert, ActivityIndicator } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import MLKitOCR from "react-native-mlkit-ocr";
import { useRouter } from "expo-router";
import { createNote } from "src/features/notes/note.api";

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [loading, setLoading] = useState(false);
  const cameraRef = useRef<any>(null);
  const router = useRouter();

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Button title="Grant Camera Permission" onPress={requestPermission} />
      </View>
    );
  }

  async function handleCapture() {
    if (!cameraRef.current) return;
    setLoading(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({ base64: false });
      const manipulated = await manipulateAsync(photo.uri, [], {
        compress: 1,
        format: SaveFormat.JPEG,
      });

      const result = await MLKitOCR.detectFromFile(manipulated.uri);
      const text = result.map((block: any) => block.text).join(" ");

      if (!text.trim()) {
        Alert.alert("No text detected!");
        return;
      }

      await createNote(text);
      Alert.alert("✅ Scanned text saved & summarized!");
      router.back();
    } catch (err) {
      console.error(err);
      Alert.alert("Error", (err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={{ flex: 1 }}>
      <CameraView ref={cameraRef} style={{ flex: 1 }} />
      {loading ? (
        <ActivityIndicator size="large" style={{ margin: 20 }} />
      ) : (
        <Button title="Capture & Save" onPress={handleCapture} />
      )}
    </View>
  );
}
