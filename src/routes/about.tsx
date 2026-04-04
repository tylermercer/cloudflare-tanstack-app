import { createFileRoute } from '@tanstack/react-router'
import './about.module.scss'

export const Route = createFileRoute('/about')({
  component: About,
})

function About() {
  return (
    <main className="about-main page-wrap">
      <section className="about-hero island-shell l-stack" style={{ '--space': 'var(--space-m)' } as any}>
        <p className="island-kicker">About</p>
        <h1 className="about-title display-title">
          A small starter with room to grow.
        </h1>
        <p>
          TanStack Start gives you type-safe routing, server functions, and
          modern SSR defaults. Use this as a clean foundation, then layer in
          your own routes, styling, and add-ons.
        </p>
      </section>
    </main>
  )
}
