import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({ component: App })

function App() {
  return (
    <main className="l-container main">
      <section className="u-rise-in hero_section">
        <div className="hero_glow_1" />
        <div className="hero_glow_2" />
        <p className="u-slub mb-3">TanStack Start Base Template</p>
        <h1 className="title mb-5">Start simple, ship quickly.</h1>
        <p className="description mb-8">
          This base starter intentionally keeps things light: two routes, clean
          structure, and the essentials you need to build from scratch.
        </p>
        <div className="l-cluster-l l-space-xs">
          <a href="/about" className="hero_cta">
            About This Starter
          </a>
          <a
            href="https://tanstack.com/router"
            target="_blank"
            rel="noopener noreferrer"
            className="hero_secondary_cta"
          >
            Router Guide
          </a>
        </div>
      </section>

      <section className="features_grid">
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
            className="u-rise-in feature_card"
            style={{ animationDelay: `${index * 90 + 80}ms` }}
          >
            <h2 className="feature_title">{title}</h2>
            <p className="feature_desc">{desc}</p>
          </article>
        ))}
      </section>

      <section className="quickstart_section">
        <p className="u-slub mb-2">Quick Start</p>
        <ul className="l-stack l-space-2xs feature_desc">
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
