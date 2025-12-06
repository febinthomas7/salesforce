import React, { useState, useEffect, useRef } from "react";
import {
  SendHorizonal,
  Volume2,
  Sparkles,
  MessageSquarePlus,
  Mic,
  MicOff,
  Loader2,
} from "lucide-react";

// A simple modal component to display messages
const MessageBox = ({ message, onClose }) => (
  <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-50">
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg max-w-sm w-full text-center">
      <p className="text-gray-900 dark:text-gray-100 mb-4">{message}</p>
      <button
        onClick={onClose}
        className="px-4 py-2 bg-[#5A9992] text-white rounded-lg hover:bg-[#4A817A] transition-colors"
      >
        OK
      </button>
    </div>
  </div>
);

// The main App component for the chatbot
const App = () => {
  // State to store chat messages
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hello! I can help answer your medical questions, but I'm not a medical professional. Always consult a qualified doctor for advice. What can I help you with today?",
    },
  ]);
  // State for the user's input message
  const [input, setInput] = useState("");
  // State to manage the loading/typing indicator for the bot
  const [isTyping, setIsTyping] = useState(false);
  // State to manage the recording status
  const [isRecording, setIsRecording] = useState(false);
  // State to manage the loading state for generating questions
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  // State for displaying a message box
  const [messageBox, setMessageBox] = useState({ visible: false, message: "" });

  // Ref for the chat messages container to enable auto-scrolling
  const messagesEndRef = useRef(null);
  // Ref for the SpeechRecognition object
  const recognitionRef = useRef(null);
  // State to track if an audio is currently playing
  const [playingAudioIndex, setPlayingAudioIndex] = useState(null);
  // State for suggested follow-up questions
  const [suggestedQuestions, setSuggestedQuestions] = useState([]);

  // Helper function to convert base64 to ArrayBuffer
  const base64ToArrayBuffer = (base64) => {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  };

  // Helper function to convert PCM audio data to WAV format
  const pcmToWav = (pcmData, sampleRate) => {
    const dataView = new DataView(new ArrayBuffer(44 + pcmData.byteLength));
    let offset = 0;

    // RIFF identifier
    dataView.setUint32(offset, 0x52494646, false);
    offset += 4;
    // file length
    dataView.setUint32(offset, 36 + pcmData.byteLength, true);
    offset += 4;
    // RIFF type
    dataView.setUint32(offset, 0x57415645, false);
    offset += 4;
    // format chunk identifier
    dataView.setUint32(offset, 0x666d7420, false);
    offset += 4;
    // format chunk length
    dataView.setUint32(offset, 16, true);
    offset += 4;
    // sample format (1 = PCM)
    dataView.setUint16(offset, 1, true);
    offset += 2;
    // channel count
    dataView.setUint16(offset, 1, true);
    offset += 2;
    // sample rate
    dataView.setUint32(offset, sampleRate, true);
    offset += 4;
    // byte rate (sample rate * block align)
    dataView.setUint32(offset, sampleRate * 2, true);
    offset += 4;
    // block align (channels * bytes per sample)
    dataView.setUint16(offset, 2, true);
    offset += 2;
    // bits per sample
    dataView.setUint16(offset, 16, true);
    offset += 2;
    // data chunk identifier
    dataView.setUint32(offset, 0x64617461, false);
    offset += 4;
    // data chunk length
    dataView.setUint32(offset, pcmData.byteLength, true);
    offset += 4;

    // Write the PCM data
    const pcm16 = new Int16Array(pcmData);
    for (let i = 0; i < pcm16.length; i++) {
      dataView.setInt16(offset, pcm16[i], true);
      offset += 2;
    }

    return new Blob([dataView], { type: "audio/wav" });
  };

  // useEffect hook to auto-scroll to the bottom of the chat on new messages or typing status changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Function to handle sending a message to the Gemini API
  const handleApiCall = async (
    prompt,
    modelName = import.meta.env.VITE_GEMINI_MODEL,
    conversationHistory = [],
    responseSchema = null
  ) => {
    let payload = {
      contents: [
        ...conversationHistory,
        { role: "user", parts: [{ text: prompt }] },
      ],
    };

    if (responseSchema) {
      payload.generationConfig = {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      };
    }

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

    let responseData = "Sorry, I couldn't get a response. Please try again.";
    let retryCount = 0;
    const maxRetries = 5;

    while (retryCount < maxRetries) {
      try {
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (response.status === 429) {
          const delay = Math.pow(2, retryCount) * 1000;
          console.warn(`Rate limited. Retrying in ${delay}ms...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
          retryCount++;
          continue;
        }

        if (!response.ok) {
          throw new Error(`API error: ${response.statusText}`);
        }

        const result = await response.json();
        const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          if (responseSchema) {
            try {
              responseData = JSON.parse(text);
            } catch (jsonError) {
              console.error("Failed to parse JSON response:", jsonError);
              responseData = text;
            }
          } else {
            responseData = text;
          }
        } else {
          console.error("API response structure is unexpected:", result);
        }
        return responseData;
      } catch (error) {
        console.error("Fetch error:", error);
        return "Sorry, there was an error processing your request.";
      }
    }
    return "Sorry, I couldn't get a response after multiple retries.";
  };

  // Function to send the current message and clear the input
  const sendMessage = async (messageText) => {
    const userMessage = { sender: "user", text: messageText };
    setMessages((currentMessages) => [...currentMessages, userMessage]);
    setInput("");
    setSuggestedQuestions([]);

    setIsTyping(true);

    const conversationHistory = messages.slice(1).map((msg) => ({
      role: msg.sender === "user" ? "user" : "model",
      parts: [{ text: msg.text }],
    }));

    const responseText = await handleApiCall(
      messageText,
      "gemini-2.5-flash",
      conversationHistory
    );
    setIsTyping(false);
    setMessages((currentMessages) => [
      ...currentMessages,
      { sender: "bot", text: responseText },
    ]);
  };

  // Function to handle sending a regular chat message
  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage(input);
  };

  // Function to handle summarizing the conversation
  const handleSummarize = async () => {
    if (messages.length <= 1) return;

    setIsTyping(true);

    const chatText = messages
      .slice(1)
      .map((msg) => `${msg.sender}: ${msg.text}`)
      .join("\n");
    const prompt = `Summarize the following medical-related conversation in a clear, concise paragraph. Focus on the main query and the provided information, without adding new medical advice:\n\n${chatText}`;

    const summaryText = await handleApiCall(prompt);
    setIsTyping(false);
    setMessages((currentMessages) => [
      ...currentMessages,
      { sender: "bot", text: `✨ **Summary:** ${summaryText}` },
    ]);
  };

  // Function to handle TTS for a bot message
  const handleSpeak = async (text, index) => {
    setPlayingAudioIndex(index);
    const audio = new Audio();

    audio.onended = () => setPlayingAudioIndex(null);
    audio.onerror = () => setPlayingAudioIndex(null);
    audio.onabort = () => setPlayingAudioIndex(null);

    const payload = {
      contents: [
        {
          parts: [{ text: text }],
        },
      ],
      generationConfig: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: "Kore" },
          },
        },
      },
      model: "gemini-2.5-flash",
    };

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    let audioBlob = null;
    let retryCount = 0;
    const maxRetries = 5;

    while (retryCount < maxRetries) {
      try {
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (response.status === 429) {
          const delay = Math.pow(2, retryCount) * 1000;
          console.warn(`TTS Rate limited. Retrying in ${delay}ms...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
          retryCount++;
          continue;
        }

        if (!response.ok) {
          throw new Error(`TTS API error: ${response.statusText}`);
        }

        const result = await response.json();
        const part = result?.candidates?.[0]?.content?.parts?.[0];
        const audioData = part?.inlineData?.data;
        const mimeType = part?.inlineData?.mimeType;

        if (audioData && mimeType && mimeType.startsWith("audio/")) {
          const sampleRate = parseInt(mimeType.match(/rate=(\d+)/)[1], 10);
          const pcmData = base64ToArrayBuffer(audioData);
          audioBlob = pcmToWav(pcmData, sampleRate);
          audio.src = URL.createObjectURL(audioBlob);
          audio.play();
          break;
        } else {
          console.error(
            "TTS response structure is unexpected or missing audio:",
            result
          );
          setPlayingAudioIndex(null);
          return;
        }
      } catch (error) {
        console.error("TTS Fetch error:", error);
        setPlayingAudioIndex(null);
        return;
      }
    }

    if (!audioBlob) {
      setPlayingAudioIndex(null);
      console.error("Failed to get audio data after retries.");
    }
  };

  // Function to generate follow-up questions
  const handleGenerateQuestions = async () => {
    if (messages.length <= 1) return;
    const lastBotMessage = messages[messages.length - 1].text;
    if (messages[messages.length - 1].sender !== "bot") {
      setSuggestedQuestions([]);
      return;
    }

    setIsGeneratingQuestions(true);

    const schema = {
      type: "ARRAY",
      items: {
        type: "STRING",
      },
    };
    const prompt = `Based on the following medical-related answer, generate 3 clear, concise, and helpful follow-up questions. The questions should be things a person might ask next. Return the questions as a JSON array of strings, without any extra text or formatting:\n\n"${lastBotMessage}"`;

    const questions = await handleApiCall(
      prompt,
      "gemini-2.5-flash",
      [],
      schema
    );
    setIsGeneratingQuestions(false);
    if (Array.isArray(questions)) {
      setSuggestedQuestions(questions);
    }
  };

  // Function to handle clicking on a suggested question
  const handleSuggestedQuestionClick = (question) => {
    setInput(question);
    sendMessage(question);
  };

  // Function to toggle speech recognition
  const toggleSpeechRecognition = () => {
    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      return;
    }

    if (!("webkitSpeechRecognition" in window)) {
      setMessageBox({
        visible: true,
        message:
          "Speech recognition is not supported by your browser. Please try Chrome.",
      });
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setIsRecording(true);
      setInput("");
      console.log("Speech recognition started.");
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
    };

    recognition.onend = () => {
      setIsRecording(false);
      console.log("Speech recognition ended.");
      if (input.trim() !== "") {
        sendMessage(input);
      }
    };

    recognition.onerror = (event) => {
      setIsRecording(false);
      console.error("Speech recognition error:", event.error);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  return (
    <div className="flex flex-col h-screen font-sans bg-gray-100 dark:bg-gray-950 text-gray-800 dark:text-gray-200 p-4">
      {messageBox.visible && (
        <MessageBox
          message={messageBox.message}
          onClose={() => setMessageBox({ visible: false, message: "" })}
        />
      )}

      {/* Disclaimer section */}
      <div className="bg-white text-red-600 p-3 rounded-xl mb-4 font-medium text-center">
        Disclaimer: This is an AI assistant and not a substitute for
        professional medical advice. Always consult a qualified healthcare
        provider.
      </div>

      {/* Main chat messages container */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {/* Message bubble */}
            <div
              className={`max-w-xs md:max-w-md lg:max-w-lg p-4 rounded-3xl ${
                message.sender === "user"
                  ? "bg-[#5A9992] text-white rounded-br-none shadow-md"
                  : "bg-[#D8EFEA] dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-none shadow-md"
              } flex items-start`}
            >
              <div className="flex-1">{message.text}</div>
              {/* TTS button for bot messages */}
              {message.sender === "bot" && (
                <button
                  onClick={() => handleSpeak(message.text, index)}
                  className="ml-2 p-2 rounded-full text-gray-600 dark:text-gray-300 hover:text-[#5A9992] hover:bg-[#D8EFEA] dark:hover:bg-gray-600 transition-colors duration-200"
                  disabled={isTyping || playingAudioIndex !== null}
                  aria-label="Read message aloud"
                >
                  <Volume2 size={20} />
                </button>
              )}
            </div>
          </div>
        ))}

        {/* Bot typing indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="max-w-xs md:max-w-md lg:max-w-lg p-4 bg-[#D8EFEA] dark:bg-gray-700 rounded-3xl rounded-bl-none">
              <div className="flex space-x-2">
                <div
                  className="w-2 h-2 bg-[#5A9992] rounded-full animate-wave-typing"
                  style={{ animationDelay: "0s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-[#5A9992] rounded-full animate-wave-typing"
                  style={{ animationDelay: "0.2s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-[#5A9992] rounded-full animate-wave-typing"
                  style={{ animationDelay: "0.4s" }}
                ></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested questions */}
      {suggestedQuestions.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2 justify-center">
          {suggestedQuestions.map((q, index) => (
            <button
              key={index}
              onClick={() => handleSuggestedQuestionClick(q)}
              className="px-4 py-2 bg-[#D8EFEA] dark:bg-gray-700 rounded-full text-sm font-medium hover:bg-[#C2E3DC] dark:hover:bg-gray-600 transition-colors duration-200"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input form and feature buttons */}
      <form onSubmit={handleSend} className="mt-4">
        <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 p-3 rounded-xl shadow-lg">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 p-2 rounded-xl border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#8FBEB9] dark:bg-gray-700 dark:text-white transition-all duration-300"
            placeholder={
              isRecording ? "Listening..." : "Type your medical query..."
            }
            disabled={isTyping || isRecording}
            aria-label="Medical query input"
          />
          <button
            type="button"
            onClick={toggleSpeechRecognition}
            className={`p-3 text-white rounded-xl transition-colors duration-300 disabled:bg-gray-400 ${
              isRecording
                ? "bg-red-500 hover:bg-red-600"
                : "bg-[#5A9992] hover:bg-[#4A817A]"
            }`}
            disabled={isTyping}
            title={isRecording ? "Stop voice input" : "Start voice input"}
            aria-label={isRecording ? "Stop voice input" : "Start voice input"}
          >
            {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
          </button>
          <button
            type="button"
            onClick={handleGenerateQuestions}
            className="p-3 bg-[#52998C] text-white rounded-xl hover:bg-[#4A817A] transition-colors duration-300 disabled:bg-[#8AB1AB] dark:disabled:bg-[#3D6964]"
            disabled={
              isTyping ||
              isGeneratingQuestions ||
              messages.length <= 1 ||
              messages[messages.length - 1].sender !== "bot"
            }
            title="Generate follow-up questions"
            aria-label="Generate follow-up questions"
          >
            {isGeneratingQuestions ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <MessageSquarePlus size={20} />
            )}
          </button>
          <button
            type="button"
            onClick={handleSummarize}
            className="p-3 bg-[#E37D57] text-white rounded-xl hover:bg-[#C96947] transition-colors duration-300 disabled:bg-[#F0A994] dark:disabled:bg-[#8D4A30]"
            disabled={isTyping || messages.length <= 1}
            title="Summarize conversation"
            aria-label="Summarize conversation"
          >
            <Sparkles size={20} />
          </button>
          <button
            type="submit"
            className="p-3 bg-[#5A9992] text-white rounded-xl hover:bg-[#4A817A] transition-colors duration-300 disabled:bg-[#8AB1AB] dark:disabled:bg-[#3D6964]"
            disabled={isTyping || !input.trim() || isRecording}
            title="Send message"
            aria-label="Send message"
          >
            <SendHorizonal size={20} />
          </button>
        </div>
      </form>
      <style>{`
        @keyframes wave-typing {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-50%);
          }
        }
        .animate-wave-typing {
          animation: wave-typing 1s infinite;
        }
      `}</style>
    </div>
  );
};

export default App;
