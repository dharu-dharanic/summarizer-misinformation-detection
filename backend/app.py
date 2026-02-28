from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import json
import re
import pdfplumber
from typing import List, Optional
import logging

# ─────────────────────────────────────────────────────────
# App Setup
# ─────────────────────────────────────────────────────────
app = Flask(__name__)
CORS(app)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

OLLAMA_URL   = "http://localhost:11434/api/generate"
OLLAMA_MODEL = "llama3.2"

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
# Ollama Processing
# ─────────────────────────────────────────────────────────

PROMPT_TEMPLATE = """You are an expert fact-checker and summarizer. Analyze the document below carefully.

USER QUERY (focus summary on this if provided):
\"\"\"{query}\"\"\"

RULES:
1. SUMMARY - Write a clear, factual summary (3-6 sentences). Base it ONLY on true statements.
   If a user query is given, focus the summary on answering it.
2. FAKE_SENTENCES - List every sentence that is false, misleading, or scientifically incorrect.
   Copy sentences exactly as they appear in the document.
3. RISK_LEVEL - One of: "Low", "Medium", "High"
   - Low: no or trivial misinformation
   - Medium: some misleading statements
   - High: significant or dangerous misinformation
4. CONFIDENCE - Integer 0-100 indicating your certainty about the analysis.

Respond ONLY with valid JSON. No extra text, no markdown fences:
{{
  "summary": "<factual summary here>",
  "fake_sentences": ["<sentence1>", "<sentence2>"],
  "risk_level": "Low",
  "confidence": 85
}}

Document:
\"\"\"{document}\"\"\"
"""

def ollama_analyze(document_text: str, query: str = "") -> dict:
    if len(document_text) > MAX_TEXT_LENGTH:
        document_text = document_text[:MAX_TEXT_LENGTH] + "\n\n[Document truncated for analysis]"

    prompt = PROMPT_TEMPLATE.format(
        query=query.strip() or "General summary",
        document=document_text,
    )

    payload = {
        "model": OLLAMA_MODEL,
        "prompt": prompt,
        "options": {"temperature": 0.0, "num_predict": 1500},
        "stream": False,
    }

    try:
        resp = requests.post(OLLAMA_URL, json=payload, timeout=90)
        resp.raise_for_status()
        data = resp.json()
        raw_text = data.get("response") or ""
        if isinstance(raw_text, list):
            raw_text = " ".join(raw_text)

        parsed = extract_json_from_text(raw_text)
        if parsed and isinstance(parsed, dict):
            return {
                "summary":        str(parsed.get("summary", "")).strip(),
                "fake_sentences": [s for s in parsed.get("fake_sentences", []) if isinstance(s, str)],
                "risk_level":     parsed.get("risk_level", "Low"),
                "confidence":     int(parsed.get("confidence", 75)),
            }

        # Regex fallback
        logger.warning("JSON parse failed — using regex fallback")
        content = raw_text
        fake_sentences, risk, confidence = [], "Low", 50

        m_fake = re.search(r'fake[\s_-]*sentences[:\s]*(.*?)(?=risk|confidence|$)', content, re.I | re.DOTALL)
        if m_fake:
            for it in re.split(r'[\n\r]+', m_fake.group(1)):
                it = it.strip(' -"[]')
                if len(it) > 5:
                    fake_sentences.append(it)

        m_risk = re.search(r'risk[_\s-]*level[:\s]*([A-Za-z]+)', content, re.I)
        if m_risk:
            risk = m_risk.group(1).capitalize()

        m_conf = re.search(r'confidence[:\s]*(\d+)', content, re.I)
        if m_conf:
            confidence = min(100, max(0, int(m_conf.group(1))))

        sents = simple_split_sentences(document_text)
        summary = " ".join(sents[:3]) if sents else document_text[:200]

        return {"summary": summary, "fake_sentences": fake_sentences, "risk_level": risk, "confidence": confidence}

    except requests.Timeout:
        return fallback_result(document_text, "Ollama request timed out. Is Ollama running?")
    except requests.ConnectionError:
        return fallback_result(document_text, "Cannot connect to Ollama. Please start it with: ollama serve")
    except requests.RequestException as e:
        return fallback_result(document_text, f"Ollama request failed: {str(e)}")


# ─────────────────────────────────────────────────────────
# Routes
# ─────────────────────────────────────────────────────────

@app.route("/health", methods=["GET"])
def health():
    """Health check — lets the frontend verify server + Ollama are up."""
    try:
        r = requests.get("http://localhost:11434/", timeout=3)
        ollama_ok = r.status_code == 200
    except Exception:
        ollama_ok = False
    return jsonify({"status": "ok", "ollama": ollama_ok})


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

    result = ollama_analyze(text, query)

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
    app.run(debug=True, port=5000)
