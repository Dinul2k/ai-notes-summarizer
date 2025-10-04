import React, { useEffect, useState } from "react";
import {
  View,
  FlatList,
  ActivityIndicator,
  Text,
  Pressable,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { onSnapshot, query, collection, where, orderBy } from "firebase/firestore";
import { auth, db } from "src/lib/firebase";
import { Note } from "src/features/notes/note.model";
import SummaryCard from "components/SummaryCard";
// import { db, auth } from "../src/lib/firebase";
// import SummaryCard from "../src/components/SummaryCard";
// import type { Note } from "../src/features/notes/note.model";

export default function HomeScreen() {
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, "notes"),
      where("userId", "==", auth.currentUser.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Note));
      setNotes(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {/* ✅ Always visible button */}
      <Pressable
        onPress={() => router.push("/new")}
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#4f46e5",
          padding: 14,
          margin: 12,
          borderRadius: 10,
        }}
      >
        <Ionicons name="add-circle-outline" size={20} color="#fff" />
        <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600", marginLeft: 8 }}>
          Write a new note
        </Text>
      </Pressable>

      {/* Loading state */}
      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" />
        </View>
      ) : notes.length === 0 ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text style={{ fontSize: 16, color: "#666" }}>No notes yet. Create one!</Text>
        </View>
      ) : (
        <FlatList
          data={notes}
          keyExtractor={(item) => item.id || Math.random().toString()}
          renderItem={({ item }) => (
            <SummaryCard title={item.content} summary={item.summary || ""} />
          )}
        />
      )}
    </SafeAreaView>
  );
}
