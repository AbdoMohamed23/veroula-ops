import { useRef, useState } from 'react'
import { ImagePlus, Loader2, X } from 'lucide-react'
import { uploadOpsImage } from '@/lib/storage-upload'
import { toast } from 'sonner'

export function SimpleImageUpload({
  images,
  onChange,
  max = 6,
}: {
  images: string[]
  onChange: (urls: string[]) => void
  max?: number
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return
    setUploading(true)
    try {
      const urls: string[] = []
      for (const file of Array.from(files).slice(0, max - images.length)) {
        urls.push(await uploadOpsImage(file))
      }
      onChange([...images, ...urls])
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'فشل رفع الصورة')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {images.map((url, i) => (
          <div key={url} className="relative size-16 rounded-lg overflow-hidden border border-border">
            <img src={url} alt="" className="w-full h-full object-cover" />
            <button
              type="button"
              className="absolute top-0.5 left-0.5 bg-black/60 rounded-full p-0.5"
              onClick={() => onChange(images.filter((_, j) => j !== i))}
            >
              <X className="size-3 text-white" />
            </button>
          </div>
        ))}
        {images.length < max && (
          <button
            type="button"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            className="size-16 rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
          >
            {uploading ? <Loader2 className="size-5 animate-spin" /> : <ImagePlus className="size-5" />}
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => void handleFiles(e.target.files)}
      />
    </div>
  )
}
