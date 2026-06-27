import { Construction } from 'lucide-react'

export default function Placeholder({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 text-text-muted">
      <Construction size={32} />
      <div className="text-lg font-semibold text-text-secondary">{title}</div>
      <div className="text-[12px]">Coming in a future build</div>
    </div>
  )
}
