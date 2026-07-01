import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'

export function NotFoundPage() {
  return (
    <div className="mx-auto grid max-w-lg place-items-center px-4 py-32 text-center">
      <div className="gradient-text text-7xl font-extrabold">404</div>
      <p className="mt-4 text-muted">This page drifted off the chain.</p>
      <Link to="/" className="mt-6">
        <Button>Back home</Button>
      </Link>
    </div>
  )
}
