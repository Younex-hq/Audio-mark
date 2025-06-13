"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Pencil, Trash2, Clock, Plus } from "lucide-react"
import { formatTime } from "@/lib/utils"
import type { TimedMark } from "@/app/page"

interface TimedMarksProps {
  marks: TimedMark[]
  currentTime: number
  onAddMark: (timestamp: number, text: string) => void
  onUpdateMark: (id: string, text: string) => void
  onDeleteMark: (id: string) => void
}

export default function TimedMarks({ marks, currentTime, onAddMark, onUpdateMark, onDeleteMark }: TimedMarksProps) {
  const [newMarkText, setNewMarkText] = useState("")
  const [editingMarkId, setEditingMarkId] = useState<string | null>(null)
  const [editText, setEditText] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  const handleAddMark = () => {
    if (newMarkText.trim()) {
      onAddMark(currentTime, newMarkText.trim())
      setNewMarkText("")
      inputRef.current?.focus()
    }
  }

  const startEditing = (mark: TimedMark) => {
    setEditingMarkId(mark.id)
    setEditText(mark.text)
  }

  const saveEdit = () => {
    if (editingMarkId && editText.trim()) {
      onUpdateMark(editingMarkId, editText.trim())
      setEditingMarkId(null)
    }
  }

  const cancelEdit = () => {
    setEditingMarkId(null)
  }

  // Sort marks by timestamp
  const sortedMarks = [...marks].sort((a, b) => a.timestamp - b.timestamp)

  return (
    <div className="bg-card border rounded-lg p-4 shadow-sm">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Clock size={20} />
        Timed Marks
      </h2>

      <div className="flex gap-2 mb-6">
        <Input
          ref={inputRef}
          value={newMarkText}
          onChange={(e) => setNewMarkText(e.target.value)}
          placeholder="Add a mark at current timestamp..."
          className="flex-1"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleAddMark()
            }
          }}
          aria-label="New mark text"
        />
        <Button onClick={handleAddMark} disabled={!newMarkText.trim()} aria-label="Add mark">
          <Plus size={16} className="mr-2" />
          Add
        </Button>
      </div>

      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
        {sortedMarks.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">No timed marks yet. Add your first mark!</p>
        ) : (
          sortedMarks.map((mark) => (
            <Card key={mark.id} className="overflow-hidden">
              <CardContent className="p-3">
                {editingMarkId === mark.id ? (
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
                          audio.currentTime = mark.timestamp
                          audio.play()
                        }
                      }}
                      aria-label={`Jump to ${formatTime(mark.timestamp)}`}
                    >
                      {formatTime(mark.timestamp)}
                    </button>

                    <div className="flex-1 break-words">{mark.text}</div>

                    <div className="flex gap-1 flex-shrink-0">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => startEditing(mark)}
                        aria-label="Edit mark"
                      >
                        <Pencil size={14} />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => onDeleteMark(mark.id)}
                        aria-label="Delete mark"
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
