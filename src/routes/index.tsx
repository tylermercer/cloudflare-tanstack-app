import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({ component: App })

function App() {
  return (
    <main className="page-wrap">
      <section className="island-shell rise-in">
        <p className="island-kicker">TanStack Start Base Template</p>
        <h1 className="display-title">
          Start simple, ship quickly.
        </h1>
        <p>
          This base starter intentionally keeps things light: two routes, clean
          structure, and the essentials you need to build from scratch.
        </p>
        <div>
          <a
            href="/about"
          >
            About This Starter
          </a>
          <a
            href="https://tanstack.com/router"
            target="_blank"
            rel="noopener noreferrer"
          >
            Router Guide
          </a>
        </div>
      </section>

      <section>
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
            className="island-shell feature-card rise-in"
            style={{ animationDelay: `${index * 90 + 80}ms` }}
          >
            <h2>
              {title}
            </h2>
            <p>{desc}</p>
          </article>
        ))}
      </section>

      <section className="island-shell">
        <p className="island-kicker">Quick Start</p>
        <ul>
          <li>
            Edit <code>src/routes/index.tsx</code> to customize the home page.
          </li>
          <li>
            Update <code>src/components/Header.tsx</code> and{' '}
            <code>src/components/Footer.tsx</code> for brand links.
          </li>
          <li>
            Add routes in <code>src/routes</code> and tweak visual tokens in{' '}
            <code>src/main.css</code>.
          </li>
        </ul>
      </section>
    </main>
  )
}
