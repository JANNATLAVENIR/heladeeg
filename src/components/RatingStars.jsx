import { Star } from 'lucide-react'

export default function RatingStars({ rating, size = 14, showValue = true }) {
  return (
    <div className="flex items-center gap-1">
      <Star size={size} className="text-amber-400" fill="currentColor" />
      {showValue && (
        <span className="text-sm font-semibold text-slate-700">{rating.toFixed(1)}</span>
      )}
    </div>
  )
}
