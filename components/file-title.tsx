import { FileAudio } from "lucide-react"

interface FileTitleProps {
  fileName: string
}

export default function FileTitle({ fileName }: FileTitleProps) {
  return (
    <div className="flex items-center gap-2">
      <FileAudio className="text-primary" size={24} />
      <h2 className="text-2xl font-semibold truncate">{fileName}</h2>
    </div>
  )
}
