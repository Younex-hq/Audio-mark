"use client"

import { Textarea } from "@/components/ui/textarea"
import { FileText } from "lucide-react"

interface GeneralMarksProps {
  value: string
  onChange: (text: string) => void
}

export default function GeneralMarks({ value, onChange }: GeneralMarksProps) {
  return (
    <div className="bg-card border rounded-lg p-4 shadow-sm h-full">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <FileText size={20} />
        General Marks
      </h2>

      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Add general marks about this audio file..."
        className="min-h-[300px] resize-none"
        aria-label="General marks"
      />
    </div>
  )
}
