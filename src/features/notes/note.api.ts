import { db, auth } from "../../lib/firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  startAfter,
  DocumentSnapshot,
  Timestamp,
} from "firebase/firestore";
import { summarizeText } from "../ai/summarize.api";

export type Note = {
  id?: string;
  content: string;         // raw note text
  summary?: string;        // AI-generated summary
  userId: string;          // linked user
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  clientUpdatedAt?: number;
};

// 🔒 Helper: ensure user logged in
function requireUid(): string {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("No user logged in");
  return uid;
}

// 🧩 Reference to top-level "notes" collection
const colRef = () => collection(db, "notes");

// 🪄 Create a note (with AI summarization)
export async function createNote(content: string) {
  const uid = requireUid();
  const summary = await summarizeText(content);

  const payload: Omit<Note, "id"> = {
    content,
    summary,
    userId: uid,
    createdAt: serverTimestamp() as any,
    updatedAt: serverTimestamp() as any,
    clientUpdatedAt: Date.now(),
  };

  const ref = await addDoc(colRef(), payload as any);
  return ref.id;
}

// ✏️ Update note (e.g., edit content or summary)
export async function updateNote(id: string, patch: Partial<Note>) {
  await setDoc(
    doc(colRef(), id),
    { ...patch, updatedAt: serverTimestamp(), clientUpdatedAt: Date.now() },
    { merge: true }
  );
}

// ❌ Delete a note
export async function deleteNote(id: string) {
  await deleteDoc(doc(colRef(), id));
}

// 📄 Paginate notes for current user
export async function listNotesPage(
  pageSize = 10,
  cursor?: DocumentSnapshot
): Promise<{ items: Note[]; nextCursor?: DocumentSnapshot }> {
  const uid = requireUid();
  const base = query(
    colRef(),
    orderBy("createdAt", "desc"),
    limit(pageSize)
  );

  const snap = await getDocs(base);
  const items = snap.docs
    .map((d) => ({ id: d.id, ...(d.data() as any) }))
    .filter((n) => n.userId === uid) as Note[];

  const nextCursor = snap.docs.length
    ? snap.docs[snap.docs.length - 1]
    : undefined;

  return { items, nextCursor };
}
