import { useState } from 'react';
import { SpecialtyCard } from '../components/SpecialtyCard';
import { useSpecialties } from '../hooks/useSpecialties';
import './ConsultantsPage.css';

const SKELETON_COUNT = 6;

function HeroArt() {
  return (
    <svg
      className="hero__art"
      viewBox="0 0 420 300"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="270" cy="150" r="140" fill="#fff" fillOpacity="0.55" />
      <circle cx="270" cy="150" r="98" fill="#fff" fillOpacity="0.7" />
      <circle cx="270" cy="150" r="56" fill="#1f6fb5" fillOpacity="0.9" />
      <rect x="60" y="40" width="84" height="84" rx="22" fill="#b9dbf3" />
      <rect x="40" y="170" width="120" height="70" rx="20" fill="#fff" />
      <rect x="62" y="192" width="48" height="8" rx="4" fill="#b9dbf3" />
      <rect x="62" y="210" width="72" height="8" rx="4" fill="#dceefb" />
      <rect x="330" y="30" width="56" height="56" rx="16" fill="#fff" />
      <circle cx="358" cy="58" r="10" fill="#1f6fb5" />
      <circle cx="350" cy="255" r="14" fill="#b9dbf3" />
    </svg>
  );
}

export default function ConsultantsPage() {
  const specialties = useSpecialties();
  const [query, setQuery] = useState('');

  const normalizedQuery = query.trim().toLowerCase();
  const allSpecialties =
    specialties.status === 'success' ? specialties.data : [];
  const visibleSpecialties = normalizedQuery
    ? allSpecialties.filter(
        (item) =>
          item.name.toLowerCase().includes(normalizedQuery) ||
          (item.description ?? '').toLowerCase().includes(normalizedQuery),
      )
    : allSpecialties;

  const showSearch =
    specialties.status === 'success' && allSpecialties.length > 0;

  return (
    <>
      <header className="site-header">
        <div className="container site-header__inner">
          <span className="wordmark">
            Consultant <span className="wordmark__accent">Gate</span>
          </span>
        </div>
      </header>

      <main>
        <section className="hero" aria-labelledby="page-title">
          <div className="container hero__inner">
            <div className="hero__text">
              <h1 id="page-title" className="hero__title">
                Find the right specialty for your question
              </h1>
              <p className="hero__lead">
                Browse the areas our consultants cover.
              </p>

              {showSearch && (
                <form
                  className="search"
                  role="search"
                  onSubmit={(event) => event.preventDefault()}
                >
                  <label htmlFor="specialty-search" className="visually-hidden">
                    Search specialties
                  </label>
                  <svg
                    className="search__icon"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    aria-hidden="true"
                  >
                    <circle cx="11" cy="11" r="7" />
                    <path d="m20 20-3.5-3.5" />
                  </svg>
                  <input
                    id="specialty-search"
                    className="search__input"
                    type="search"
                    placeholder="Search for a specialty"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    autoComplete="off"
                  />
                </form>
              )}
            </div>
            <HeroArt />
          </div>
        </section>

        <section className="container results" aria-labelledby="results-title">
          <h2 id="results-title" className="visually-hidden">
            Specialties
          </h2>

          {specialties.status === 'loading' && (
            <div role="status">
              <span className="visually-hidden">Loading specialties</span>
              <ul className="grid" aria-hidden="true">
                {Array.from({ length: SKELETON_COUNT }, (_, index) => (
                  <li key={index} className="specialty-card skeleton">
                    <span className="skeleton__block skeleton__mark" />
                    <span className="skeleton__block skeleton__line" />
                    <span className="skeleton__block skeleton__line skeleton__line--short" />
                  </li>
                ))}
              </ul>
            </div>
          )}

          {specialties.status === 'error' && (
            <div className="state" role="alert">
              <h3 className="state__title">We couldn’t load the specialties</h3>
              <p className="state__text">
                Check your connection and try again.
              </p>
              <button
                type="button"
                className="button"
                onClick={specialties.retry}
              >
                Try again
              </button>
            </div>
          )}

          {specialties.status === 'success' && allSpecialties.length === 0 && (
            <div className="state">
              <h3 className="state__title">No specialties yet</h3>
              <p className="state__text">
                Specialties will appear here once they are added.
              </p>
            </div>
          )}

          {specialties.status === 'success' && allSpecialties.length > 0 && (
            <>
              <p className="results__count" aria-live="polite">
                {visibleSpecialties.length === 1
                  ? '1 specialty'
                  : `${visibleSpecialties.length} specialties`}
              </p>

              {visibleSpecialties.length > 0 ? (
                <ul className="grid">
                  {visibleSpecialties.map((specialty) => (
                    <SpecialtyCard key={specialty.id} specialty={specialty} />
                  ))}
                </ul>
              ) : (
                <div className="state">
                  <h3 className="state__title">
                    No specialties match your search
                  </h3>
                  <p className="state__text">
                    Try a different word or clear the search.
                  </p>
                  <button
                    type="button"
                    className="button"
                    onClick={() => setQuery('')}
                  >
                    Clear search
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </main>
    </>
  );
}
