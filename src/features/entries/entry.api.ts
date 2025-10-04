import { db, auth } from "../../lib/firebase";
import {
  addDoc, collection, deleteDoc, doc, DocumentSnapshot,
  getDocs, limit, orderBy, query, serverTimestamp, setDoc, startAfter, Timestamp,
} from "firebase/firestore";
import { analyzeSentiment } from "../ai/sentiment.api";

export type Sentiment = { label: "pos" | "neu" | "neg"; score: number; modelVer?: string };

export type Entry = {
  id?: string;
  text: string;
  mood?: number;
  tags?: string[];
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  clientUpdatedAt?: number;
  sentiment?: Sentiment;
};

// Guard so we never read uid from null
function requireUid(): string {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("No user logged in");
  return uid;
}
const colRef = () => collection(db, "users", requireUid(), "entries");

// Create (runs AI)
export async function createEntry(text: string, mood?: number, tags: string[] = []) {
  const sentiment = await analyzeSentiment(text); // your free-tier AI call
  const payload: Omit<Entry, "id"> = {
    text, mood, tags, sentiment,
    createdAt: serverTimestamp() as any,
    updatedAt: serverTimestamp() as any,
    clientUpdatedAt: Date.now(),
  };
  const ref = await addDoc(colRef(), payload as any);
  return ref.id;
}

export async function updateEntry(id: string, patch: Partial<Entry>) {
  await setDoc(
    doc(colRef(), id),
    { ...patch, updatedAt: serverTimestamp(), clientUpdatedAt: Date.now() },
    { merge: true }
  );
}

export async function deleteEntry(id: string) {
  await deleteDoc(doc(colRef(), id));
}

export async function listEntriesPage(
  pageSize = 10,
  cursor?: DocumentSnapshot
): Promise<{ items: Entry[]; nextCursor?: DocumentSnapshot }> {
  const base = query(colRef(), orderBy("createdAt", "desc"), limit(pageSize));
  const q = cursor ? query(base, startAfter(cursor)) : base;

  const snap = await getDocs(q);
  const items = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })) as Entry[];
  const nextCursor = snap.docs.length ? snap.docs[snap.docs.length - 1] : undefined;
  return { items, nextCursor };
}