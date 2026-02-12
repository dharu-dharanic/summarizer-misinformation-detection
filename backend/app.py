# app.py using Ollama

from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import json
import re
import pdfplumber
from typing import List

app = Flask(__name__)
CORS(app)

OLLAMA_URL = "http://localhost:11434/api/generate"
OLLAMA_MODEL = "llama3.2"

# -----------------------------
# Helpers
# -----------------------------

def extract_text(file) -> str | None:
    """Extract text + tables from TXT or PDF files."""
    filename = file.filename.lower()

    # ----------------
    # TXT file
    # ----------------
    if filename.endswith(".txt"):
        try:
            file.seek(0)
            return file.read().decode("utf-8")
        except Exception as e:
            print("TXT read error:", e)
            return None

    # ----------------
    # PDF file
    # ----------------
    if filename.endswith(".pdf"):
        try:
            text_output = []
            # Use file.stream for Flask FileStorage
            with pdfplumber.open(file.stream) as pdf:
                for page in pdf.pages:
                    # Extract text
                    page_text = page.extract_text() or ""
                    text_output.append(page_text)

                    # Extract tables
                    tables = page.extract_tables()
                    for table in tables:
                        text_output.append("\nTABLE DETECTED:\n")
                        for row in table:
                            row_text = " | ".join([cell if cell else "" for cell in row])
                            text_output.append(row_text)
                        text_output.append("\n")  # spacing

            return "\n".join(text_output).strip()
        except Exception as e:
            print("PDF read error:", e)
            return None

    return None

def simple_split_sentences(text: str) -> List[str]:
    text = text.strip()
    if not text:
        return []
    return [s.strip() for s in re.split(r'(?<=[.!?])\s+', text) if s.strip()]

def extract_json_from_text(s: str):
    s = s.strip()
    if (s.startswith("{") and s.endswith("}")):
        try:
            return json.loads(s)
        except:
            pass
    match = re.search(r'(\{[\s\S]*\})', s)
    if match:
        block = match.group(1)
        try:
            return json.loads(block)
        except:
            pass
    return None

# -----------------------------
# Ollama Processing
# -----------------------------

def ollama_analyze(document_text: str, query: str = "") -> dict:
    prompt = f"""
You are an expert fact-checker and summarizer. Follow these rules strictly.

USER QUERY:
\"\"\"{query.strip()}\"\"\" 

RULES:
1) SUMMARY:
- Include ONLY true statements from the document.
- Do NOT reference, correct, or explain false statements.
- Base summary only on the document's text.
- Include table insights if present.

2) FAKE SENTENCES:
- Include all sentences that are false, misleading, or scientifically incorrect.
- Return sentences exactly as they appear.

3) RISK LEVEL:
- Low, Medium, High as appropriate.

Output format (MUST be valid JSON):
{{
  "summary": "<true factual summary>",
  "fake_sentences": ["<sentence1>", "<sentence2>", ...],
  "risk_level": "Low"
}}

Document:
\"\"\"{document_text}\"\"\"

Begin.
"""

    payload = {
        "model": OLLAMA_MODEL,
        "prompt": prompt,
        "max_tokens": 1500,  # increased for longer documents
        "temperature": 0.0,
        "stream": False
    }

    try:
        resp = requests.post(OLLAMA_URL, json=payload, timeout=60)
        resp.raise_for_status()
        data = resp.json()
        text = data.get("response") or ""
        if isinstance(text, list):
            text = " ".join(text)

        parsed = extract_json_from_text(text)
        if parsed and isinstance(parsed, dict):
            return {
                "summary": parsed.get("summary", "").strip(),
                "fake_sentences": parsed.get("fake_sentences", []),
                "risk_level": parsed.get("risk_level", "Low")
            }

        # fallback if JSON not returned
        content = text
        summary = ""
        fake_sentences = []
        risk = "Low"

        # Fake sentences fallback
        m_fake = re.search(r'fake[\s_-]*sentences[:\s]*(.*)', content, flags=re.I | re.DOTALL)
        if m_fake:
            items = re.split(r'[\n\r]+', m_fake.group(1).strip())
            for it in items:
                it = it.strip(" -•\t")
                if len(it) > 5:
                    fake_sentences.append(it)

        # Risk fallback
        m_risk = re.search(r'Risk[:\s]*([A-Za-z]+)', content, flags=re.I)
        if m_risk:
            risk = m_risk.group(1).capitalize()

        # Summary fallback
        sents = simple_split_sentences(document_text)
        summary = " ".join(sents[:3]) if sents else document_text[:200]

        return {
            "summary": summary,
            "fake_sentences": fake_sentences,
            "risk_level": risk
        }

    except requests.RequestException as e:
        sents = simple_split_sentences(document_text)
        summary = " ".join(sents[:3]) if sents else document_text[:200]
        return {
            "summary": summary,
            "fake_sentences": [],
            "risk_level": "Low",
            "error": f"Ollama request failed: {str(e)}"
        }

# -----------------------------
# Route
# -----------------------------
@app.route("/summarize", methods=["POST"])
def summarize():
    query = request.form.get("query", "") or ""
    file = request.files.get("file")
    text = request.form.get("text")

    if file:
        text = extract_text(file)
        if not text:
            return jsonify({"error": "Unsupported file type"}), 400
    elif not text:
        return jsonify({"error": "No text or file provided"}), 400

    result = ollama_analyze(text, query)

    return jsonify({
        "summary": result.get("summary", ""),
        "query": query,
        "risk_level": result.get("risk_level", "Low"),
        "fake_sentences": result.get("fake_sentences", []),
        **({"error": result["error"]} if "error" in result else {})
    })

# -----------------------------
# Run
# -----------------------------
if __name__ == "__main__":
    app.run(debug=True)
