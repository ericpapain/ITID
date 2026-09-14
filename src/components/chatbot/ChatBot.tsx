import { useState, useRef, useEffect } from "react";
import { BOT_RESPONSES, getBotReply } from "../../constants/chatbot";
import type { Message } from "../../types";

export function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "bot", text: BOT_RESPONSES.default },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const send = (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg) return;
    setMessages((m) => [...m, { role: "user", text: msg }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages((m) => [...m, { role: "bot", text: getBotReply(msg) }]);
    }, 1100);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {open && (
        <div
          className="w-[340px] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          style={{ background: "#fff", border: "1px solid #e2ddd6", maxHeight: 480 }}
        >
          <div className="flex items-center gap-3 px-4 py-3" style={{ background: "#1a3a5c" }}>
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: "#2a9d8f", color: "#fff" }}>
              IA
            </div>
            <div className="flex-1">
              <div className="text-white font-semibold text-sm" style={{ fontFamily: "var(--font-display)" }}>Assistant ITID</div>
              <div className="text-xs" style={{ color: "#8fb3d0" }}>Réponse en quelques secondes</div>
            </div>
            <button onClick={() => setOpen(false)} className="text-white opacity-60 hover:opacity-100 text-lg leading-none">✕</button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ background: "#f7f4ef" }}>
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className="max-w-[82%] rounded-xl px-3 py-2 text-sm leading-relaxed"
                  style={m.role === "user"
                    ? { background: "#1a3a5c", color: "#fff" }
                    : { background: "#fff", color: "#f8fafc", border: "1px solid #e2ddd6" }}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex justify-start">
                <div className="rounded-xl px-4 py-2 text-sm" style={{ background: "#fff", border: "1px solid #e2ddd6", color: "#cbd5e1" }}>
                  <span className="animate-pulse">···</span>
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          <div className="px-3 py-2 flex gap-2 overflow-x-auto" style={{ borderTop: "1px solid #e2ddd6" }}>
            {["Prendre RDV", "Traitements", "Formations"].map((q) => (
              <button key={q} onClick={() => send(q)} className="shrink-0 px-2 py-1 rounded-full text-xs font-medium" style={{ background: "#e8f4f2", color: "#2a9d8f", border: "1px solid #b3ddd9" }}>
                {q}
              </button>
            ))}
          </div>

          <div className="flex gap-2 p-3" style={{ borderTop: "1px solid #e2ddd6" }}>
            <input
              className="flex-1 rounded-xl px-3 py-2 text-sm outline-none"
              style={{ background: "#f7f4ef", border: "1px solid #d8d2c8", color: "#f8fafc" }}
              placeholder="Votre question…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
            />
            <button onClick={() => send()} className="w-9 h-9 rounded-xl flex items-center justify-center text-white" style={{ background: "#2a9d8f" }}>➤</button>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        className="w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-white text-2xl transition-transform hover:scale-105 active:scale-95"
        style={{ background: open ? "#1a3a5c" : "#2a9d8f" }}
        aria-label="Ouvrir le chat IA"
      >
        {open ? "✕" : "💬"}
      </button>
    </div>
  );
}
