import { useEffect, useRef, useState } from "react";
import { BsSendFill } from "react-icons/bs";
import { MdDarkMode, MdLightMode } from "react-icons/md";

function App() {
  const [message, setMessage] = useState("");
  const [chats, setChats] = useState([]);
  const scrollRef = useRef(null);
  const [isTyping, setIsTyping] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chats]);

  const animateAIResponse = async (fullText, updatedChats) => {
    let displayedText = "";
    setIsTyping(true);
    for (let i = 0; i < fullText.length; i++) {
      displayedText += fullText[i];
      setChats([...updatedChats, { role: "model", text: displayedText }]);
      await new Promise((resolve) => setTimeout(resolve, 15));
    }
    setIsTyping(false);
  };

  const handleSend = async (message) => {
    try {
      if (!message.trim()) return;

      const updatedChats = [...chats, { role: "user", text: message }];
      setChats(updatedChats);
      setMessage("");
      setIsTyping(true);

      const response = await fetch("https://dsa-expert-1.onrender.com/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: message,
        }),
      });

      const data = await response.json();
      await animateAIResponse(data.message, updatedChats);
    } catch (error) {
      console.error("Error fetching AI response:", error);
      setIsTyping(false);
    }
  };

  return (
    <div
      className={`flex flex-col h-screen ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
      }`}
    >
      {/* Header */}
      <div
        className={`w-full py-4 px-6 shadow-md flex items-center justify-between ${
          darkMode
            ? "bg-gradient-to-r from-gray-800 to-gray-700"
            : "bg-gradient-to-r from-blue-600 to-indigo-700 text-white"
        }`}
      >
        <h1 className="font-bold text-lg flex items-center gap-2">
          🚀 DSA Expert
        </h1>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          {darkMode ? (
            <MdLightMode size={22} className="text-yellow-400" />
          ) : (
            <MdDarkMode size={22} className="text-gray-100" />
          )}
        </button>
      </div>

      {/* Chat Container */}
      <div className="flex-1 overflow-y-auto p-6 mb-24 w-full">
        {chats.map((chat, index) => (
          <div
            key={index}
            className={`flex items-start mb-4 ${
              chat.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {chat.role === "model" && (
              <img
                src="/AI.png"
                alt="AI"
                className="w-10 h-10 rounded-full mr-3"
              />
            )}
            <div
              className={`px-4 py-2 rounded-2xl max-w-2xl break-words shadow-sm ${
                chat.role === "user"
                  ? "bg-blue-500 text-white rounded-br-none"
                  : darkMode
                  ? "bg-gray-700 text-gray-200 rounded-bl-none"
                  : "bg-gray-200 text-gray-900 rounded-bl-none"
              }`}
            >
              {chat.text}
            </div>
            {chat.role === "user" && (
              <img
                src="/profile.png"
                alt="You"
                className="w-10 h-10 rounded-full ml-3"
              />
            )}
          </div>
        ))}

        {isTyping && (
          <div className="flex items-start mb-4">
            <img
              src="AI.png"
              alt="AI typing"
              className="w-10 h-10 rounded-full mr-3"
            />
            <div
              className={`px-4 py-2 rounded-2xl max-w-2xl shadow-sm ${
                darkMode
                  ? "bg-gray-700 text-gray-200 rounded-bl-none"
                  : "bg-gray-200 text-gray-900 rounded-bl-none"
              }`}
            >
              Typing...
            </div>
          </div>
        )}
        <div ref={scrollRef}></div>
      </div>

      {/* Input Bar */}
      <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full flex justify-center mb-6">
        <div
          className={`flex items-center w-[70%] max-w-2xl rounded-full px-4 py-2 shadow-lg ${
            darkMode
              ? "bg-gray-800 border border-gray-600"
              : "bg-white border border-gray-300"
          }`}
        >
          <input
            type="text"
            placeholder="Ask anything about DSA..."
            className={`flex-1 outline-none px-3 py-2 rounded-full ${
              darkMode
                ? "bg-gray-800 text-white placeholder-gray-400"
                : "bg-white text-gray-700"
            }`}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSend(message);
            }}
          />
          <button
            className={`ml-2 ${
              darkMode
                ? "text-blue-400 hover:text-blue-600"
                : "text-blue-600 hover:text-blue-800"
            }`}
            onClick={() => handleSend(message)}
          >
            <BsSendFill size={22} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
