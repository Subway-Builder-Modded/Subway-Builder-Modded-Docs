import React, { useEffect, useMemo, useRef, useState } from "react";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";
import Translate, { translate } from "@docusaurus/Translate";
import styles from "../css/railyard.module.css";
import { ALL_DOWNLOADS, detectNativeDownload, getDownloadCatalog } from "../helpers/railyardHelpers";

const FEATURES = [
  {
    id: "browse",
    letter: "C",
    color: "#1335A1",
    textColor: "#FFFFFF",
    title: translate({ id: "railyard.feature.browse.title", message: "Custom Cities" }),
    desc: translate({
      id: "railyard.feature.browse.desc",
      message: "Browse hundreds of community-made maps of cities from around the world.",
    }),
    bullets: [
      translate({
        id: "railyard.feature.browse.bullet1",
        message: "Find maps by size, data, and region.",
      }),
      translate({
        id: "railyard.feature.browse.bullet2",
        message: "Sort and toggle your maps easily.",
      }),
      translate({
        id: "railyard.feature.browse.bullet3",
        message: "Install directly from one polished app experience.",
      }),
    ],
  },
  {
    id: "install",
    letter: "M",
    color: "#93683A",
    textColor: "#FFFFFF",
    title: translate({ id: "railyard.feature.install.title", message: "Mod Browser" }),
    desc: translate({
      id: "railyard.feature.install.desc",
      message:
        "From adding 500+ new trains to seeing detailed demand data by region, there's a mod for anything you desire.",
    }),
    bullets: [
      translate({
        id: "railyard.feature.install.bullet1",
        message: "Browse and add gameplay mods quickly.",
      }),
      translate({
        id: "railyard.feature.install.bullet2",
        message: "Keep your favorites organized in one place.",
      }),
      translate({
        id: "railyard.feature.install.bullet3",
        message: "Spend more time playing, less time configuring.",
      }),
    ],
  },
  {
    id: "manage",
    letter: "S",
    color: "#F5CF46",
    textColor: "#000000",
    title: translate({ id: "railyard.feature.manage.title", message: "Simple Installation" }),
    desc: translate({
      id: "railyard.feature.manage.desc",
      message:
        "No more messing around with your system's file manager. Click the download button for the map or mod you want to play and let Railyard do the rest.",
    }),
    bullets: [
      translate({
        id: "railyard.feature.manage.bullet1",
        message: "No manual folder juggling.",
      }),
      translate({
        id: "railyard.feature.manage.bullet2",
        message: "Smooth onboarding for new players.",
      }),
      translate({
        id: "railyard.feature.manage.bullet3",
        message: "Cleaner setup with fewer errors.",
      }),
    ],
  },
  {
    id: "updates",
    letter: "F",
    color: "#ED6D32",
    textColor: "#FFFFFF",
    title: translate({ id: "railyard.feature.updates.title", message: "Fast and Easy Management" }),
    desc: translate({
      id: "railyard.feature.updates.desc",
      message:
        "Want to test a mod or disable something for a specific playthrough? You can simply disable the mod and just enable it later with one simple click.",
    }),
    bullets: [
      translate({
        id: "railyard.feature.updates.bullet1",
        message: "Toggle content instantly for each run.",
      }),
      translate({
        id: "railyard.feature.updates.bullet2",
        message: "Try new combinations without risk.",
      }),
      translate({
        id: "railyard.feature.updates.bullet3",
        message: "Keep stable setups ready whenever you want.",
      }),
    ],
  },
];

const WORKFLOW_STOPS = [
  {
    id: "find",
    title: translate({ id: "railyard.workflow.find.title", message: "Find" }),
    desc: translate({
      id: "railyard.workflow.find.desc",
      message: "Browse curated maps and mods from the community.",
    }),
  },
  {
    id: "install",
    title: translate({ id: "railyard.workflow.install.title", message: "Install" }),
    desc: translate({
      id: "railyard.workflow.install.desc",
      message: "Choose what you want and install it quickly.",
    }),
  },
  {
    id: "manage",
    title: translate({ id: "railyard.workflow.manage.title", message: "Manage" }),
    desc: translate({
      id: "railyard.workflow.manage.desc",
      message: "Enable or disable content anytime for each playthrough.",
    }),
  },
];

const DATA_SOURCES = {
  mods: "https://raw.githubusercontent.com/Subway-Builder-Modded/The-Railyard/refs/heads/main/mods/index.json",
  maps: "https://raw.githubusercontent.com/Subway-Builder-Modded/The-Railyard/refs/heads/main/maps/index.json",
};

export default function Railyard() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [nativeOS, setNativeOS] = useState(ALL_DOWNLOADS[0]);

  const downloadCatalog = useMemo(() => getDownloadCatalog(), []);
  const [selectedOS, setSelectedOS] = useState(downloadCatalog[0]?.os || "Windows");

  const [activeFeature, setActiveFeature] = useState(FEATURES[0].id);
  const [activeStop, setActiveStop] = useState(WORKFLOW_STOPS[0].id);

  const [mapCount, setMapCount] = useState(null);
  const [modCount, setModCount] = useState(null);

  const dropdownRef = useRef(null);

  useEffect(() => {
    const root = document.documentElement;
    let ticking = false;

    root.style.setProperty("--railyard-zoom", "0");
    root.style.setProperty("--railyard-exposure", "0");

    const updateScroll = () => {
      const scrollPos = window.scrollY;
      const threshold = 140;
      const zoomVal = Math.max(0, scrollPos - threshold);
      const exposureVal = Math.min(1, scrollPos / 560);

      root.style.setProperty("--railyard-zoom", zoomVal.toString());
      root.style.setProperty("--railyard-exposure", exposureVal.toString());
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScroll);
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    updateScroll();

    const checkTheme = () => {
      setIsDark(document.documentElement.getAttribute("data-theme") === "dark");
    };
    checkTheme();

    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true });

    const detect = async () => {
      const match = await detectNativeDownload();
      setNativeOS(match);
      setSelectedOS(match.os);
      
    };

    const fetchCount = async (url, key, setValue) => {
      try {
        const response = await fetch(url);
        if (!response.ok) return;
        const data = await response.json();

        if (data && Array.isArray(data[key])) {
          setValue(data[key].length);
          return;
        }

        // fallback safety
        if (Array.isArray(data)) setValue(data.length);
      } catch {
        // no-op fallback
      }
    };

    detect();
    fetchCount(DATA_SOURCES.maps, "maps", setMapCount);
    fetchCount(DATA_SOURCES.mods, "mods", setModCount);

    const closeMenu = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", closeMenu);

    return () => {
      window.removeEventListener("scroll", onScroll);
      observer.disconnect();
      document.removeEventListener("mousedown", closeMenu);
    };
  }, []);

  const selectedDownloads = useMemo(
    () => ALL_DOWNLOADS.filter((d) => d.os === selectedOS),
    [selectedOS],
  );

  const heroBg = isDark ? "/images/railyard-home-dark.png" : "/images/railyard-home-light.png";
  const mapCountLabel = mapCount == null ? "—" : mapCount.toLocaleString();
  const modCountLabel = modCount == null ? "—" : modCount.toLocaleString();

  return (
    <Layout
      title={translate({ message: "Railyard" })}
      description={translate({
        message:
          "The all-in-one tool for downloading and managing your Subway Builder mods and cities.",
      })}
    >
      <div className={styles.fixedBgContainer}>
        <img src={heroBg} className={styles.fixedBgImage} alt="" />
        <div className={styles.heroOverlay} />
        <div className={styles.greenTint} />
        <div className={styles.fixedBgOverlay} />
        <div className={styles.colorEffect} />
      </div>

      <main className={styles.pageWrapper}>
        <section className={styles.heroSection}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>
              <Translate id="railyard.hero.title">Railyard</Translate>
            </h1>

            <p className={styles.heroSubtitle}>
              <Translate id="railyard.hero.subtitle">
                The easiest way to discover, install, and manage Subway Builder community content.
              </Translate>
            </p>

            <div className={styles.heroButtonGroup} ref={dropdownRef}>
              <Link to={nativeOS.link} className={styles.mainDownloadButton}>
                <Translate id="railyard.hero.downloadButton" values={{ platform: nativeOS.label }}>
                  {"Download for {platform}"}
                </Translate>
              </Link>

              <button
                type="button"
                className={styles.dropdownToggle}
                onClick={() => setMenuOpen((v) => !v)}
                aria-label={translate({
                  id: "railyard.hero.morePlatforms",
                  message: "More Platforms",
                })}
              >
                <svg
                  width="12"
                  height="7"
                  viewBox="0 0 14 8"
                  fill="none"
                  className={menuOpen ? styles.rotated : ""}
                >
                  <path
                    d="M1 1L7 7L13 1"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              {menuOpen && (
                <div className={styles.heroDropdownMenu}>
                  {ALL_DOWNLOADS.map((dl) => (
                    <Link key={dl.label} to={dl.link} className={styles.dropdownItem}>
                      {dl.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className={styles.heroStatsStrip}>
              <Link to="/railyard/maps" className={styles.statPillLink}>
                <article className={styles.statPill}>
                  <span className={styles.statValue}>{mapCountLabel}</span>
                  <span className={styles.statLabel}>
                    <Translate id="railyard.stats.maps">Maps Available</Translate>
                  </span>
                </article>
              </Link>

              <Link to="/railyard/mods" className={styles.statPillLink}>
                <article className={styles.statPill}>
                  <span className={styles.statValue}>{modCountLabel}</span>
                  <span className={styles.statLabel}>
                    <Translate id="railyard.stats.mods">Mods Available</Translate>
                  </span>
                </article>
              </Link>
            </div>
          </div>
        </section>

        <section className={styles.spacerSection} aria-hidden="true" />
        <div className={styles.sectionSeparator} />

        <section className={styles.solidSection}>
          <div className={styles.container}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                <Translate id="railyard.features.header">Features</Translate>
              </h2>
              <span className={styles.headerLine} />
            </div>

            <div className={styles.routeBoard}>
              {FEATURES.map((feature) => {
                const active = activeFeature === feature.id;
                return (
                  <article
                    key={feature.id}
                    className={`${styles.routeCard} ${active ? styles.routeCardActive : ""}`}
                    onMouseEnter={() => setActiveFeature(feature.id)}
                    onFocus={() => setActiveFeature(feature.id)}
                    tabIndex={0}
                  >
                    <div
                      className={styles.routeNode}
                      style={{ background: feature.color, color: feature.textColor }}
                    >
                      {feature.letter}
                    </div>
                    <div className={styles.routeContent}>
                      <h3 className={styles.cardTitle}>{feature.title}</h3>
                      <p className={styles.cardDesc}>{feature.desc}</p>
                      <ul className={styles.featureBullets}>
                        {feature.bullets.map((bullet) => (
                          <li key={bullet}>{bullet}</li>
                        ))}
                      </ul>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className={styles.spacerSection} aria-hidden="true" />
        <div className={styles.sectionSeparator} />

        <section className={styles.solidSection}>
          <div className={styles.container}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                <Translate id="railyard.workflow.header">
                  From Download to Play in Three Stops
                </Translate>
              </h2>
              <span className={styles.headerLine} />
            </div>

            <div className={styles.workflowTrack}>
              {WORKFLOW_STOPS.map((stop) => {
                const active = activeStop === stop.id;
                return (
                  <button
                    key={stop.id}
                    type="button"
                    className={`${styles.workflowStop} ${active ? styles.workflowStopActive : ""}`}
                    onMouseEnter={() => setActiveStop(stop.id)}
                    onFocus={() => setActiveStop(stop.id)}
                    onClick={() => setActiveStop(stop.id)}
                  >
                    <h3>{stop.title}</h3>
                    <p>{stop.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <section className={styles.spacerSection} aria-hidden="true" />
        <div className={styles.sectionSeparator} />

        <section className={styles.solidSection} id="all-downloads">
          <div className={styles.container}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                <Translate id="railyard.downloads.header">All Downloads</Translate>
              </h2>
              <span className={styles.headerLine} />
            </div>

            <div className={styles.downloadsPanel}>
              <div className={styles.downloadsSplitCard}>
                <div className={styles.downloadsLeftColumn}>
                  {downloadCatalog.map((group) => (
                    <button
                      key={group.os}
                      type="button"
                      className={`${styles.osTab} ${selectedOS === group.os ? styles.osTabActive : ""}`}
                      onClick={() => setSelectedOS(group.os)}
                    >
                      {group.os}
                    </button>
                  ))}
                </div>

                <div className={styles.downloadsRightColumn}>
                  {selectedDownloads.map((dl) => {
                    const isNative = dl.label === nativeOS.label;
                    return (
                      <Link
                        key={dl.label}
                        to={dl.link}
                        className={`${styles.longDownloadButton} ${isNative ? styles.activeDownload : ""}`}
                      >
                        <span>
                          {dl.label}
                          {isNative && (
                            <span className={styles.currentBadge}>
                              <Translate id="railyard.downloads.detected">Detected</Translate>
                            </span>
                          )}
                          <span className={styles.downloadMeta}>{` ${dl.type} · ${dl.size}`}</span>
                        </span>
                        <span className={styles.buttonArrow}>→</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <footer className={styles.footerBars}>
            <span className={styles.bar} style={{ background: "#0039A6" }} />
            <span className={styles.bar} style={{ background: "#FF6319" }} />
            <span className={styles.bar} style={{ background: "#00933C" }} />
            <span className={styles.bar} style={{ background: "#FCCC0A" }} />
            <span className={styles.bar} style={{ background: "#752F82" }} />
          </footer>
        </section>
      </main>
    </Layout>
  );
}
