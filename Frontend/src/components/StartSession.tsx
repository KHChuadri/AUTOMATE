import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiPost } from "../lib/api";

interface ApiError {
  message?: string;
  error?: string;
}

const StartSession: React.FC = () => {
  const navigate = useNavigate();
  const [sessionName, setSessionName] = useState("");
  const [userId, setUserId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const authUser = localStorage.getItem("auth_user");

    if (authUser === null) {
      setError("Invalid session");
    } else {
      const parsedUserData = JSON.parse(authUser);
      setUserId(parsedUserData.id);
    }
  }, []);

  const handleStartSession = async () => {
    if (!sessionName) {
      setError("Session name required");
      return;
    }
    try {
      const response = await apiPost("/diagram/create", { title: sessionName, userId: userId });
      navigate("/dashboard");
      console.log("Session created:", response);
    } catch (err: unknown) {
      console.error("Error creating session:", err);
      setError((err as ApiError).message || "Failed to create session");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white">
              Start a New Session
            </h1>
          </div>
          <Link
            to="/dashboard"
            className="text-white/70 hover:text-white text-sm"
          >
            Back to Dashboard
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-6 md:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Session details */}
            <div className="lg:col-span-2 space-y-6">
              <div>  
                <label
                  htmlFor="sessionName"
                  className={`block text-sm font-medium text-white/80 mb-2`}
                >
                  Session name
                </label>
                {error && <p className="text-red-500">Session name is a required field</p>}
                <input
                  id="sessionName"
                  name="sessionName"
                  type="text"
                  placeholder="e.g., Login System Design"
                  onChange={(e) => setSessionName(e.target.value)}
                  className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${error ? `border-red-500` : `border-white/10`}`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Session mode
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <button className="p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left text-white transition-colors">
                    <div className="font-semibold">Audio + Diagram</div>
                    <div className="text-white/60 text-sm">
                      Transcribe and auto-generate diagrams
                    </div>
                  </button>
                  <button className="p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left text-white transition-colors">
                    <div className="font-semibold">Audio Only</div>
                    <div className="text-white/60 text-sm">
                      Live transcription without diagrams
                    </div>
                  </button>
                  <button className="p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left text-white transition-colors">
                    <div className="font-semibold">Manual Notes</div>
                    <div className="text-white/60 text-sm">
                      Take notes, generate later
                    </div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Technical focus (optional)
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Backend",
                    "Frontend",
                    "Database",
                    "Auth",
                    "DevOps",
                    "Architecture",
                  ].map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/80 text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Summary */}
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/70 text-sm">
                    Estimated duration
                  </span>
                  <span className="text-white font-medium">45–60 mins</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/70 text-sm">Capture</span>
                  <span className="text-white font-medium">
                    Audio + Entities
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/70 text-sm">Diagram</span>
                  <span className="text-white font-medium">Mermaid (auto)</span>
                </div>
              </div>

              <div className="space-y-2">
                <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105"
                onClick={() => handleStartSession()}>
                  Start Session
                </button>
                <button className="w-full bg-white/5 hover:bg-white/10 text-white py-3 px-4 rounded-xl border border-white/10 transition-colors">
                  Schedule for later
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Help section */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-white/80 text-sm">
            AutoScribe listens silently and turns your conversation into
            diagrams in real-time.
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-white/80 text-sm">
            You can export Mermaid syntax or images after the session.
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-white/80 text-sm">
            Add participants to share live diagrams and transcription.
          </div>
        </div>
      </div>
    </div>
  );
};

export default StartSession;
