"use client"

import { useEffect, useRef } from "react"

export function VoiceBlob({ isListening, audioLevel = 0.5 }) {
  const canvasRef = useRef(null)
  const animationRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const setCanvasDimensions = () => {
      const dpr = window.devicePixelRatio || 1
      canvas.width = canvas.offsetWidth * dpr
      canvas.height = canvas.offsetHeight * dpr
      ctx.scale(dpr, dpr)
    }

    setCanvasDimensions()
    window.addEventListener("resize", setCanvasDimensions)

    const points = 12 
    const radius = 100
    const centerX = canvas.offsetWidth / 2
    const centerY = canvas.offsetHeight / 2
    let angle = 0
    let lastAudioLevel = 0 
    const pointsArray = []

    for (let i = 0; i < points; i++) {
      const pointAngle = (i * (2 * Math.PI)) / points
      pointsArray.push({
        x: centerX + radius * Math.cos(pointAngle),
        y: centerY + radius * Math.sin(pointAngle),
        originX: centerX + radius * Math.cos(pointAngle),
        originY: centerY + radius * Math.sin(pointAngle),
      })
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)

      angle += 0.01

      lastAudioLevel = lastAudioLevel * 0.95 + audioLevel * 0.05

      for (let i = 0; i < points; i++) {
        const point = pointsArray[i]
        const pointAngle = (i * (2 * Math.PI)) / points + angle


        const baseVariation = isListening ? 8 : 3
        const audioVariation = isListening ? lastAudioLevel * 25 : 0
        const totalVariation = baseVariation + audioVariation

        const noise = Math.sin(angle * 1.5 + i * 0.5) * totalVariation

        point.x = point.originX + noise * Math.cos(pointAngle)
        point.y = point.originY + noise * Math.sin(pointAngle)
      }

      ctx.beginPath()

      for (let i = 0; i < points; i++) {
        const currentPoint = pointsArray[i]
        const nextPoint = pointsArray[(i + 1) % points]
        const prevPoint = pointsArray[(i - 1 + points) % points]

        const cp1x = (currentPoint.x + nextPoint.x) * 0.5
        const cp1y = (currentPoint.y + nextPoint.y) * 0.5

        if (i === 0) {
          ctx.moveTo(cp1x, cp1y)
        } else {
          const cp0x = (currentPoint.x + prevPoint.x) * 0.5
          const cp0y = (currentPoint.y + prevPoint.y) * 0.5
          ctx.quadraticCurveTo(currentPoint.x, currentPoint.y, cp1x, cp1y)
        }
      }

      ctx.closePath()

      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius * 1.5)

      if (isListening) {
        gradient.addColorStop(0, `rgba(79, 70, 229, ${0.6 + lastAudioLevel * 0.2})`)
        gradient.addColorStop(1, `rgba(79, 70, 229, ${0.2 + lastAudioLevel * 0.1})`)
      } else {
        gradient.addColorStop(0, "rgba(79, 70, 229, 0.4)")
        gradient.addColorStop(1, "rgba(79, 70, 229, 0.1)")
      }

      ctx.fillStyle = gradient
      ctx.fill()

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", setCanvasDimensions)
      cancelAnimationFrame(animationRef.current)
    }
  }, [isListening, audioLevel])

  return <canvas ref={canvasRef} className="w-full h-full" aria-hidden="true" />
}

