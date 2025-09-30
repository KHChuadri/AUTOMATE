import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { Buffer } from "buffer";

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
        (window as any).webkitAudioContext)({
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
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">WebSocket Test</h1>

        <div className="mb-6 p-4 bg-gray-800 rounded">
          <p className="text-sm text-gray-400">Connection Status:</p>
          <p
            className={`font-semibold ${
              isConnected ? "text-green-400" : "text-red-400"
            }`}
          >
            {isConnected ? "✓ Connected" : "✗ Disconnected"}
          </p>
        </div>

        <div className="mb-6 p-4 bg-gray-800 rounded">
          <p className="text-sm text-gray-400">Status:</p>
          <p className="font-semibold text-blue-400">{status}</p>
        </div>

        <div className="mb-6 flex gap-4">
          <button
            onClick={startListening}
            disabled={!isConnected || isListening}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded font-semibold"
          >
            Start Listening
          </button>

          <button
            onClick={stopListening}
            disabled={!isListening}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 rounded font-semibold"
          >
            Stop
          </button>
        </div>

        <div className="p-4 bg-gray-800 rounded">
          <h2 className="text-xl font-bold mb-4">Transcript:</h2>
          <div className="space-y-2">
            {transcript.length === 0 ? (
              <p className="text-gray-500 italic">No transcript yet...</p>
            ) : (
              transcript.map((text, i) => (
                <div key={i} className="p-3 bg-gray-700 rounded">
                  {text}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Record;
