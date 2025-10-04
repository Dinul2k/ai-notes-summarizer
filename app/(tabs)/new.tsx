import React, { useState } from "react";
import { View, TextInput, Button, Alert, ActivityIndicator, Text } from "react-native";
import { useRouter } from "expo-router";
import { summarizeText } from "src/features/ai/summarize.api";
import { createNote } from "src/features/notes/note.api";
// import { summarizeText } from "../src/features/ai/summarize.api";
// import { createNote } from "../src/features/notes/note.api";

export default function NewNoteScreen() {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSummarize() {
    if (!content.trim()) {
      Alert.alert("Please enter some text!");
      return;
    }
    setLoading(true);
    try {
      const result = await summarizeText(content);
      setSummary(result);
    } catch (err) {
      Alert.alert("Error", (err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!content.trim()) return;
    setSaving(true);
    try {
      await createNote(content);
      Alert.alert("✅ Note saved & summarized!");
      router.back();
    } catch (err) {
      Alert.alert("Error", (err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <TextInput
        placeholder="Paste or write your note here..."
        value={content}
        onChangeText={setContent}
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          padding: 12,
          marginBottom: 20,
          borderRadius: 8,
          minHeight: 120,
        }}
        multiline
      />

      <Button title="Generate Summary" onPress={handleSummarize} />

      {loading && <ActivityIndicator size="large" style={{ margin: 10 }} />}

      {summary ? (
        <View
          style={{
            marginTop: 20,
            backgroundColor: "#eef2ff",
            padding: 12,
            borderRadius: 8,
          }}
        >
          <Text style={{ fontWeight: "bold", marginBottom: 8 }}>Summary:</Text>
          <Text>{summary}</Text>
        </View>
      ) : null}

      <View style={{ marginTop: 20 }}>
        <Button
          title={saving ? "Saving..." : "Save Note"}
          onPress={handleSave}
          disabled={saving}
        />
      </View>
    </View>
  );
}
