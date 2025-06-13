"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Upload, FileAudio } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface FileUploadProps {
  onFileUpload: (file: File) => void
}

export default function FileUpload({ onFileUpload }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = e.dataTransfer.files
    processFile(files[0])
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      processFile(files[0])
    }
  }

  const processFile = (file: File) => {
    if (!file) return

    // Check if the file is an audio file
    if (!file.type.startsWith("audio/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an audio file (.mp3, .wav, etc.)",
        variant: "destructive",
      })
      return
    }

    onFileUpload(file)
  }

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-8 text-center ${
        isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/20"
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex flex-col items-center gap-4">
        <div className="p-4 bg-primary/10 rounded-full">
          <FileAudio size={40} className="text-primary" />
        </div>

        <div>
          <h3 className="text-lg font-semibold">Upload Audio File</h3>
          <p className="text-muted-foreground mb-4">Drag and drop your audio file here, or click to browse</p>

          <Button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2">
            <Upload size={16} />
            Browse Files
          </Button>

          <input ref={fileInputRef} type="file" accept="audio/*" className="hidden" onChange={handleFileChange} />

          <p className="mt-4 text-sm text-muted-foreground">Supported formats: .mp3, .wav, and other audio formats</p>
        </div>
      </div>
    </div>
  )
}
