import { useEffect, useState, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { Buffer } from "buffer";
import mermaid from "mermaid";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import PQueue from "p-queue";
import { debounce } from "lodash";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

interface PromptHistoryItem {
  created_at: string;
  diagramId: string;
  prompt: string;
  mermaidjs: string;
}

interface PromptHistoryResponse {
  success: boolean;
  message: string;
  history: PromptHistoryItem[];
}

interface DiagramPair {
  prompt: string;
  diagram: string;
  createdAt?: string;
}

function Record() {
  const { id } = useParams<{ id: string }>();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [status, setStatus] = useState("Disconnected");
  const [transcript, setTranscript] = useState<string[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const [diagramId] = useState(() => {
    return id || localStorage.getItem("diagramId") || `diagram_${Date.now()}`;
  });

  const [diagramPairs, setDiagramPairs] = useState<DiagramPair[]>([]);
  const diagramPairsRef = useRef<DiagramPair[]>([]);

  // Debug: Track diagramPairs changes
  useEffect(() => {
    console.log("diagramPairs state updated:", diagramPairs);
    diagramPairsRef.current = diagramPairs;
  }, [diagramPairs]);
  const [currentDiagram, setCurrentDiagram] = useState(`graph TD
    A[Start Recording] --> B[Speak Your Prompt]
    B --> C[AI Processes Audio]
    C --> D[Generate Mermaid Diagram]
    D --> E[Display Result]
    E --> F{More Diagrams?}
    F -->|Yes| B
    F -->|No| G[End Session]`);

  const isListeningRef = useRef(false);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const mermaidRef = useRef<HTMLDivElement>(null);

  const aiQueue = useRef(new PQueue({ concurrency: 1 }));
  const accumulatedText = useRef<string[]>([]);

  const fetchPromptHistory = async (
    diagramId: string
  ): Promise<PromptHistoryResponse> => {
    try {
      const response = await axios.post<PromptHistoryResponse>(
        `${API_BASE_URL}/diagram/history/fetch`,
        { diagramId }
      );

      return response.data;
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        throw new Error(
          err.response?.data?.error || "Failed to fetch prompt history"
        );
      }
      throw new Error("An unexpected error occurred");
    }
  };

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["history", diagramId],
    queryFn: () => {
      return fetchPromptHistory(diagramId);
    },
    enabled: !!diagramId,
  });

  // Update diagramPairs when data is fetched
  useEffect(() => {
    if (data?.success) {
      if (data.history && data.history.length > 0) {
        setDiagramPairs(
          data.history.map((item) => ({
            prompt: item.prompt,
            diagram: item.mermaidjs,
            createdAt: item.created_at,
          }))
        );
      } else {
        setDiagramPairs([]);
      }
    }
  }, [data]);

  const generateDiagram = async (prompt: string): Promise<string> => {
    console.log("generateDiagram called, lastDiagram", diagramPairsRef.current);
    try {
      // Get the last diagram from history to provide context
      const lastDiagram =
        diagramPairsRef.current.length > 0
          ? diagramPairsRef.current[0].diagram
          : null;

      if (lastDiagram) {
        console.log("Using previous diagram as context for iterative building");
      } else {
        console.log("Creating new diagram from scratch");
      }

      const response = await axios.post(
        `${API_BASE_URL}/diagram/generate-diagram`,
        {
          prompt,
          diagramId,
          previousDiagram: lastDiagram,
        }
      );

      if (response.data.success && response.data.mermaidCode) {
        console.log("OpenAI Response:", response.data.mermaidCode);
        return response.data.mermaidCode;
      }
      throw new Error("Failed to generate diagram");
    } catch (error) {
      console.error("Error generating diagram:", error);
      throw error;
    }
  };

  const processAccumulatedText = useCallback(() => {
    console.log("processAccumulatedText called");
    if (accumulatedText.current.length === 0) return;
    console.log("accumulatedText is not 0 in length");
    
    const fullContext = accumulatedText.current.join(" ");
    const promptToProcess = fullContext;
    accumulatedText.current = [];

    aiQueue.current.add(async () => {
      setIsProcessing(true);
      const hasContext = diagramPairsRef.current.length > 0;
      setStatus(hasContext ? "Generating diagram with context..." : "Generating diagram...");

      try {
        const mermaidCode = await generateDiagram(promptToProcess);
        setCurrentDiagram(mermaidCode);
        await saveDiagramHistory(promptToProcess, mermaidCode);
        setStatus("Diagram generated!");
      } catch (error) {
        console.error("Failed to generate diagram:", error);
        setStatus("Failed to generate diagram");
      } finally {
        setIsProcessing(false);
        setTimeout(() => {
          setStatus((prev) => {
            // Use functional update to avoid dependency on isListening
            return isListeningRef.current ? "Listening..." : "Connected";
          });
        }, 2000);
      }
    });
  }, []);

  const debouncedProcessRef = useRef<{ (): void; cancel(): void; flush(): void } | null>(null);

  // Initialize debounce function once and keep it stable
  useEffect(() => {
    // Only create if it doesn't exist
    if (!debouncedProcessRef.current) {
      debouncedProcessRef.current = debounce(() => {
        console.log("Debounced process triggered - processing accumulated text");
        processAccumulatedText();
      }, 5000); // Increased to 5 seconds for natural speech pauses
    }
    
    return () => {
      debouncedProcessRef.current?.cancel();
    };
  }, []); // Empty dependency array - only run once

  // Save diagram history - use useCallback to memoize
  const saveDiagramHistory = useCallback(
    async (prompt: string, mermaidjs: string) => {
      try {
        const response = await axios.post(
          `${API_BASE_URL}/diagram/history/create`,
          {
            diagramId,
            prompt,
            mermaidjs,
          }
        );

        if (response.data.success) {
          console.log("Diagram history saved:", response.data);
          console.log("Calling refetch to update history...");
          refetch();
        } else {
          console.error("Failed to save diagram history:", response.data.error);
        }
      } catch (error) {
        console.error("Error saving diagram history:", error);
      }
    },
    [diagramId, refetch]
  );

  /**
   * Initialize mermaid and localStorage
   */
  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: "default",
      securityLevel: "loose",
      fontFamily: "ui-sans-serif, system-ui, sans-serif",
    });

    if (diagramId) {
      localStorage.setItem("diagramId", diagramId);
    }
  }, [diagramId]);

  /**
   * Render diagram
   */
  useEffect(() => {
    const renderDiagram = async () => {
      if (mermaidRef.current) {
        try {
          mermaidRef.current.innerHTML = currentDiagram;
          mermaidRef.current.removeAttribute("data-processed");
          await mermaid.run({
            nodes: [mermaidRef.current],
          });
        } catch (error) {
          console.error("Mermaid rendering error:", error);
          mermaidRef.current.innerHTML = `<div class="text-red-600 p-4">Error rendering diagram. Please check the syntax.</div>`;
        }
      }
    };

    renderDiagram();
  }, [currentDiagram]);

  /**
   * Socket connection
   */
  useEffect(() => {
    const newSocket = io(API_BASE_URL);
    setSocket(newSocket);

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

      if (data.text) {
        accumulatedText.current.push(data.text);
        debouncedProcessRef.current?.(); // Safe call with null check
      }
    });

    newSocket.on("partial-transcript", (data) => {
      console.log("Partial:", data.text);
      setStatus(`Hearing: "${data.text.slice(0, 50)}..."`);
    });

    return () => {
      newSocket.close();
      debouncedProcessRef.current?.cancel();
    };
  }, []); 

  const startListening = async () => {
    if (!socket) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      streamRef.current = stream;

      const audioContext = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext)({
        sampleRate: 16000,
      });
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      source.connect(processor);
      processor.connect(audioContext.destination);

      isListeningRef.current = true;

      processor.onaudioprocess = (e) => {
        if (!isListeningRef.current) return;

        const inputData = e.inputBuffer.getChannelData(0);
        const int16Data = new Int16Array(inputData.length);

        for (let i = 0; i < inputData.length; i++) {
          const s = Math.max(-1, Math.min(1, inputData[i]));
          int16Data[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
        }

        socket.emit("audio-data", Buffer.from(int16Data.buffer));
      };

      socket.emit("start-stream");
      setIsListening(true);
      setTranscript([]);
    } catch (error) {
      console.error("Mic error:", error);
      setStatus("Microphone access denied");
    }
  };

  const stopListening = () => {
    isListeningRef.current = false;

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
    
    // Process any remaining text immediately when stopping
    debouncedProcessRef.current?.flush();
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-80" : "w-0"
        } transition-all duration-300 bg-white border-r border-gray-200 overflow-hidden flex flex-col`}
      >
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
          <h2 className="text-lg font-bold text-gray-800 flex items-center">
            <svg
              className="w-5 h-5 mr-2 text-purple-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Prompt History
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {isLoading ? (
            <div className="text-center py-4 text-gray-500">
              Loading history...
            </div>
          ) : diagramPairs.length > 0 ? (
            diagramPairs.map((pair, index) => (
              <div
                key={index}
                onClick={() => setCurrentDiagram(pair.diagram)}
                className="p-3 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg border border-purple-100 hover:border-purple-300 cursor-pointer transition-all hover:shadow-md"
              >
                <p className="text-sm font-semibold text-gray-800 mb-2">
                  {pair.prompt}
                </p>
                <pre className="text-xs text-gray-600 bg-white/50 p-2 rounded overflow-hidden whitespace-nowrap overflow-ellipsis">
                  {pair.diagram.split("\n")[0]}...
                </pre>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-gray-500">No history yet</div>
          )}
        </div>
      </div>

      {/* Rest of the component remains the same */}
      {/* Toggle Sidebar Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="absolute left-0 top-1/2 -translate-y-1/2 bg-white border border-gray-200 rounded-r-lg p-2 shadow-lg hover:bg-gray-50 z-10 transition-all"
        style={{ left: sidebarOpen ? "320px" : "0" }}
      >
        <svg
          className={`w-5 h-5 text-gray-600 transition-transform ${
            sidebarOpen ? "" : "rotate-180"
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      {/* Main Content - same as before */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-white border-b border-gray-200 p-4 shadow-sm">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                AutoScribe Diagram Generator
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Voice-to-diagram in real-time
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 px-3 py-2 bg-gray-50 rounded-lg">
                <div
                  className={`w-2 h-2 rounded-full ${
                    isConnected ? "bg-green-500" : "bg-red-500"
                  }`}
                ></div>
                <span className="text-xs font-medium text-gray-600">
                  {isConnected ? "Connected" : "Disconnected"}
                </span>
              </div>

              <div className="flex items-center space-x-2 px-3 py-2 bg-gray-50 rounded-lg">
                <div
                  className={`w-2 h-2 rounded-full ${
                    isListening ? "bg-blue-500 animate-pulse" : "bg-gray-400"
                  }`}
                ></div>
                <span className="text-xs font-medium text-gray-600 max-w-xs truncate">
                  {status}
                </span>
              </div>

              <button
                onClick={startListening}
                disabled={!isConnected || isListening}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed flex items-center"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                  />
                </svg>
                {isListening ? "Recording..." : "Record"}
              </button>

              <button
                onClick={stopListening}
                disabled={!isListening}
                className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed flex items-center"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
                  />
                </svg>
                Stop
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 min-h-[600px]">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800 flex items-center">
                  <svg
                    className="w-6 h-6 mr-2 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                  Generated Diagram
                </h2>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors">
                    Export
                  </button>
                  <button className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors">
                    Edit
                  </button>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-8 border border-blue-100 flex items-center justify-center min-h-[400px]">
                <div ref={mermaidRef} className="mermaid">
                  {currentDiagram}
                </div>
              </div>

              <div className="flex items-center space-x-2 px-3 py-2 bg-gray-50 rounded-lg">
                <div
                  className={`w-2 h-2 rounded-full ${
                    isProcessing
                      ? "bg-yellow-500 animate-pulse"
                      : isListening
                      ? "bg-blue-500 animate-pulse"
                      : "bg-gray-400"
                  }`}
                ></div>
                <span className="text-xs font-medium text-gray-600 max-w-xs truncate">
                  {status}
                </span>
              </div>

              {isListening && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800 flex items-center">
                    <svg
                      className="w-4 h-4 mr-2 animate-pulse"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <circle cx="12" cy="12" r="10" />
                    </svg>
                    Listening for your diagram prompt...
                  </p>
                </div>
              )}
              {transcript.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h3 className="text-sm font-bold text-gray-700 mb-2">
                    Current Session
                  </h3>
                  {transcript.map((text, i) => (
                    <div
                      key={i}
                      className="mb-2 p-2 bg-blue-50 rounded text-xs text-gray-700"
                    >
                      {text}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Record;
