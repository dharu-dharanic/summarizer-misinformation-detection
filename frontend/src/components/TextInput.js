
import React, { useState } from "react";

const TextInput = ({ onStart, mode }) => {
  const [text, setText] = useState("");
  const [query, setQuery] = useState("");

  const handleSubmit = () => {
    if (!text.trim()) {
      alert("Please enter text!");
      return;
    }
    onStart("text", { text, query });
  };

  return (
    <div className={`card-container ${mode}-mode`}>
      <h2>📝 Text Input</h2>
      <textarea
        placeholder="Enter your text here..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={8}
        className="text-area"
      />
      <input
        type="text"
        placeholder="Optional query..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="query-input"
      />
      <button className="analyze-btn" onClick={handleSubmit}>
        Summarize
      </button>

      <style>{`
        .card-container {
          padding: 30px;
          border-radius: 18px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
          transition: all 0.3s ease;
          margin-bottom: 25px;
          background: ${mode === "light" ? "#fdf6e3" : "#3a3a4e"};
        }
        .card-container:hover {
          box-shadow: 0 12px 30px rgba(0,0,0,0.15);
        }
        .card-container h2 {
          margin-bottom: 20px;
          text-align: center;
          color: ${mode === "light" ? "#7d3c98" : "#ffc7f5"};
          font-size: 1.8rem;
        }
        .text-area, .query-input {
          width: 100%;
          padding: 14px;
          border-radius: 12px;
          border: 1.5px solid ${mode === "light" ? "#ccc" : "#555"};
          background: ${mode === "light" ? "#fff" : "#4a3a6f"};
          color: ${mode === "light" ? "#333" : "#eee"};
          font-size: 1rem;
          margin-bottom: 18px;
          transition: all 0.3s ease;
        }
        .text-area:focus, .query-input:focus {
          outline: none;
          border-color: ${mode === "light" ? "#9b59b6" : "#ffc7f5"};
          box-shadow: 0 0 10px rgba(155,89,182,0.3);
        }
        .analyze-btn {
          display: block;
          width: 100%;
          padding: 14px 0;
          font-size: 1.1rem;
          font-weight: 600;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          background: linear-gradient(135deg, #9b59b6, #8e44ad);
          color: #fff;
          box-shadow: 0 5px 15px rgba(0,0,0,0.2);
          transition: all 0.3s ease;
        }
        .analyze-btn:hover {
          transform: translateY(-2px);
          opacity: 0.9;
        }
      `}</style>
    </div>
  );
};

export default TextInput;
