import { createFileRoute, Link } from '@tanstack/react-router'
import './index.module.scss'

export const Route = createFileRoute('/')({ component: App })

function App() {
  return (
    <main className="home-main page-wrap l-stack" style={{ '--space': 'var(--space-2xl)' } as any}>
      <section className="hero-island island-shell rise-in l-stack" style={{ '--space': 'var(--space-m)' } as any}>
        <p className="island-kicker">TanStack Start Base Template</p>
        <h1 className="hero-title display-title">
          Start simple, ship quickly.
        </h1>
        <p>
          This base starter intentionally keeps things light: two routes, clean
          structure, and the essentials you need to build from scratch.
        </p>
        <div className="hero-links">
          <Link
            to="/about"
          >
            About This Starter
          </Link>
          <a
            href="https://tanstack.com/router"
            target="_blank"
            rel="noopener noreferrer"
          >
            Router Guide
          </a>
        </div>
      </section>

      <section className="features-grid l-grid" style={{ '--grid-min-item-size': '280px', '--grid-gap': 'var(--space-l)' } as any}>
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
            'No styling engine',
            'Design quickly with whatever styling setup you want.',
          ],
        ].map(([title, desc], index) => (
          <article
            key={title}
            className="feature-article island-shell feature-card rise-in l-stack"
            style={{ animationDelay: `${index * 90 + 80}ms`, '--space': 'var(--space-xs)' } as any}
          >
            <h2>
              {title}
            </h2>
            <p>{desc}</p>
          </article>
        ))}
      </section>

      <section className="quick-start island-shell l-stack" style={{ '--space': 'var(--space-m)' } as any}>
        <p className="island-kicker">Quick Start</p>
        <ul className="l-stack" style={{ '--space': 'var(--space-xs)' } as any}>
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
