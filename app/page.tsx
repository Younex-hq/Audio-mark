"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import AudioPlayer from "@/components/audio-player"
import TimedMarks from "@/components/timed-marks"
import GeneralMarks from "@/components/general-marks"
import FileUpload from "@/components/file-upload"
import FileTitle from "@/components/file-title"
import ConfirmationDialog from "@/components/confirmation-dialog"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { Download, Upload, FilePlus, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export type TimedMark = {
  id: string
  timestamp: number
  text: string
}

export type AudioData = {
  fileName: string
  fileUrl: string
  timedMarks: TimedMark[]
  generalMarks: string
  lastPosition: number
}

export default function Home() {
  const [audioData, setAudioData] = useState<AudioData | null>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false)
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load data from local storage on initial render
  useEffect(() => {
    const savedData = localStorage.getItem("audioMarks")
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData)

        // Handle legacy data format (timedNotes -> timedMarks, generalNotes -> generalMarks)
        const updatedData = {
          ...parsedData,
          timedMarks: parsedData.timedMarks || parsedData.timedNotes || [],
          generalMarks: parsedData.generalMarks || parsedData.generalNotes || "",
        }

        setAudioData(updatedData)
        // Initialize currentTime with the saved position
        if (updatedData.lastPosition) {
          setCurrentTime(updatedData.lastPosition)
        }
      } catch (error) {
        console.error("Failed to parse saved data:", error)
      }
    }
  }, [])

  // Save data to local storage whenever it changes
  useEffect(() => {
    if (audioData) {
      localStorage.setItem("audioMarks", JSON.stringify(audioData))
    }
  }, [audioData])

  // Update lastPosition when currentTime changes (debounced to avoid excessive updates)
  useEffect(() => {
    if (!audioData || currentTime === 0) return

    const timeoutId = setTimeout(() => {
      setAudioData((prev) => {
        if (!prev) return null
        return {
          ...prev,
          lastPosition: currentTime,
        }
      })
    }, 1000) // Update lastPosition after 1 second of stable currentTime

    return () => clearTimeout(timeoutId)
  }, [currentTime])

  // Save position before unloading the page
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (audioData) {
        const updatedData = {
          ...audioData,
          lastPosition: currentTime,
        }
        localStorage.setItem("audioMarks", JSON.stringify(updatedData))
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [audioData, currentTime])

  const handleFileUpload = (file: File) => {
    const fileUrl = URL.createObjectURL(file)

    // Check if we have saved data for this file
    const savedData = localStorage.getItem("audioMarks")
    if (savedData) {
      const parsedData = JSON.parse(savedData)
      if (parsedData.fileName === file.name) {
        // Handle legacy data format
        const timedMarks = parsedData.timedMarks || parsedData.timedNotes || []
        const generalMarks = parsedData.generalMarks || parsedData.generalNotes || ""

        const updatedData = {
          ...parsedData,
          fileUrl,
          timedMarks,
          generalMarks,
        }

        setAudioData(updatedData)
        // Set the current time to the saved position
        if (updatedData.lastPosition) {
          setCurrentTime(updatedData.lastPosition)
        }
        toast({
          title: "Previous marks loaded",
          description: "Your marks for this file have been restored.",
        })
        return
      }
    }

    // Create new data for this file
    setAudioData({
      fileName: file.name,
      fileUrl,
      timedMarks: [],
      generalMarks: "",
      lastPosition: 0, // Initialize with 0
    })
    setCurrentTime(0)
  }

  const handleUpdateAudio = (file: File) => {
    if (!audioData) return

    // Revoke the old object URL to prevent memory leaks
    if (audioData.fileUrl) {
      URL.revokeObjectURL(audioData.fileUrl)
    }

    const fileUrl = URL.createObjectURL(file)

    // Update the audio data with the new file but keep all marks
    setAudioData({
      ...audioData,
      fileName: file.name,
      fileUrl,
    })

    toast({
      title: "Audio refreshed",
      description: "The audio file has been updated while preserving your marks.",
    })
  }

  const triggerAudioUpdate = () => {
    setIsUpdateDialogOpen(true)
  }

  const confirmAudioUpdate = () => {
    fileInputRef.current?.click()
    setIsUpdateDialogOpen(false)
  }

  const cancelAudioUpdate = () => {
    setIsUpdateDialogOpen(false)
  }

  const addTimedMark = (timestamp: number, text: string) => {
    if (!audioData) return

    const newMark = {
      id: Date.now().toString(),
      timestamp,
      text,
    }

    setAudioData({
      ...audioData,
      timedMarks: [...audioData.timedMarks, newMark],
    })
  }

  const updateTimedMark = (id: string, text: string) => {
    if (!audioData) return

    setAudioData({
      ...audioData,
      timedMarks: audioData.timedMarks.map((mark) => (mark.id === id ? { ...mark, text } : mark)),
    })
  }

  const deleteTimedMark = (id: string) => {
    if (!audioData) return

    setAudioData({
      ...audioData,
      timedMarks: audioData.timedMarks.filter((mark) => mark.id !== id),
    })
  }

  const updateGeneralMarks = (text: string) => {
    if (!audioData) return

    setAudioData({
      ...audioData,
      generalMarks: text,
    })
  }

  const exportData = () => {
    if (!audioData) {
      toast({
        title: "No data to export",
        description: "Please upload an audio file and add some marks first.",
        variant: "destructive",
      })
      return false
    }

    try {
      // Create a copy of the data without the fileUrl (which is a blob URL and not serializable for storage)
      const exportableData = {
        ...audioData,
        lastPosition: currentTime, // Ensure we export the current position
        fileUrl: undefined, // Remove the fileUrl as it's a temporary blob URL
      }

      const dataStr = JSON.stringify(exportableData, null, 2)
      const dataBlob = new Blob([dataStr], { type: "application/json" })
      const url = URL.createObjectURL(dataBlob)

      // Create a download link
      const link = document.createElement("a")
      link.href = url
      link.download = `${audioData.fileName.split(".")[0]}-marks.json`

      // Append to the document, click, and remove
      document.body.appendChild(link)
      link.click()

      // Clean up
      setTimeout(() => {
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      }, 100)

      toast({
        title: "Marks exported",
        description: "Your marks have been exported as a JSON file.",
      })

      return true
    } catch (error) {
      console.error("Export failed:", error)
      toast({
        title: "Export failed",
        description: "There was an error exporting your marks.",
        variant: "destructive",
      })

      return false
    }
  }

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault()

    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string) as AudioData

        // Handle legacy data format (timedNotes -> timedMarks, generalNotes -> generalMarks)
        const timedMarks = importedData.timedMarks || importedData.timedNotes || []
        const generalMarks = importedData.generalMarks || importedData.generalNotes || ""

        // Validate the imported data structure
        if (!importedData.fileName || !Array.isArray(timedMarks)) {
          throw new Error("Invalid data format")
        }

        // Ensure lastPosition exists
        const lastPosition = importedData.lastPosition || 0

        if (audioData && audioData.fileName === importedData.fileName) {
          // If we already have the same file loaded, just update the marks
          setAudioData({
            ...audioData,
            timedMarks,
            generalMarks,
            lastPosition,
          })

          // Update current time to match the imported position
          setCurrentTime(lastPosition)

          toast({
            title: "Marks updated",
            description: "The imported marks have been applied to the current audio file.",
          })
        } else {
          // Store the imported data in local storage
          const dataToStore = {
            ...importedData,
            timedMarks,
            generalMarks,
            fileUrl: "", // Clear the fileUrl as we need a fresh one
            lastPosition,
          }

          localStorage.setItem("audioMarks", JSON.stringify(dataToStore))

          // If we have a different file or no file loaded, prompt to upload the correct file
          if (!audioData || audioData.fileName !== importedData.fileName) {
            toast({
              title: "Please upload the audio file",
              description: `Upload "${importedData.fileName}" to use these marks.`,
            })

            // Only reset the audio data if we don't have the correct file loaded
            setAudioData(null)
            setCurrentTime(0)
          }
        }
      } catch (error) {
        console.error("Import failed:", error)
        toast({
          title: "Import failed",
          description: "The selected file contains invalid data.",
          variant: "destructive",
        })
      }
    }
    reader.readAsText(file)

    // Reset the input
    event.target.value = ""
  }

  const handleNewWorkspaceClick = () => {
    setIsDialogOpen(true)
  }

  const handleDialogClose = () => {
    setIsDialogOpen(false)
  }

  const handleExportAndLeave = () => {
    const exportSuccess = exportData()
    if (exportSuccess) {
      clearDataAndShowUpload()
    }
  }

  const handleLeaveWithoutExporting = () => {
    clearDataAndShowUpload()
  }

  const clearDataAndShowUpload = () => {
    // Revoke the object URL to prevent memory leaks
    if (audioData?.fileUrl) {
      URL.revokeObjectURL(audioData.fileUrl)
    }

    // Clear local storage
    localStorage.removeItem("audioMarks")

    // Reset state
    setAudioData(null)
    setCurrentTime(0)
    setIsDialogOpen(false)

    toast({
      title: "Ready for new file",
      description: "You can now upload a new audio file.",
    })
  }

  return (
    <main className="container mx-auto p-4 max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Audio Mark</h1>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          {audioData && (
            <Button variant="outline" onClick={handleNewWorkspaceClick} className="flex items-center gap-2">
              <FilePlus size={16} />
              New Work Space
            </Button>
          )}
        </div>
      </div>

      {!audioData ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <FileUpload onFileUpload={handleFileUpload} />

          <div className="mt-8">
            <label htmlFor="import-json" className="cursor-pointer">
              <div className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-muted">
                <Upload size={16} />
                <span>Import Audio Marks</span>
              </div>
              <input id="import-json" type="file" accept=".json" className="hidden" onChange={importData} />
            </label>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <FileTitle fileName={audioData.fileName} />
              <Button variant="outline" size="sm" onClick={triggerAudioUpdate} className="flex items-center gap-1">
                <RefreshCw size={14} />
              </Button>
            </div>

            <div className="mb-6">
              <AudioPlayer src={audioData.fileUrl} onTimeUpdate={setCurrentTime} initialTime={audioData.lastPosition} />
            </div>

            <div className="mb-6">
              <TimedMarks
                marks={audioData.timedMarks}
                currentTime={currentTime}
                onAddMark={addTimedMark}
                onUpdateMark={updateTimedMark}
                onDeleteMark={deleteTimedMark}
              />
            </div>
          </div>

          <div>
            <GeneralMarks value={audioData.generalMarks} onChange={updateGeneralMarks} />

            <div className="mt-6 flex gap-4">
              <Button onClick={exportData} className="flex items-center gap-2" disabled={!audioData}>
                <Download size={16} />
                Export Audio Marks
              </Button>

              <label htmlFor="import-json" className="cursor-pointer">
                <div className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-muted">
                  <Upload size={16} />
                  <span>Import</span>
                </div>
                <input id="import-json" type="file" accept=".json" className="hidden" onChange={importData} />
              </label>
            </div>
          </div>
        </div>
      )}

      <ConfirmationDialog
        isOpen={isDialogOpen}
        onClose={handleDialogClose}
        onExportAndLeave={handleExportAndLeave}
        onLeaveWithoutExporting={handleLeaveWithoutExporting}
        title="Create New Work Space?"
        description="You are about to create a new work space. Your current marks will be lost unless you export them."
        confirmLabel="Export Marks and Leave"
        cancelActionLabel="Leave Without Exporting"
      />

      <ConfirmationDialog
        isOpen={isUpdateDialogOpen}
        onClose={cancelAudioUpdate}
        onConfirm={confirmAudioUpdate}
        title="Refresh Audio File"
        description="Select a new audio file to replace the current one. All your marks will be preserved."
        confirmLabel="Select New Audio"
        showCancelAction={false}
      />

      {/* Hidden file input for updating audio */}
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) {
            handleUpdateAudio(file)
          }
          e.target.value = ""
        }}
      />
    </main>
  )
}

export type TimedNote = {
  id: string
  timestamp: number
  text: string
}
