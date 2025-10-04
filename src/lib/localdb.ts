import AsyncStorage from '@react-native-async-storage/async-storage';

export async function saveNote(note) {
  const notes = JSON.parse(await AsyncStorage.getItem("notes") || "[]");
  notes.push(note);
  await AsyncStorage.setItem("notes", JSON.stringify(notes));
}
export async function getNotes() {
  return JSON.parse(await AsyncStorage.getItem("notes") || "[]");
}
