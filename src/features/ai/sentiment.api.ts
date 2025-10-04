// // src/features/ai/sentiment.api.ts
// import { hf } from "../../config/ai.config";

// export type Sentiment = {
//   label: "pos" | "neu" | "neg";
//   score: number;
//   modelVer?: string;
// };

// // normalize raw labels (Positive / LABEL_0, etc) → pos/neu/neg
// function normalizeLabel(label: string): Sentiment["label"] {
//   const l = label.toLowerCase();
//   if (l.includes("pos")) return "pos";
//   if (l.includes("neg")) return "neg";
//   return "neu";
// }

// /**
//  * Analyze text with Hugging Face sentiment model.
//  * Falls back to simple keyword sentiment if API fails.
//  */
// export async function analyzeSentiment(text: string): Promise<Sentiment> {
//   const cleaned = (text || "").trim();
//   if (cleaned.length < 3) return { label: "neu", score: 0.5, modelVer: "short-text" };

//   try {
//     const res = await fetch(
//       `https://api-inference.huggingface.co/models/${encodeURIComponent(hf.model)}`,
//       {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${hf.token}`,
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ inputs: cleaned }),
//       }
//     );

//     if (!res.ok) throw new Error(`HF error: ${res.status}`);
//     const data: any = await res.json();

//     // Models return [[{label,score},...]] or [{label,score},...]
//     const arr: any[] = Array.isArray(data) ? (Array.isArray(data[0]) ? data[0] : data) : [];
//     if (!arr.length) throw new Error("Empty HF result");

//     const best = arr.reduce((a: any, b: any) => (b.score > a.score ? b : a));
//     return {
//       label: normalizeLabel(best.label),
//       score: typeof best.score === "number" ? best.score : 0.5,
//       modelVer: hf.model,
//     };
//   } catch (e) {
//     // fallback → simple keyword sentiment
//     const t = cleaned.toLowerCase();
//     const negWords = ["sad", "angry", "stress", "bad", "tired", "worried", "anxious", "awful", "hate", "cry"];
//     const posWords = ["happy", "great", "love", "fun", "excited", "amazing", "awesome", "good", "proud", "grateful"];

//     if (posWords.some((w) => t.includes(w))) {
//       return { label: "pos", score: 0.8, modelVer: "fallback" };
//     }
//     if (negWords.some((w) => t.includes(w))) {
//       return { label: "neg", score: 0.8, modelVer: "fallback" };
//     }
//     return { label: "neu", score: 0.5, modelVer: "fallback" };
//   }
// }