import { createFileRoute } from '@tanstack/react-router'
import { useUser } from '@clerk/clerk-react'
import './clerk.module.scss'

export const Route = createFileRoute('/demo/clerk')({
  component: App,
})

function App() {
  const { isSignedIn, user, isLoaded } = useUser()

  if (!isLoaded) {
    return (
      <main className="clerk-page page-wrap l-center">
        <p>Loading...</p>
      </main>
    )
  }

  if (!isSignedIn) {
    return (
      <main className="clerk-page page-wrap l-center">
        <p>Sign in to view this page</p>
      </main>
    )
  }

  return (
    <main className="clerk-page page-wrap l-stack l-center" style={{ '--space': 'var(--space-m)' } as any}>
      <h1 className="clerk-title">Hello {user.firstName}!</h1>
      <p>Welcome to the Clerk demo page.</p>
    </main>
  )
}
