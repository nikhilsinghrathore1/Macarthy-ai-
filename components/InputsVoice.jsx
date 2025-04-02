"use client"

import { useState, useEffect, useRef } from "react"
import { Mic, MicOff, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { VoiceBlob } from "./voice-blob"



export function InputsVoice({ onTranscript, isProcessing }) {
  const [isListening, setIsListening] = useState(false)
  const [audioLevel, setAudioLevel] = useState(0)


  return (
    <div className="relative flex flex-col items-center justify-center">
      <div className="w-64 h-64 relative">
        <VoiceBlob isListening={isListening} audioLevel={audioLevel} />
      </div>

      <div className="absolute bottom-0 mb-4">
        <Button
          size="lg"
          variant={isListening ? "destructive" : "default"}
          className="rounded-full w-16 h-16 shadow-lg"
          disabled={isProcessing}
        >
          {isProcessing ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : isListening ? (
            <MicOff className="h-6 w-6" />
          ) : (
            <Mic className="h-6 w-6" />
          )}
        </Button>
      </div>
    </div>
  )
}

