// src/features/ai/summarize.api.ts
import axios from "axios";
import { Platform } from "react-native";
import { AIConfig } from "../../config/ai.config";

export async function summarizeText(text: string): Promise<string> {
  try {
    const isWeb = Platform.OS === "web";

    // 👇 Switch: Web → use proxy (CORS-safe); Native → direct HuggingFace
    const useProxy = isWeb || __DEV__;

    let res;
    if (useProxy) {
      // Local proxy route
      res = await axios.post(AIConfig.LOCAL_PROXY_URL, { text });
    } else {
      // Direct Hugging Face inference call
      res = await axios.post(
        AIConfig.HF_API_URL,
        { inputs: text },
        {
          headers: { Authorization: `Bearer ${AIConfig.HF_API_TOKEN}` },
          timeout: 30000,
        }
      );
    }

    // Normalize return value
    const data = res.data;
    if (Array.isArray(data) && data[0]?.summary_text) {
      return data[0].summary_text;
    }
    if (data?.data?.[0]) {
      // (for Space API style)
      return data.data[0];
    }

    return "No summary available";
  } catch (err: any) {
    console.error("Summarization error:", err.response?.data || err.message);
    return "Error summarizing text.";
  }
}
