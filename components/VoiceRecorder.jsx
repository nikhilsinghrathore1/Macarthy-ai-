"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import useSpeechToText from "react-hook-speech-to-text";
import { Mic } from "lucide-react";
import { chatSession, ConvertTextToSpeech } from "@/services/Aimodel";

const VoiceRecorder = () => {
  const [userAnswer, setUserAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState("");
  const [audioURL, setAudioURL] = useState(null);
  const [isConversing, setIsConversing] = useState(false);

  const {
    interimResult,
    isRecording,
    results,
    setResults,
    startSpeechToText,
    stopSpeechToText,
  } = useSpeechToText({
    continuous: true,
    useLegacyResults: false,
  });

  const checkWalletConnection = async () => {
    try {
      if (!window.arweaveWallet) {
        alert("No Arconnect detected");
        return;
      }
      await window.arweaveWallet.connect(
        ["ACCESS_ADDRESS", "SIGN_TRANSACTION", "ACCESS_TOKENS"],
        {
          name: "Anon",
          logo: "https://arweave.net/jAvd7Z1CBd8gVF2D6ESj7SMCCUYxDX_z3vpp5aHdaYk",
        },
        {
          host: "g8way.io",
          port: 443,
          protocol: "https",
        }
      );
      return true
    } catch (error) {
      console.error(error);
      return false
    } finally {
      console.log("connection finished execution");
    }
  };

  const toggleRecording = async () => {
    const isWalletConnected = await checkWalletConnection();
    if (!isWalletConnected) return;

    if (!isRecording) {
      setIsConversing(true);
      startSpeechToText();
    } else {
      setIsConversing(false);
      stopSpeechToText();
      setResults([]);
    }
  };

  useEffect(() => {
    if (results.length > 0) {
      const latestTranscript = results.map((res) => res.transcript).join(" ");
      setUserAnswer(latestTranscript);
    }
  }, [results]);

  useEffect(() => {
    if (userAnswer.trim() && isConversing) {
      handleGenerateText(userAnswer);
    }
  }, [userAnswer]);

  const handleGenerateText = async (text) => {
    if (!text.trim() || !isConversing) return;
    setLoading(true);
    try {
      const result = await chatSession.sendMessage(text);
      const responseText = result.response.text();
      const url = await ConvertTextToSpeech(responseText, "Joanna");
      setResults([]);
      setAudioURL(url);
      setAiResponse(responseText);
    } catch (error) {
      console.error("Error generating AI response:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full p-10 flex h-screen items-start pt-10 gap-4 justify-center">
      <div className="w-[70%] gap-5 h-[100%] flex flex-col items-start">
        <h2 className="text-xl font-bold">Conversational Ai</h2>
        <div className="w-full h-full bg-[#F5F5F5] rounded-2xl relative items-center justify-center flex border">
          <div className="text-center animate-pulse">
            <div className="w-24 h-24 rounded-full overflow-hidden">
              <img
                className="w-full h-full object-cover"
                src="https://ankush.one/pfp.png"
                alt="not showing"
              />
              <audio
                src={audioURL}
                type="audio/mp3"
                autoPlay
                onEnded={() => isConversing && startSpeechToText()}
              />
            </div>
            <h1>Guy</h1>
          </div>
        </div>
        <div className="w-full flex items-center justify-center">
          <Button
            disabled={loading}
            onClick={toggleRecording}
            variant="outline"
          >
            {isConversing ? (
              <h2 className="text-red-500 flex gap-1 items-center">
                <Mic /> Disconnect
              </h2>
            ) : (
              "Connect"
            )}
          </Button>
        </div>
        <div className="w-full h-32 border rounded-2xl p-2">
          {loading ? "Generating response..." : aiResponse}
        </div>
        {interimResult}
      </div>
    </div>
  );
};

export default VoiceRecorder;
