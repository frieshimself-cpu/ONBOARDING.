import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Barcode } from '@/components/ui/Barcode'

export function NotFoundPage() {
  return (
    <div className="mx-auto grid max-w-lg place-items-center px-4 py-32 text-center">
      <div className="card relative w-full max-w-sm overflow-hidden p-8 shadow-pass">
        <div className="absolute inset-y-0 left-0 w-1.5 bg-flare" aria-hidden />
        <div className="mono-label text-flare">boarding denied</div>
        <div className="display mt-4 text-7xl">
          4<span className="gradient-text">0</span>4
        </div>
        <p className="mt-4 text-sm text-muted">
          This page doesn&apos;t exist. Let&apos;s get you back to the gate.
        </p>
        <div className="relative my-6">
          <div className="pass-perf" />
          <div className="pass-notch-l" />
          <div className="pass-notch-r" />
        </div>
        <div className="flex items-center justify-between">
          <Barcode seed="404" className="h-6 w-24 text-muted/35" />
          <Link to="/">
            <Button size="sm">Back home</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
