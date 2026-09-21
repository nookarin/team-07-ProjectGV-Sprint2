import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Bot, MessageSquareText, Send, X } from "lucide-react";
import { useAuth } from "../contexts/Authentication/AuthContext";

export default function Chatbot() {
  const { url } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading, open]);

  const send = async (e) => {
    e?.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const nextMessages = [...messages, { role: "user", text }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const history = nextMessages.map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.text }],
      }));

      const response = await axios.post(`${url}/chatbot`, {
        message: text,
        history,
      });

      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: response.data.reply },
      ]);
    } catch (error) {
      console.log(error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "Sorry, I couldn't reach the assistant right now. Please try again later.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-5 z-50 flex h-[480px] w-[360px] max-w-[calc(100vw-40px)] flex-col overflow-hidden rounded-2xl border border-gpurple-3/40 bg-gbase-2 shadow-2xl shadow-gbg-1/80">
          <div className="flex items-center gap-3 border-b border-gpurple-3/30 bg-gbase-1 px-4 py-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gpurple-3/20 text-gcyan-neon">
              <Bot size={20} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-white">GearVerse Assistant</p>
              <p className="text-xs text-gpurple-1">
                {loading ? "Typing..." : "Online"}
              </p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="rounded-lg p-1.5 text-gpurple-1 transition hover:bg-gpurple-3/20 hover:text-white"
              aria-label="Close chat"
            >
              <X size={18} />
            </button>
          </div>

          <div
            ref={scrollRef}
            className="flex-1 space-y-3 overflow-y-auto bg-gbase-3 px-4 py-4"
          >
            {messages.length === 0 && (
              <p className="text-center text-sm text-gpurple-1">
                Hi! Ask me anything about our gaming gear, shipping, or support.
              </p>
            )}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm ${
                    msg.role === "user"
                      ? "rounded-br-sm bg-gpurple-3 text-white"
                      : "rounded-bl-sm bg-gbase-1 text-gcyan-neon"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-sm bg-gbase-1 px-3 py-2 text-sm text-gpurple-1">
                  Thinking...
                </div>
              </div>
            )}
          </div>

          <form
            onSubmit={send}
            className="flex items-center gap-2 border-t border-gpurple-3/30 bg-gbase-2 p-3"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 rounded-xl border border-gbase-1 bg-gbase-3 px-3 py-2 text-sm text-white placeholder:text-gpurple-1 focus:border-gpurple-3 focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="rounded-xl bg-gpurple-3 p-2 text-white transition hover:bg-gpurple-4 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Send message"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setOpen((prev) => !prev)}
        className="fixed bottom-6 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gpurple-3 text-white shadow-xl shadow-gpurple-5/50 transition hover:scale-105 hover:bg-gpurple-4"
        aria-label="Open chat"
      >
        {open ? <X size={24} /> : <MessageSquareText size={24} />}
      </button>
    </>
  );
}