import { useEffect, useRef, useState } from "react";
import { BsSendFill } from "react-icons/bs";

function App() {
  const [message, setMessage] = useState("");
  const [chats, setChats] = useState([]);
  const scrollRef = useRef(null);
  const [isTyping, setIsTyping] = useState(false);

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
      await new Promise((resolve) => setTimeout(resolve, 10));
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

      const response = await fetch("http://localhost:3000/ai/chat", {
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
    <div className="flex flex-col h-screen">
      {/* Chat Scrollable Area */}
      <div className="flex-1 overflow-y-auto p-4 mb-20">
        {chats.map((chat, index) => (
          <div
            className={`chat ${chat.role === "user" ? "chat-end" : "chat-start"}`}
            key={index}
          >
            <div className="chat-image avatar">
              <div className="w-10 rounded-full">
                <img
                  alt="profile"
                  src="https://img.daisyui.com/images/profile/demo/kenobee@192.webp"
                />
              </div>
            </div>
            <div className="chat-header">
              {chat.role === "user" ? "You" : "AI model"}
              <time className="text-xs opacity-50 ml-2">12:45</time>
            </div>
            <div className="chat-bubble">{chat.text}</div>
          </div>
        ))}
        {isTyping && (
          <div className="chat chat-start">
            <div className="chat-image avatar">
              <div className="w-10 rounded-full">
                <img
                  alt="AI typing"
                  src="https://img.daisyui.com/images/profile/demo/kenobee@192.webp"
                />
              </div>
            </div>
            <div className="chat-header">
              AI model
              <time className="text-xs opacity-50 ml-2">12:45</time>
            </div>
            <div className="chat-bubble">Typing...</div>
          </div>
        )}
        <div ref={scrollRef}></div>
      </div>

      <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-3/4 flex items-center border border-gray-300 rounded-md px-3 py-2 bg-white shadow h-14 mb-2">
        <input
          type="text"
          placeholder="Type here"
          className="input w-full"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSend(message);
          }}
        />
        <button
          className="ml-2 text-blue-500 hover:text-blue-700"
          onClick={() => handleSend(message)}
        >
          <BsSendFill size={20} />
        </button>
      </div>
    </div>
  );
}

export default App;
