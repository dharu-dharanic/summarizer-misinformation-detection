# VerifAI — Summarizer + Misinformation Detector

AI-powered document analysis: get clean summaries and instant fake-statement detection.

---

## Quick Start

### 1. Backend (Flask)
```bash
cd backend
pip install -r requirements.txt
python app.py
```
Flask runs at http://localhost:5000

### 2. Ollama (required)
```bash
# Install from https://ollama.com then:
ollama serve
ollama pull llama3.2
```

### 3. Frontend (React)
```bash
cd frontend
npm install
npm start
```
App opens at http://localhost:3000

---

## What's Improved

### Backend
- `/health` endpoint — frontend checks if Ollama is alive before you submit
- Proper input validation (min/max length, file type checks)
- `confidence` score returned alongside every analysis
- `word_count` returned for display in the UI
- Better error messages (timeout vs connection refused vs bad JSON)
- Cleaner prompt that explicitly requests a JSON response
- `num_predict` used instead of deprecated `max_tokens`

### Frontend
- **Ollama status indicator** — live green/red dot in the header area
- **Character counter** with colour-coded progress bar on the textarea
- **File drop zone** with file name + size preview
- **Confidence bar** shown under the summary
- **Download Report** generates a formatted .txt with all results
- **Flagged count badge** on the Fake Statements tab
- Errors shown inline (no more `alert()` calls)
- Dark/light theme via CSS variables — no flickering
- Removed `localStorage` usage (not needed for theme)
- Clean editorial design: DM Serif Display + DM Sans fonts

### Removed
- `RiskLevel.jsx` — merged into `Results.jsx` as a cleaner inline risk banner
- `FileUpload.jsx` and `TextInput.jsx` — consolidated into `InputPage.jsx` (simpler, less prop-drilling)

---

## API Reference

### POST /summarize
| Field | Type | Notes |
|-------|------|-------|
| text  | string (form) | Raw text to analyse |
| file  | file (form) | .txt or .pdf |
| query | string (form) | Optional focus query |

**Response:**
```json
{
  "summary": "...",
  "fake_sentences": ["..."],
  "risk_level": "Low | Medium | High",
  "confidence": 85,
  "word_count": 342,
  "query": "..."
}
```

### GET /health
```json
{ "status": "ok", "ollama": true }
```
