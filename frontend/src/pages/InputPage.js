import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import TextInput from "../components/TextInput";
import FileUpload from "../components/FileUpload";

const InputPage = ({ mode, setResult }) => {
  const [activeTab, setActiveTab] = useState("text");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleStartProcessing = (type, data) => {
    setLoading(true);
    const formData = new FormData();
    if (type === "text") {
      formData.append("text", data.text);
      formData.append("query", data.query);
    } else if (type === "file") {
      formData.append("file", data.file);
      formData.append("query", data.query);
    }

    fetch("http://127.0.0.1:5000/summarize", { method: "POST", body: formData })
      .then((res) => res.json())
      .then((res) => {
        setResult(res);
        setLoading(false);
        navigate("/results");
      })
      .catch(() => {
        setLoading(false);
        alert("Error generating summary");
      });
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1> Context-Aware Summarizer</h1>
      </header>

      {/* TAB SECTION */}
      <div className="tab-container">
        {["text", "file"].map((tab) => (
          <div
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`tab-item ${activeTab === tab ? "active" : ""}`}
          >
            {tab === "text" ? "Text Input" : "File Upload"}
          </div>
        ))}
      </div>

      <div className="tab-content">
        {activeTab === "text" && (
          <TextInput onStart={handleStartProcessing} mode={mode} />
        )}
        {activeTab === "file" && (
          <FileUpload onStart={handleStartProcessing} mode={mode} />
        )}
      </div>

      {loading && (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Analyzing content...</p>
        </div>
      )}

      {/* CSS */}
      <style>{`
        .app-container {
          max-width: 900px;
          margin: 50px auto;
          padding: 30px 40px;
          background: ${mode === "light" ? "#fdf6e3" : "#3a3a4e"};
          border-radius: 15px;
          box-shadow: 0 12px 30px rgba(0,0,0,0.15);
          transition: all 0.3s ease;
        }

        .app-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 25px;
        }

        .app-header h1 {
          font-size: 28px;
          letter-spacing: 0.5px;
          color: ${mode === "light" ? "#7d3c98" : "#ffc7f5"};
        }

        /* ---------------------------- */
        /*        TAB STYLING          */
        /* ---------------------------- */

        .tab-container {
          display: flex;
          margin-bottom: 20px;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);

          border: 2px solid ${mode === "light" ? "#9b59b6" : "#8e44ad"}; /* Border added */
        }

        .tab-item {
          flex: 1;
          text-align: center;
          padding: 12px 0;
          cursor: pointer;
          transition: all 0.3s ease;

          border-right: 2px solid ${mode === "light" ? "#9b59b6" : "#8e44ad"}; /* Divider added */
        }

        .tab-item:last-child {
          border-right: none;
        }

        .tab-item.active {
          background: ${mode === "light" ? "#9b59b6" : "#8e44ad"};
          color: #fff;
          font-weight: 600;
        }

        .tab-item:hover {
          background: ${mode === "light" ? "#8e44ad" : "#7d3c98"};
          color: #fff;
        }

        /* ---------------------------- */
        /*         LOADING BOX         */
        /* ---------------------------- */
        
        .loading-container {
          text-align: center;
          margin-top: 30px;
          font-weight: 500;
          color: ${mode === "light" ? "#333" : "#eee"};
        }

        .spinner {
          border: 5px solid #eee;
          border-top: 5px solid ${mode === "light" ? "#9b59b6" : "#ffc7f5"};
          border-radius: 50%;
          width: 60px;
          height: 60px;
          margin: 0 auto 10px;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default InputPage;
