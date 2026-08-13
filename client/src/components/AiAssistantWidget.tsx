import React, { useState } from "react";
import api from "../services/api";

export const AiAssistantWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([
    { sender: "AI", text: "Hello! How can I help you navigate the Mech Spec LMS platform today?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    const userMessage = input;
    setMessages((prev) => [...prev, { sender: "User", text: userMessage }]);
    setInput("");
    setLoading(true);
    try {
      const res = await api.post("/assistant", { prompt: userMessage });
      const reply = res.data?.data?.reply || res.data?.reply || "Sorry, something went wrong.";
      setMessages((prev) => [...prev, { sender: "AI", text: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { sender: "AI", text: "Network error connecting to support assistant." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999, fontFamily: "system-ui, sans-serif" }}>
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          style={{ background: "#2563eb", color: "#fff", border: "none", borderRadius: 999, padding: "12px 18px", cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.2)" }}
        >
          💬 Support AI
        </button>
      ) : (
        <div style={{ width: 340, height: 420, background: "#fff", borderRadius: 12, boxShadow: "0 8px 24px rgba(0,0,0,0.2)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ background: "#2563eb", color: "#fff", padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>Mech Spec Platform Support</span>
            <button onClick={() => setIsOpen(false)} style={{ background: "transparent", border: "none", color: "#fff", fontSize: 20, cursor: "pointer" }}>×</button>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: 12, background: "#f8fafc" }}>
            {messages.map((m, idx) => (
              <div key={idx} style={{ marginBottom: 10, padding: 8, borderRadius: 8, background: m.sender === "User" ? "#dbeafe" : "#fff", border: "1px solid #e2e8f0" }}>
                <strong>{m.sender}: </strong>{m.text}
              </div>
            ))}
            {loading && <div style={{ color: "#64748b" }}>Typing...</div>}
          </div>
          <form onSubmit={sendMessage} style={{ display: "flex", borderTop: "1px solid #e2e8f0", padding: 8, gap: 6 }}>
            <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask how to register, buy, or upload..." style={{ flex: 1, padding: 8, border: "1px solid #cbd5e1", borderRadius: 6 }} />
            <button type="submit" style={{ background: "#2563eb", color: "#fff", border: "none", borderRadius: 6, padding: "8px 12px", cursor: "pointer" }}>Send</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AiAssistantWidget;
