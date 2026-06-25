import { useState } from 'react'
import { Star } from 'lucide-react'

export function StarRating({
  rating,
  onChange,
  readonly = false,
}: {
  rating: number
  onChange?: (r: number) => void
  readonly?: boolean
}) {
  const [hover, setHover] = useState(0)

  return (
    <div className="flex gap-0.5 star-rating" dir="ltr">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(i)}
          onMouseEnter={() => !readonly && setHover(i)}
          onMouseLeave={() => !readonly && setHover(0)}
          className={`star ${(hover || rating) >= i ? 'active' : ''} ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} transition-transform`}
        >
          <Star
            className={`size-5 ${(hover || rating) >= i ? 'fill-[#c0845a] text-[#c0845a]' : ''}`}
          />
        </button>
      ))}
    </div>
  )
}
