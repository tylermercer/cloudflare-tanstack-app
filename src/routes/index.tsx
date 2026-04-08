import { createFileRoute } from '@tanstack/react-router'
import styles from './index.module.scss'

export const Route = createFileRoute('/')({ component: App })

function App() {
  return (
    <main className={`${styles.main} l-container`}>
      <section className={`${styles.heroSection} u-rise-in`}>
        <div className={styles.heroGlow1} />
        <div className={styles.heroGlow2} />
        <p className="u-slub kicker">TanStack Start Base Template</p>
        <h1 className={styles.title}>Start simple, ship quickly.</h1>
        <p className={styles.description}>
          This base starter intentionally keeps things light: two routes, clean
          structure, and the essentials you need to build from scratch.
        </p>
        <div className={styles.ctaGroup}>
          <a href="/about" className={styles.heroCta}>
            About This Starter
          </a>
          <a
            href="https://tanstack.com/router"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.heroSecondaryCta}
          >
            Router Guide
          </a>
        </div>
      </section>

      <section className={styles.featuresGrid}>
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
            className={`${styles.featureCard} u-rise-in`}
            style={{ animationDelay: `${index * 90 + 80}ms` }}
          >
            <h2 className={styles.featureTitle}>{title}</h2>
            <p className={styles.featureDesc}>{desc}</p>
          </article>
        ))}
      </section>

      <section className={styles.quickstartSection}>
        <p className="u-slub quickstart-title">Quick Start</p>
        <ul className={styles.quickstartList}>
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
