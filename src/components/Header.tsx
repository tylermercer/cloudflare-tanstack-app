import { Link } from '@tanstack/react-router'
import ClerkHeader from '../integrations/clerk/header-user.tsx'
import ThemeToggle from './ThemeToggle'
import styles from './Header.module.scss'

export default function Header() {
  return (
    <header className={styles.header}>
      <nav className={`${styles.nav} l-container`}>
        <h2 className={styles.logo}>
          <Link to="/" className={styles.logoLink}>
            <span className={styles.logoDot} />
            TanStack Start
          </Link>
        </h2>

        <div className={styles.actions}>
          <div className={styles.socialLinks}>
            <a
              href="https://x.com/tan_stack"
              target="_blank"
              rel="noreferrer"
              className={styles.socialLink}
            >
              <span className="u-sr-only">Follow TanStack on X</span>
              <svg viewBox="0 0 16 16" aria-hidden="true" width="24" height="24">
                <path
                  fill="currentColor"
                  d="M12.6 1h2.2L10 6.48 15.64 15h-4.41L7.78 9.82 3.23 15H1l5.14-5.84L.72 1h4.52l3.12 4.73L12.6 1zm-.77 12.67h1.22L4.57 2.26H3.26l8.57 11.41z"
                />
              </svg>
            </a>
            <a
              href="https://github.com/TanStack"
              target="_blank"
              rel="noreferrer"
              className={styles.socialLink}
            >
              <span className="u-sr-only">Go to TanStack GitHub</span>
              <svg viewBox="0 0 16 16" aria-hidden="true" width="24" height="24">
                <path
                  fill="currentColor"
                  d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"
                />
              </svg>
            </a>
          </div>
          <ClerkHeader />

          <ThemeToggle />
        </div>

        <div className={styles.navLinks}>
          <Link
            to="/"
            className={styles.navLink}
            activeProps={{ className: `${styles.navLink} ${styles.isActive}` }}
          >
            Home
          </Link>
          <Link
            to="/about"
            className={styles.navLink}
            activeProps={{ className: `${styles.navLink} ${styles.isActive}` }}
          >
            About
          </Link>
          <a
            href="https://tanstack.com/start/latest/docs/framework/react/overview"
            className={styles.navLink}
            target="_blank"
            rel="noreferrer"
          >
            Docs
          </a>
          <details className={styles.dropdown}>
            <summary className={`${styles.navLink} ${styles.dropdownSummary}`}>
              Demos
            </summary>
            <div className={styles.dropdownContent}>
              <a href="/demo/clerk" className={styles.dropdownLink}>
                Clerk
              </a>
              <a href="/demo/convex" className={styles.dropdownLink}>
                Convex
              </a>
            </div>
          </details>
        </div>
      </nav>
    </header>
  )
}
