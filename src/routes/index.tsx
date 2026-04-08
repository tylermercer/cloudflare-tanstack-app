import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({ component: App })

function App() {
  return (
    <main className="main l-container">
      <section className="hero-section u-rise-in">
        <div className="hero-glow-1" />
        <div className="hero-glow-2" />
        <p className="u-slub kicker">TanStack Start Base Template</p>
        <h1 className="title">Start simple, ship quickly.</h1>
        <p className="description">
          This base starter intentionally keeps things light: two routes, clean
          structure, and the essentials you need to build from scratch.
        </p>
        <div className="cta-group">
          <a href="/about" className="hero-cta">
            About This Starter
          </a>
          <a
            href="https://tanstack.com/router"
            target="_blank"
            rel="noopener noreferrer"
            className="hero-secondary-cta"
          >
            Router Guide
          </a>
        </div>
      </section>

      <section className="features-grid">
        {[
          [
            'Type-Safe Routing',
            'Routes and links stay in sync across every page.',
          ],
          [
            'Server Functions',
            'Call server code from your UI without creating API boilerplate.',
          ],
          [
            'Streaming by Default',
            'Ship progressively rendered responses for faster experiences.',
          ],
          [
            'Tailwind Native',
            'Design quickly with utility-first styling and reusable tokens.',
          ],
        ].map(([title, desc], index) => (
          <article
            key={title}
            className="u-rise-in feature-card"
            style={{ animationDelay: `${index * 90 + 80}ms` }}
          >
            <h2 className="feature-title">{title}</h2>
            <p className="feature-desc">{desc}</p>
          </article>
        ))}
      </section>

      <section className="quickstart-section">
        <p className="u-slub quickstart-title">Quick Start</p>
        <ul className="quickstart-list">
          <li>
            Edit <code>src/routes/index.tsx</code> to customize the home page.
          </li>
          <li>
            Update <code>src/components/Header.tsx</code> and{' '}
            <code>src/components/Footer.tsx</code> for brand links.
          </li>
          <li>
            Add routes in <code>src/routes</code> and tweak visual tokens in{' '}
            <code>src/styles/theme.scss</code>.
          </li>
        </ul>
      </section>
    </main>
  )
}
