import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/about')({
  component: About,
})

function About() {
  return (
    <main className="l-container main">
      <section className="about_section">
        <p className="u-slub kicker">About</p>
        <h1 className="title">A small starter with room to grow.</h1>
        <p className="description">
          TanStack Start gives you type-safe routing, server functions, and
          modern SSR defaults. Use this as a clean foundation, then layer in
          your own routes, styling, and add-ons.
        </p>
      </section>
    </main>
  )
}
