// server.js
import express from "express";
import axios from "axios";
import cors from "cors";

const app = express();

// ✅ Allow Expo web & mobile connections
app.use(
  cors({
    origin: [
      "http://localhost:8081",
      "http://127.0.0.1:8081",
      "exp://localhost:8081",
      "exp://127.0.0.1:8081",
    ],
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// 🔑 Your HuggingFace token (keep private)
const HF_TOKEN = "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";

// 🧠 Route: summarize text using HuggingFace model
app.post("/summarize", async (req, res) => {
  try {
    const response = await axios.post(
      "https://api-inference.huggingface.co/models/sshleifer/distilbart-cnn-12-6",
      { inputs: req.body.text },
      { headers: { Authorization: `Bearer ${HF_TOKEN}` } }
    );

    // ✅ Allow browser access
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.json(response.data);
  } catch (err) {
    console.error("Proxy error:", err.message);
    res.status(500).json({
      error: err.message,
      details: err.response?.data || null,
    });
  }
});

// ✅ Use a non-conflicting port (AirPlay uses 5000 on macOS)
const PORT = 5050;
app.listen(PORT, () =>
  console.log(`✅ Proxy running with CORS at http://localhost:${PORT}`)
);
