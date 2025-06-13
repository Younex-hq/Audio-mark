"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Pencil, Trash2, Clock, Plus } from "lucide-react"
import { formatTime } from "@/lib/utils"
import type { TimedNote } from "@/app/page"

interface TimedNotesProps {
  notes: TimedNote[]
  currentTime: number
  onAddNote: (timestamp: number, text: string) => void
  onUpdateNote: (id: string, text: string) => void
  onDeleteNote: (id: string) => void
}

export default function TimedNotes({ notes, currentTime, onAddNote, onUpdateNote, onDeleteNote }: TimedNotesProps) {
  const [newNoteText, setNewNoteText] = useState("")
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const [editText, setEditText] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  const handleAddNote = () => {
    if (newNoteText.trim()) {
      onAddNote(currentTime, newNoteText.trim())
      setNewNoteText("")
      inputRef.current?.focus()
    }
  }

  const startEditing = (note: TimedNote) => {
    setEditingNoteId(note.id)
    setEditText(note.text)
  }

  const saveEdit = () => {
    if (editingNoteId && editText.trim()) {
      onUpdateNote(editingNoteId, editText.trim())
      setEditingNoteId(null)
    }
  }

  const cancelEdit = () => {
    setEditingNoteId(null)
  }

  // Sort notes by timestamp
  const sortedNotes = [...notes].sort((a, b) => a.timestamp - b.timestamp)

  return (
    <div className="bg-card border rounded-lg p-4 shadow-sm">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Clock size={20} />
        Timed Notes
      </h2>

      <div className="flex gap-2 mb-6">
        <Input
          ref={inputRef}
          value={newNoteText}
          onChange={(e) => setNewNoteText(e.target.value)}
          placeholder="Add a note at current timestamp..."
          className="flex-1"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleAddNote()
            }
          }}
          aria-label="New note text"
        />
        <Button onClick={handleAddNote} disabled={!newNoteText.trim()} aria-label="Add note">
          <Plus size={16} className="mr-2" />
          Add
        </Button>
      </div>

      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
        {sortedNotes.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">No timed notes yet. Add your first note!</p>
        ) : (
          sortedNotes.map((note) => (
            <Card key={note.id} className="overflow-hidden">
              <CardContent className="p-3">
                {editingNoteId === note.id ? (
                  <div className="space-y-2">
                    <Input
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          saveEdit()
                        } else if (e.key === "Escape") {
                          cancelEdit()
                        }
                      }}
                    />
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" onClick={cancelEdit}>
                        Cancel
                      </Button>
                      <Button size="sm" onClick={saveEdit}>
                        Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <button
                      className="flex-shrink-0 text-sm font-medium bg-primary/10 text-primary hover:bg-primary/20 px-2 py-1 rounded"
                      onClick={() => {
                        // This would be handled by the parent component
                        const audio = document.querySelector("audio")
                        if (audio) {
                          audio.currentTime = note.timestamp
                          audio.play()
                        }
                      }}
                      aria-label={`Jump to ${formatTime(note.timestamp)}`}
                    >
                      {formatTime(note.timestamp)}
                    </button>

                    <div className="flex-1 break-words">{note.text}</div>

                    <div className="flex gap-1 flex-shrink-0">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => startEditing(note)}
                        aria-label="Edit note"
                      >
                        <Pencil size={14} />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => onDeleteNote(note.id)}
                        aria-label="Delete note"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
