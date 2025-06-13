"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Play, Pause, Volume2, VolumeX, Redo as IconRedo, Reply as IconReply } from "lucide-react"
import { formatTime } from "@/lib/utils"

interface AudioPlayerProps {
  src: string
  onTimeUpdate: (time: number) => void
  initialTime?: number
}

export default function AudioPlayer({ src, onTimeUpdate, initialTime = 0 }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(initialTime)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const initialTimeApplied = useRef(false)
  const srcRef = useRef(src)

  // Reset state when src changes
  useEffect(() => {
    if (src !== srcRef.current) {
      srcRef.current = src
      initialTimeApplied.current = false
      setCurrentTime(initialTime)
    }
  }, [src, initialTime])

  // Handle initial time setting and audio events
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const setAudioData = () => {
      setDuration(audio.duration)

      // Apply initial time when metadata is loaded
      if (!initialTimeApplied.current && initialTime > 0) {
        audio.currentTime = initialTime
        setCurrentTime(initialTime)
        initialTimeApplied.current = true
      }
    }

    const updateTime = () => {
      setCurrentTime(audio.currentTime)
      onTimeUpdate(audio.currentTime)
    }

    const handlePlayState = () => {
      setIsPlaying(!audio.paused)
    }

    // Set up event listeners
    audio.addEventListener("loadedmetadata", setAudioData)
    audio.addEventListener("timeupdate", updateTime)
    audio.addEventListener("play", handlePlayState)
    audio.addEventListener("pause", handlePlayState)

    // Try to set initial time immediately if duration is available
    if (audio.duration && !initialTimeApplied.current && initialTime > 0) {
      audio.currentTime = initialTime
      setCurrentTime(initialTime)
      initialTimeApplied.current = true
    }

    return () => {
      audio.removeEventListener("loadedmetadata", setAudioData)
      audio.removeEventListener("timeupdate", updateTime)
      audio.removeEventListener("play", handlePlayState)
      audio.removeEventListener("pause", handlePlayState)
    }
  }, [onTimeUpdate, initialTime, src])

  // Effect to handle initialTime changes
  useEffect(() => {
    const audio = audioRef.current
    if (!audio || initialTimeApplied.current) return

    // If audio is already loaded but initialTime changed
    if (audio.readyState >= 2 && initialTime > 0) {
      audio.currentTime = initialTime
      setCurrentTime(initialTime)
      initialTimeApplied.current = true
    }
  }, [initialTime])

  const togglePlayPause = () => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
    } else {
      audio.play()
    }
  }

  const skipBackward = () => {
    const audio = audioRef.current
    if (!audio) return
    audio.currentTime = Math.max(0, audio.currentTime - 5)
  }

  const skipForward = () => {
    const audio = audioRef.current
    if (!audio) return
    audio.currentTime = Math.min(audio.duration, audio.currentTime + 5)
  }

  const handleTimeChange = (value: number[]) => {
    const audio = audioRef.current
    if (!audio) return

    const newTime = value[0]
    audio.currentTime = newTime
    setCurrentTime(newTime)
    onTimeUpdate(newTime)
  }

  const toggleMute = () => {
    const audio = audioRef.current
    if (!audio) return

    if (isMuted) {
      audio.volume = volume
      setIsMuted(false)
    } else {
      audio.volume = 0
      setIsMuted(true)
    }
  }

  const handleVolumeChange = (value: number[]) => {
    const audio = audioRef.current
    if (!audio) return

    const newVolume = value[0]
    audio.volume = newVolume
    setVolume(newVolume)

    if (newVolume === 0) {
      setIsMuted(true)
    } else if (isMuted) {
      setIsMuted(false)
    }
  }

  return (
    <div className="bg-card border rounded-lg p-4 shadow-sm">
      <audio ref={audioRef} src={src} preload="metadata" />

      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium w-12 text-right">{formatTime(currentTime)}</span>

          <Slider
            value={[currentTime]}
            min={0}
            max={duration || 100}
            step={0.1}
            onValueChange={handleTimeChange}
            className="flex-1"
            aria-label="Seek time"
          />

          <span className="text-sm font-medium w-12">{formatTime(duration)}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={skipBackward}
              aria-label="Skip backward 5 seconds"
              className="relative"
            >
             <IconReply/>
              
            </Button>

            <Button
              variant="default"
              size="icon"
              onClick={togglePlayPause}
              aria-label={isPlaying ? "Pause" : "Play"}
              className="h-10 w-10"
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={skipForward}
              aria-label="Skip forward 5 seconds"
              className="relative"
            >
               <IconRedo/>
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggleMute} aria-label={isMuted ? "Unmute" : "Mute"}>
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </Button>

            <Slider
              value={[isMuted ? 0 : volume]}
              min={0}
              max={1}
              step={0.01}
              onValueChange={handleVolumeChange}
              className="w-24"
              aria-label="Volume"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
