"use client";

import React, { useState, useEffect } from "react";
import { VoiceBlob } from "./Voice-blob";
import { Textarea } from "./ui/textarea";
import { Mic } from "lucide-react";
import {
  spawn,
  message,
  createDataItemSigner,
  createSigner,
  dryrun,
} from "@permaweb/aoconnect";
import { Button } from "@/components/ui/button";
import useSpeechToText from "react-hook-speech-to-text";
import { chatSession, ConvertTextToSpeech } from "@/services/Aimodel";
import { InputsVoice } from "./InputsVoice";

const NewVoiceUi = () => {
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

  const [isListening, setIsListening] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [isConversing, setIsConversing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const [aiResponse, setAiResponse] = useState("");
  const [walletAddress, setWalletAddress] = useState(null);
  const [pId, setPId] = useState(null);

  const checkWalletConnection = async () => {
    try {
      if (!window.arweaveWallet) {
        alert("No Arconnect detected");
        return false;
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
      const address = await window.arweaveWallet.getActiveAddress();
      setWalletAddress(address);
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  };
  const CommonTags = [
    { name: "Name", value: "Anon" },
    { name: "Version", value: "0.2.1" },
  ];

  const retreiveMsg = async () => {
    console.log("clicked");
    try {
      console.log("retrieving data");
      if (pId) {
        const result = await dryrun({
          process: "OrTW5vBgh9EaaaFbbroKjAGWrJw3RGgb4JzsYrcBOEk",
          data: "",
          tags: [{ name: "Action", value: "Balance" }],
        });
        console.log(result);
      }
    } catch (err) {
      console.log("something went wrong", err);
    }
  };

  const messageAR = async ({ tags = [], data, anchor = "", process }) => {
    try {
      if (!process) throw new Error("Process ID is required.");
      if (!data) throw new Error("Data is required.");

      const allTags = [...CommonTags, ...tags];
      const messageId = await message({
        data,
        anchor,
        process,
        tags: allTags,
        signer: createDataItemSigner(globalThis.arweaveWallet),
      });
      return messageId;
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  };

  const spawnProcess = async () => {
    try {
      const allTags = [...CommonTags];

      console.log(allTags);

      const processId = await spawn({
        module: "Do_Uc2Sju_ffp6Ev0AnLVdPtot15rvMjP-a9VVaA5fM",
        scheduler: "_GQ33BkPtZrqxA84vM8Zk-N2aO0toNNu_C-l-rawrBA",
        signer: createDataItemSigner(window.arweaveWallet),
        tags: allTags,
      });
      console.log(processId);
      setPId(processId);
      return processId;
    } catch (error) {
      console.error("Error spawning process:", error);
      throw error;
    }
  };

  const sendMessage = async () => {
    const newMessageItem = {
      id: Date.now(),
      text: userAnswer,
    };
    console.log(pId);
    console.log(newMessageItem);

    if (pId) {
      try {
        await messageAR({
          process: pId,
          data: JSON.stringify({ type: "message", message: newMessageItem }),
          tags: [{ name: "Action", value: "SendMessage" }],
        });

        alert("msg sended to arweave");
      } catch (error) {
        console.error("Error sending message:", error);
      }
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

  const beginRecording = ()=>{
    if(!isConversing){
      startSpeechToText()
    }
  }

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
      const responseText = await result.response.text();
      console.log(responseText);
      const url = await ConvertTextToSpeech(responseText, "Joanna");
      console.log(url);
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
    <div className="w-full h-screen overflow-hidden bg-gradient-to-br ">
      {/* Navbar */}
      <div className="w-full h-[9%] px-16 shadow-xs shadow-black/30 flex items-center justify-between">
        <h1>A0 Bot</h1>
        <div className="flex gap-3">
          {walletAddress ? (
            <span className="text-white bg-black px-4 py-2 rounded">
              {walletAddress.substring(0, 7)}...
            </span>
          ) : (
            <Button className="bg-blue-600" onClick={checkWalletConnection}>
              Connect Wallet
            </Button>
          )}
          {pId ? (
            <span className="text-white bg-black px-4 py-2 rounded">{pId}</span>
          ) : (
            <Button className="bg-blue-600" onClick={spawnProcess}>
              Spawn process
            </Button>
          )}

          <Button onClick={retreiveMsg}>get data</Button>
        </div>
      </div>
      <audio
        src={audioURL}
        type="audio/mp3"
        autoPlay
        onEnded={beginRecording}
      />

      {/* Voice Blob Display */}
      <div className="w-full flex items-center mb-10 justify-center h-[70%] ">
        <InputsVoice />
      </div>
      {/* Chat Input */}
      <div className="w-full h-[10%] border-t pt-10 dark:border-gray-800 bg-white dark:bg-gray-950 p-4">
        <form
          onSubmit={(e) => e.preventDefault()}
          className="flex gap-2 max-w-4xl mx-auto"
        >
          <div className="relative flex-1">
            <Textarea
              placeholder="Type a message..."
              className="resize-none pr-12 py-3 min-h-[52px] max-h-[200px]"
              value={interimResult}
              onChange={(e) => setUserAnswer(e.target.value)}
            />
            <div className="absolute right-2 bottom-2 flex gap-2">
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={toggleRecording}
              >
                <Mic className="h-4 w-4" />
              </Button>
              <Button
                onClick={sendMessage}
                className="h-fit bg-red-500 w-fit px-5 py-2"
              >
                Send Ao
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewVoiceUi;
