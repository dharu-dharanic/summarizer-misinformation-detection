from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import re
import os
import pdfplumber
from typing import List, Optional
import logging
from groq import Groq

# ─────────────────────────────────────────────────────────
# App Setup
# ─────────────────────────────────────────────────────────
app = Flask(__name__)
CORS(app)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

groq_client = Groq(api_key=os.environ.get("GROQ_API_KEY", "YOUR_API_KEY_HERE"))

MAX_TEXT_LENGTH = 15_000
MIN_TEXT_LENGTH = 30

# ─────────────────────────────────────────────────────────
# File Extraction
# ─────────────────────────────────────────────────────────

ALLOWED_EXTENSIONS = {".txt", ".pdf"}

def extract_text(file) -> Optional[str]:
    filename = file.filename.lower()
    ext = next((e for e in ALLOWED_EXTENSIONS if filename.endswith(e)), None)
    if ext is None:
        return None

    if ext == ".txt":
        try:
            file.seek(0)
            return file.read().decode("utf-8", errors="replace")
        except Exception as e:
            logger.error("TXT read error: %s", e)
            return None

    if ext == ".pdf":
        try:
            parts = []
            with pdfplumber.open(file.stream) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text() or ""
                    if page_text.strip():
                        parts.append(page_text)
                    for table in page.extract_tables():
                        parts.append("\n[TABLE]\n")
                        for row in table:
                            parts.append(" | ".join(cell or "" for cell in row))
                        parts.append("[/TABLE]\n")
            return "\n".join(parts).strip() or None
        except Exception as e:
            logger.error("PDF read error: %s", e)
            return None

    return None


# ─────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────

def simple_split_sentences(text: str) -> List[str]:
    text = text.strip()
    if not text:
        return []
    return [s.strip() for s in re.split(r'(?<=[.!?])\s+', text) if s.strip()]


def extract_json_from_text(s: str) -> Optional[dict]:
    s = s.strip()
    # Remove markdown code fences if model adds them
    s = re.sub(r'^```json\s*', '', s)
    s = re.sub(r'\s*```$', '', s)
    s = s.strip()
    if s.startswith("{") and s.endswith("}"):
        try:
            return json.loads(s)
        except json.JSONDecodeError:
            pass
    match = re.search(r'(\{[\s\S]*\})', s)
    if match:
        try:
            return json.loads(match.group(1))
        except json.JSONDecodeError:
            pass
    return None


def fallback_result(document_text: str, error_msg: str = "") -> dict:
    sents = simple_split_sentences(document_text)
    summary = " ".join(sents[:3]) if sents else document_text[:200]
    return {
        "summary": summary,
        "fake_sentences": [],
        "risk_level": "Low",
        "confidence": 0,
        **({"error": error_msg} if error_msg else {}),
    }


# ─────────────────────────────────────────────────────────
# Groq Processing
# ─────────────────────────────────────────────────────────

PROMPT_TEMPLATE = """You are an expert fact-checker. You will be given a list of numbered sentences.

For each sentence, decide if it is TRUE or FALSE.
- TRUE = factually correct
- FALSE = false, misleading, or scientifically incorrect

Respond ONLY with valid JSON. No extra text, no markdown fences:
{{
  "labels": {{"0": "TRUE", "1": "FALSE", "2": "TRUE"}},
  "risk_level": "Low",
  "confidence": 90
}}

Sentences:
{sentences}
"""

def analyze(document_text: str, query: str = "") -> dict:
    if len(document_text) > MAX_TEXT_LENGTH:
        document_text = document_text[:MAX_TEXT_LENGTH] + "\n\n[Document truncated]"

    # Python splits sentences — AI only labels them
    all_sentences = simple_split_sentences(document_text)
    if not all_sentences:
        return fallback_result(document_text)

    numbered = "\n".join(f"{i}. {s}" for i, s in enumerate(all_sentences))
    prompt = PROMPT_TEMPLATE.format(sentences=numbered)

    try:
        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.0,
        )
        raw_text = response.choices[0].message.content or ""

        parsed = extract_json_from_text(raw_text)
        if parsed and isinstance(parsed, dict):
            labels = parsed.get("labels", {})

            true_sentences = []
            fake_sentences = []
            for i, sent in enumerate(all_sentences):
                label = labels.get(str(i), "TRUE").upper()
                if label == "FALSE":
                    fake_sentences.append(sent)
                else:
                    true_sentences.append(sent)

            # Summary = only true sentences
            summary = " ".join(true_sentences)

            # If query given, filter to relevant sentences
            if query:
                query_words = [w.lower() for w in query.split() if len(w) > 3]
                relevant = [s for s in true_sentences if any(w in s.lower() for w in query_words)]
                if relevant:
                    summary = " ".join(relevant)

            # Calculate risk level from fake ratio
            fake_count = len(fake_sentences)
            total = len(all_sentences)
            if fake_count == 0:
                risk = "Low"
            elif fake_count / total < 0.3:
                risk = "Medium"
            else:
                risk = "High"

            # Use model's risk if valid
            model_risk = parsed.get("risk_level", "").capitalize()
            if model_risk in ("Low", "Medium", "High"):
                risk = model_risk

            return {
                "summary":        summary.strip(),
                "fake_sentences": fake_sentences,
                "risk_level":     risk,
                "confidence":     int(parsed.get("confidence", 75)),
            }

        logger.warning("JSON parse failed — using fallback")
        return fallback_result(document_text)

    except Exception as e:
        logger.error("Groq error: %s", e)
        return fallback_result(document_text, f"Groq API error: {str(e)}")


# ─────────────────────────────────────────────────────────
# Routes
# ─────────────────────────────────────────────────────────

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "ollama": True})


@app.route("/summarize", methods=["POST"])
def summarize():
    query = (request.form.get("query") or "").strip()
    file  = request.files.get("file")
    text  = (request.form.get("text") or "").strip()

    if file:
        text = extract_text(file)
        if not text:
            return jsonify({"error": "Unsupported or unreadable file. Only .txt and .pdf are allowed."}), 400
    elif not text:
        return jsonify({"error": "No text or file provided."}), 400

    if len(text) < MIN_TEXT_LENGTH:
        return jsonify({"error": f"Text is too short (minimum {MIN_TEXT_LENGTH} characters)."}), 400

    result = analyze(text, query)

    return jsonify({
        "summary":        result.get("summary", ""),
        "query":          query,
        "risk_level":     result.get("risk_level", "Low"),
        "fake_sentences": result.get("fake_sentences", []),
        "confidence":     result.get("confidence", 0),
        "word_count":     len(text.split()),
        **({"error": result["error"]} if "error" in result else {}),
    })


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False)