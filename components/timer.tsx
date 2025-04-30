"use client"

import { useState, useEffect } from "react"
import { Clock } from "lucide-react"

interface TimerProps {
  isRunning?: boolean
}

const Timer = ({ isRunning = true }: TimerProps) => {
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined

    if (isRunning) {
      interval = setInterval(() => {
        setSeconds((prevSeconds) => prevSeconds + 1)
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning])

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60

    return [
      hours.toString().padStart(2, "0"),
      minutes.toString().padStart(2, "0"),
      seconds.toString().padStart(2, "0"),
    ].join(":")
  }

  return (
    <div className="flex items-center gap-2">
      <Clock className="h-5 w-5 text-primary" />
      <span className="font-mono text-lg">{formatTime(seconds)}</span>
    </div>
  )
}

export default Timer
