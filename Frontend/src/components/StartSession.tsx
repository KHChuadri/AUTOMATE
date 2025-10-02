import React, { useEffect, useState } from "react";
import { apiPost } from "../lib/api";
import { useNavigate } from "react-router-dom";

interface ApiError {
  message?: string;
  error?: string;
}

interface StartSessionModalProps {
  setCreate: React.Dispatch<React.SetStateAction<boolean>>;
  onSuccess: () => void;
}

const StartSessionModal:  React.FC<StartSessionModalProps> = ({ setCreate, onSuccess }) => {
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
      await apiPost("/diagram/create", { title: sessionName, userId: userId });
      onSuccess();
      setCreate(false)
    } catch (err: unknown) {
      console.error("Error creating session:", err);
      setError((err as ApiError).message || "Failed to create session");
    }
  };

  return (
    <div className="bg-white border border-gray-200 w-1/3 rounded-xl flex flex-col">  
        <div className="flex flex-col rounded-2xl shadow-2xl border border-white/20 p-4 md:p-6">
          <div className="grid grid-cols-1 gap-3">
            <h2 className="text-black text-2xl font-semibold">Create new session</h2>
            <div className="lg:col-span-2 space-y-3">
              <div>  
                <label
                  htmlFor="sessionName"
                  className={`block text-sm font-medium text-black mb-2`}
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
                  className={`w-full px-4 py-3 bg-white/5 border-2 rounded-xl text-black placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${error ? `border-red-500` : `border-gray-200`}`}
                />
              </div>

              <p className="text-gray-600 text-sm">Transcribe and auto-generate diagrams</p>
            </div>

            <div className="space-y-4">
              <button 
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105"
                onClick={() => { handleStartSession(); setCreate(false) }}
              >
                Start Session
              </button>
              <button
                className="w-full text-gray-800 font-semibold py-3 px-4 rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105 border border-gray-200"
                onClick={() => { navigate('/dashboard'); setCreate(false) }}
              >
                Cancel
              </button>
            </div>
          </div>

        </div>
    </div>
  );
};

export default StartSessionModal;
