import { useEffect, useRef, useState, useCallback } from "react";
import { BsSendFill } from "react-icons/bs";
import { MdDarkMode, MdLightMode, MdDeleteOutline } from "react-icons/md";
// Suggestion: install react-markdown to render code blocks properly
// import ReactMarkdown from 'react-markdown'; 

function App() {
  const [message, setMessage] = useState("");
  const [chats, setChats] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [darkMode, setDarkMode] = useState(true); // Default to dark for "Expert" feel
  
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom whenever chats update
  const scrollToBottom = useCallback(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [chats, isTyping, scrollToBottom]);

  // Optimized Animation: Updates only the last message
  const animateAIResponse = async (fullText) => {
    setIsTyping(false); 
    let currentText = "";
    
    // Add an empty placeholder for the AI response
    setChats((prev) => [...prev, { role: "model", text: "" }]);

    for (let i = 0; i < fullText.length; i++) {
      currentText += fullText[i];
      // Functional update to avoid dependency issues
      setChats((prev) => {
        const newChats = [...prev];
        newChats[newChats.length - 1] = { role: "model", text: currentText };
        return newChats;
      });
      // Faster typing for longer strings, slower for short ones
      const delay = fullText.length > 100 ? 5 : 15;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  };

  const handleSend = async () => {
    const trimmedMsg = message.trim();
    if (!trimmedMsg || isTyping) return;

    const userMessage = { role: "user", text: trimmedMsg };
    setChats((prev) => [...prev, userMessage]);
    setMessage("");
    setIsTyping(true);

    try {
      const response = await fetch("https://dsa-expert-1.onrender.com/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: trimmedMsg }),
      });

      const data = await response.json();
      await animateAIResponse(data.message);
    } catch (error) {
      console.error("Error:", error);
      setChats((prev) => [...prev, { role: "model", text: "⚠️ Error: Could not connect to the server." }]);
      setIsTyping(false);
    }
  };

  const clearChat = () => {
    if (window.confirm("Clear all messages?")) setChats([]);
  };

  return (
    <div className={`flex flex-col h-screen transition-colors duration-300 ${
      darkMode ? "bg-[#0b0e14] text-gray-100" : "bg-gray-50 text-gray-900"
    }`}>
      
      {/* Header */}
      <header className={`sticky top-0 z-10 w-full py-4 px-8 flex items-center justify-between backdrop-blur-md border-b ${
        darkMode ? "bg-gray-900/80 border-gray-700" : "bg-white/80 border-gray-200"
      }`}>
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-500/20">
            <span className="text-xl">🚀</span>
          </div>
          <div>
            <h1 className="font-bold text-xl tracking-tight">DSA Expert</h1>
            <p className="text-[10px] uppercase tracking-widest text-blue-500 font-semibold">AI Assistant</p>
          </div>
        </div>
        
        <div className="flex gap-4">
          <button onClick={clearChat} className="p-2 hover:text-red-500 transition-colors" title="Clear Chat">
            <MdDeleteOutline size={22} />
          </button>
          <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-xl bg-gray-200/50 dark:bg-gray-800 hover:scale-110 transition-transform">
            {darkMode ? <MdLightMode size={20} className="text-yellow-400" /> : <MdDarkMode size={20} />}
          </button>
        </div>
      </header>

      {/* Chat Canvas */}
      <main className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {chats.length === 0 && (
            <div className="text-center py-20 opacity-50">
              <p className="text-lg">Ask me about Arrays, Graphs, or Dynamic Programming!</p>
            </div>
          )}

          {chats.map((chat, index) => (
            <div key={index} className={`flex ${chat.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`flex max-w-[85%] md:max-w-[70%] ${chat.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                <div className={`flex-shrink-0 h-10 w-10 rounded-xl flex items-center justify-center shadow-sm ${
                  chat.role === "user" ? "ml-3 bg-blue-600" : "mr-3 bg-gray-700"
                }`}>
                  {chat.role === "user" ? "👤" : "🤖"}
                </div>
                <div className={`px-5 py-3 rounded-2xl leading-relaxed ${
                  chat.role === "user" 
                    ? "bg-blue-600 text-white rounded-tr-none shadow-blue-500/10" 
                    : darkMode ? "bg-gray-800 text-gray-200 rounded-tl-none border border-gray-700" : "bg-white text-gray-800 rounded-tl-none border border-gray-200 shadow-sm"
                }`}>
                  <p className="whitespace-pre-wrap text-sm md:text-base">{chat.text}</p>
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start animate-pulse">
               <div className="mr-3 h-10 w-10 rounded-xl bg-gray-700 flex items-center justify-center text-xs">...</div>
               <div className={`px-6 py-3 rounded-2xl ${darkMode ? "bg-gray-800" : "bg-gray-200"}`}>
                 <span className="flex gap-1">
                   <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                   <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                   <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                 </span>
               </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>
      </main>

      {/* Glassmorphic Input Bar */}
      <footer className="p-4 md:p-8">
        <div className={`max-w-4xl mx-auto flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl transition-all border ${
          darkMode ? "bg-gray-800/50 border-gray-700 focus-within:border-blue-500" : "bg-white border-gray-200 focus-within:border-blue-400"
        } backdrop-blur-xl`}>
          <input
            ref={inputRef}
            type="text"
            placeholder="Type your DSA question..."
            className="flex-1 bg-transparent outline-none text-sm md:text-base"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <button
            onClick={handleSend}
            disabled={!message.trim() || isTyping}
            className={`p-3 rounded-xl transition-all ${
              message.trim() && !isTyping 
                ? "bg-blue-600 text-white hover:bg-blue-700 hover:scale-105 active:scale-95" 
                : "bg-gray-600/20 text-gray-500 cursor-not-allowed"
            }`}
          >
            <BsSendFill size={18} />
          </button>
        </div>
      </footer>
    </div>
  );
}

export default App;