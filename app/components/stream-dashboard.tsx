"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useSyncExternalStore } from "react";

type Page = "home" | "browse" | "my-list" | "premium";
type Category = "All" | "Films" | "Series" | "Documentaries";

const playStoreSearch =
  "https://play.google.com/store/search?q=Stream%20Play&c=apps";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const savedStorageKey = "stream-play-watchlist";
const savedTitlesEvent = "stream-play-list-change";

function getSavedSnapshot() {
  try {
    return window.localStorage.getItem(savedStorageKey) ?? "[]";
  } catch {
    return "[]";
  }
}

function subscribeToSavedTitles(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(savedTitlesEvent, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(savedTitlesEvent, onChange);
  };
}

function parseSavedTitles(snapshot: string) {
  try {
    const value: unknown = JSON.parse(snapshot);
    return Array.isArray(value) && value.every((id) => typeof id === "string")
      ? (value as string[])
      : [];
  } catch {
    return [];
  }
}

const titles = [
  { id: "blue-hour", name: "The Blue Hour", type: "Film", year: "2025", time: "1h 48m", genre: "Drama", poster: "poster-blue", category: "Films" },
  { id: "wild-coast", name: "Wild Coast", type: "Series", year: "2025", time: "2 Seasons", genre: "Adventure", poster: "poster-coast", category: "Series" },
  { id: "last-light", name: "The Last Light", type: "Film", year: "2024", time: "2h 06m", genre: "Thriller", poster: "poster-light", category: "Films" },
  { id: "deep-earth", name: "Deep Earth", type: "Documentary", year: "2025", time: "52 min", genre: "Nature", poster: "poster-earth", category: "Documentaries" },
  { id: "soft-landing", name: "Soft Landing", type: "Series", year: "2024", time: "1 Season", genre: "Comedy", poster: "poster-landing", category: "Series" },
  { id: "second-sun", name: "A Second Sun", type: "Film", year: "2025", time: "1h 56m", genre: "Sci-fi", poster: "poster-sun", category: "Films" },
];

const navigation = [
  { href: "/", label: "Home", icon: "⌂", page: "home" },
  { href: "/browse", label: "Explore", icon: "⌕", page: "browse" },
  { href: "/my-list", label: "My list", icon: "▤", page: "my-list" },
  { href: "/premium", label: "Premium", icon: "✳", page: "premium" },
];

export default function StreamDashboard({ page }: { page: Page }) {
  const pathname = usePathname();
  const savedSnapshot = useSyncExternalStore(
    subscribeToSavedTitles,
    getSavedSnapshot,
    () => "[]",
  );
  const savedIds = parseSavedTitles(savedSnapshot);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category>("All");

  function toggleSaved(id: string) {
    const next = savedIds.includes(id)
      ? savedIds.filter((savedId) => savedId !== id)
      : [...savedIds, id];
    window.localStorage.setItem(savedStorageKey, JSON.stringify(next));
    window.dispatchEvent(new Event(savedTitlesEvent));
  }

  const matchingTitles = titles.filter((title) => {
    const matchesSearch = `${title.name} ${title.genre} ${title.type}`
      .toLowerCase()
      .includes(query.trim().toLowerCase());
    const matchesCategory = category === "All" || title.category === category;
    const matchesPage = page !== "my-list" || savedIds.includes(title.id);
    return matchesSearch && matchesCategory && matchesPage;
  });
  const visibleTitles = page === "home" ? matchingTitles.slice(0, 4) : matchingTitles;

  return (
    <main className="stream-app">
      <aside className="sidebar">
        <Link className="brand" href="/" aria-label="Stream Play home">
          <Image src={`${basePath}/stream_play_primium.svg`} alt="" width={42} height={42} priority />
          <span>stream<span className="brand-play">play</span></span>
        </Link>

        <p className="nav-caption">YOUR SPACE</p>
        <nav className="side-nav" aria-label="Main navigation">
          {navigation.map((item) => (
            <Link
              className={`nav-link${pathname === item.href ? " is-active" : ""}`}
              href={item.href}
              key={item.page}
              aria-current={pathname === item.href ? "page" : undefined}
            >
              <span className="nav-icon" aria-hidden="true">{item.icon}</span>
              <span>{item.label}</span>
              {item.page === "my-list" && savedIds.length > 0 && (
                <span className="nav-count">{savedIds.length}</span>
              )}
            </Link>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-note"><span className="live-dot" /> YOUR NEXT WATCH IS OUT THERE</div>
          <Link className="sidebar-upgrade" href="/premium">
            <span className="upgrade-star">✳</span>
            <span><strong>Make it premium</strong><small>A little more movie night.</small></span>
            <span aria-hidden="true">↗</span>
          </Link>
          <span className="sidebar-version">STREAM PLAY · 2025</span>
        </div>
      </aside>

      <div className="dashboard-main">
        <header className="topbar">
          <label className="search-box">
            <span aria-hidden="true">⌕</span>
            <input
              aria-label="Search films, series, and genres"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search films, series, genres..."
              type="search"
              value={query}
            />
            <kbd>/</kbd>
          </label>
          <div className="topbar-right"><span className="topbar-date">A GOOD NIGHT TO STAY IN</span><span className="avatar">S</span></div>
        </header>

        <div className="page-content">
          {page === "home" && (
            <>
              <section className="app-download-banner" aria-label="Download the Stream Play Android app">
                <Image src={`${basePath}/stream_play_primium.svg`} alt="" width={58} height={58} />
                <div className="app-download-copy">
                  <span className="app-download-kicker"><span className="live-dot" /> ANDROID APP · OFFICIAL RELEASE</span>
                  <strong>Stream Play, on your phone.</strong>
                  <span>Take your next great watch wherever you go.</span>
                </div>
                <a className="app-download-action" href={`${basePath}/app-release.apk`} download="Stream-Play.apk">
                  <span className="download-arrow" aria-hidden="true">↓</span>
                  <span>Download APK<small>FOR ANDROID</small></span>
                </a>
              </section>
              <section className="welcome-row">
                <div><p className="eyebrow"><span className="live-dot" /> YOUR PERSONAL SCREENING ROOM</p><h1>Good evening<span className="welcome-dot">.</span></h1><p className="welcome-copy">The perfect story for tonight is a little closer than you think.</p></div>
                <Link className="browse-link" href="/browse">Explore everything <span aria-hidden="true">↗</span></Link>
              </section>
              <section className="featured" aria-label="Featured title">
                <div className="featured-art" />
                <div className="featured-grain" />
                <div className="featured-content">
                  <div className="featured-label"><span /> THIS WEEK&apos;S SPOTLIGHT</div>
                  <p className="featured-kicker">A STORY WORTH SITTING WITH</p>
                  <h2>After the<br /><em>Silence</em></h2>
                  <p className="featured-description">A photographer returns to the coast where she grew up, and finds a home, and a past, waiting in the same place.</p>
                  <div className="featured-meta"><span>2025</span><span>FILM</span><span>DRAMA</span><span>1H 52M</span></div>
                  <Link className="featured-button" href="/browse"><span aria-hidden="true">▶</span> Find your next watch</Link>
                </div>
                <div className="featured-index">SPOTLIGHT <strong>01 / 03</strong></div>
              </section>
              <section className="catalog-section">
                <div className="section-title-row"><div><p className="section-overline">A FEW GOOD PICKS</p><h2>Tonight&apos;s shortlist</h2></div><Link href="/browse" className="subtle-link">See all <span aria-hidden="true">→</span></Link></div>
                <TitleGrid titles={visibleTitles} savedIds={savedIds} onToggleSaved={toggleSaved} />
                {query && visibleTitles.length === 0 && <EmptyState title="No matches just yet" copy="Try another title, genre, or search." />}
              </section>
            </>
          )}

          {page === "browse" && (
            <>
              <section className="catalog-heading"><p className="section-overline">THE GOOD STUFF, ALL IN ONE PLACE</p><h1>Find your next <em>favourite.</em></h1><p className="catalog-subtitle">Big-screen feelings, right where you left them.</p></section>
              <section className="catalog-section browse-section">
                <div className="filter-row" role="group" aria-label="Filter by type">
                  {(["All", "Films", "Series", "Documentaries"] as Category[]).map((filter) => (
                    <button className={`filter-button${category === filter ? " is-selected" : ""}`} key={filter} onClick={() => setCategory(filter)} type="button">{filter}</button>
                  ))}
                  <span className="result-count">{matchingTitles.length} TITLES</span>
                </div>
                <TitleGrid titles={matchingTitles} savedIds={savedIds} onToggleSaved={toggleSaved} />
                {matchingTitles.length === 0 && <EmptyState title="Nothing on this shelf" copy="Try another search or category." />}
              </section>
            </>
          )}

          {page === "my-list" && (
            <>
              <section className="catalog-heading list-heading"><p className="section-overline">SAVED FOR LATER, READY WHEN YOU ARE</p><h1>Your <em>watchlist.</em></h1><p className="catalog-subtitle">{matchingTitles.length} {matchingTitles.length === 1 ? "story" : "stories"} saved for a good night in.</p></section>
              <section className="catalog-section browse-section"><TitleGrid titles={matchingTitles} savedIds={savedIds} onToggleSaved={toggleSaved} />{matchingTitles.length === 0 && <EmptyState title="Your list starts here" copy="Explore the collection and tap the bookmark on anything that catches your eye."><Link className="empty-action" href="/browse">Explore the collection <span aria-hidden="true">↗</span></Link></EmptyState>}</section>
            </>
          )}

          {page === "premium" && (
            <section className="premium-page">
              <div className="premium-visual"><Image src={`${basePath}/stream_play_primium.svg`} alt="Stream Play Premium icon" width={118} height={118} priority /><span className="premium-visual-tag">THE MOVIE-NIGHT UPGRADE</span></div>
              <div className="premium-copy"><p className="section-overline">A LITTLE MORE ROOM FOR STORIES</p><h1>Movie night,<br /><em>made yours.</em></h1><p>Find a new favourite, keep a list for later, and bring a bit more occasion to the everyday. Stream Play Premium makes the whole evening feel like yours.</p><div className="premium-perks"><div><span>01</span><strong>Your favourites, all together</strong><span aria-hidden="true">↗</span></div><div><span>02</span><strong>More ways to find a story</strong><span aria-hidden="true">↗</span></div><div><span>03</span><strong>Your watchlist, always close</strong><span aria-hidden="true">↗</span></div></div><a className="featured-button premium-cta" href={playStoreSearch} rel="noreferrer" target="_blank">Get Stream Play <span aria-hidden="true">↗</span></a><span className="premium-footnote">AVAILABLE ON GOOGLE PLAY</span></div>
            </section>
          )}
          <section className="about-section" aria-labelledby="about-heading">
            <div className="about-intro">
              <p className="section-overline">THE PERSON BEHIND STREAM PLAY</p>
              <h2 id="about-heading">Good stories,<br /><em>made personal.</em></h2>
              <p>Stream Play is a movie discovery experience for exploring films, series, and documentaries, and keeping your next watch close.</p>
            </div>
            <div className="about-details">
              <div className="about-detail"><span>DEVELOPER</span><strong>Bhim Kumar Yadav</strong></div>
              <div className="about-detail"><span>PROJECT</span><strong>Stream Play</strong></div>
              <div className="about-detail"><span>PLATFORM</span><strong>Android app &amp; website</strong></div>
              <div className="about-detail"><span>GET IN TOUCH</span><a href="mailto:bhimy7158@gmail.com">bhimy7158@gmail.com <span aria-hidden="true">↗</span></a></div>
            </div>
          </section>
          <footer className="page-footer"><span>STREAM PLAY</span><span>GOOD STORIES. YOUR KIND OF NIGHT.</span></footer>
        </div>
      </div>
    </main>
  );
}

function TitleGrid({ titles: items, savedIds, onToggleSaved }: { titles: typeof titles; savedIds: string[]; onToggleSaved: (id: string) => void }) {
  return (
    <div className="title-grid">
      {items.map((title, index) => (
        <article className="title-card" key={title.id} style={{ animationDelay: `${index * 65}ms` }}>
          <Link className={`title-poster ${title.poster}`} href="/browse" aria-label={`Explore ${title.name}`}>
            <span className="poster-type">{title.type.toUpperCase()}</span><span className="poster-caption">{title.name}</span>
          </Link>
          <div className="title-details"><div><h3>{title.name}</h3><p>{title.year}<span />{title.time}<span />{title.genre}</p></div><button aria-label={`${savedIds.includes(title.id) ? "Remove" : "Add"} ${title.name} ${savedIds.includes(title.id) ? "from" : "to"} your list`} aria-pressed={savedIds.includes(title.id)} className={`save-button${savedIds.includes(title.id) ? " is-saved" : ""}`} onClick={() => onToggleSaved(title.id)} type="button"><span aria-hidden="true">{savedIds.includes(title.id) ? "✓" : "+"}</span></button></div>
        </article>
      ))}
    </div>
  );
}

function EmptyState({ title, copy, children }: { title: string; copy: string; children?: React.ReactNode }) {
  return <div className="empty-state"><span className="empty-spark" aria-hidden="true">✳</span><h2>{title}</h2><p>{copy}</p>{children}</div>;
}