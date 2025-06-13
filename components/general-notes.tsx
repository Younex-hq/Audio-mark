"use client"

import { Textarea } from "@/components/ui/textarea"
import { FileText } from "lucide-react"

interface GeneralNotesProps {
  value: string
  onChange: (text: string) => void
}

export default function GeneralNotes({ value, onChange }: GeneralNotesProps) {
  return (
    <div className="bg-card border rounded-lg p-4 shadow-sm h-full">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <FileText size={20} />
        General Notes
      </h2>

      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Add general notes about this audio file..."
        className="min-h-[300px] resize-none"
        aria-label="General notes"
      />
    </div>
  )
}
