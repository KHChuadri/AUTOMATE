import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { Buffer } from "buffer";
import Navbar from "./Navbar";

function Record() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [status, setStatus] = useState("Disconnected");
  const [transcript, setTranscript] = useState<string[]>([]);
  const [isListening, setIsListening] = useState(false);

  // Add refs to track state immediately
  const isListeningRef = useRef(false);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);

  useEffect(() => {
    const newSocket = io("http://localhost:3001");
    setSocket(newSocket);
    console.log("test");

    newSocket.on("connect", () => {
      console.log("Connected to server!");
      setIsConnected(true);
      setStatus("Connected");
    });

    newSocket.on("status", (data) => {
      console.log("Status:", data.message);
      setStatus(data.message);
    });

    newSocket.on("transcript", (data) => {
      console.log("Transcript:", data.text);
      setTranscript((prev) => [...prev, data.text]);
    });

    newSocket.on("partial-transcript", (data) => {
      console.log("Partial:", data.text);
      setStatus(`Hearing: "${data.text.slice(0, 50)}..."`);
    });

    return () => {
      newSocket.close();
    };
  }, []);

  const startListening = async () => {
    if (!socket) return;

    try {
      // Request microphone
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      streamRef.current = stream;

      // Create audio context
      const audioContext = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)({
          sampleRate: 16000,
        });
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      source.connect(processor);
      processor.connect(audioContext.destination);

      // Set ref BEFORE setting up the callback
      isListeningRef.current = true;

      // Process audio
      processor.onaudioprocess = (e) => {
        // Use ref instead of state
        if (!isListeningRef.current) return;

        const inputData = e.inputBuffer.getChannelData(0);
        const int16Data = new Int16Array(inputData.length);

        for (let i = 0; i < inputData.length; i++) {
          const s = Math.max(-1, Math.min(1, inputData[i]));
          int16Data[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
        }

        socket.emit("audio-data", Buffer.from(int16Data.buffer));
      };

      // Tell server to start
      socket.emit("start-stream");
      setIsListening(true);
      setTranscript([]);
    } catch (error) {
      console.error("Mic error:", error);
      setStatus("Microphone access denied");
    }
  };

  const stopListening = () => {
    // Update ref immediately
    isListeningRef.current = false;

    // Cleanup audio resources
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (socket) {
      socket.emit("stop-stream");
    }

    setIsListening(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Navbar>
        {/* Main Content */}
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold bg-gradient-to-br from-gray-900 to-purple-600 bg-clip-text text-transparent mb-4">
              Live Recording Session
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Start recording to capture and transcribe your conversation in real-time
            </p>
          </div>

          {/* Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center space-x-3 mb-2">
                <div className={`w-3 h-3 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`}></div>
                <h3 className="text-lg font-semibold text-gray-900">Connection Status</h3>
              </div>
              <p className={`text-sm font-medium ${isConnected ? "text-green-600" : "text-red-600"}`}>
                {isConnected ? "✓ Connected to server" : "✗ Disconnected"}
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center space-x-3 mb-2">
                <div className={`w-3 h-3 rounded-full ${isListening ? "bg-blue-500 animate-pulse" : "bg-gray-400"}`}></div>
                <h3 className="text-lg font-semibold text-gray-900">Recording Status</h3>
              </div>
              <p className="text-sm font-medium text-blue-600">{status}</p>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <button
              onClick={startListening}
              disabled={!isConnected || isListening}
              className="group bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 px-8 rounded-2xl shadow-2xl transition-all duration-300 transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed"
            >
              <span className="flex items-center justify-center">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
                {isListening ? "Recording..." : "Start Recording"}
              </span>
            </button>

            <button
              onClick={stopListening}
              disabled={!isListening}
              className="group bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 px-8 rounded-2xl shadow-2xl transition-all duration-300 transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed"
            >
              <span className="flex items-center justify-center">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                </svg>
                Stop Recording
              </span>
            </button>
          </div>

          {/* Transcript Section */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-100 to-purple-200 px-6 py-4 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-800 flex items-center">
                <svg className="w-6 h-6 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Live Transcript
              </h3>
            </div>
            <div className="p-6 max-h-96 overflow-y-auto">
              {transcript.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                  <p className="text-gray-500 text-lg">No transcript yet...</p>
                  <p className="text-gray-400 text-sm mt-2">Start recording to see your conversation transcribed here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {transcript.map((text, i) => (
                    <div key={i} className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-100 shadow-sm">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                          {i + 1}
                        </div>
                        <p className="text-gray-800 leading-relaxed">{text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </Navbar>
    </div>
  );
}

export default Record;
