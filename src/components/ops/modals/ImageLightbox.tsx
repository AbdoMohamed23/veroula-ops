import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog'

export function ImageLightbox({
  open,
  src,
  onClose,
}: {
  open: boolean
  src: string | null
  onClose: () => void
}) {
  if (!src) return null

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-background border-border sm:max-w-lg p-2">
        <img src={src} alt="" className="w-full max-h-[80vh] object-contain rounded-lg" />
      </DialogContent>
    </Dialog>
  )
}
