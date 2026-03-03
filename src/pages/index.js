import React, { useEffect, useState } from "react";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";
import { translate } from "@docusaurus/Translate";
import styles from "../css/index.module.css";

const HOMEPAGE_ITEMS = [
  {
    id: "directory",
    letter: "M",
    bullet: "#9A662F",
    title: translate({
      id: "homepage.directory.title",
      message: "Wiki Overview",
    }),
    description: translate({
      id: "homepage.directory.description",
      message: "Explore the new unified wiki and find the right docs section quickly.",
    }),
    href: "/wiki/home",
  },
  {
    id: "install",
    letter: "I",
    bullet: "#000000",
    title: translate({
      id: "homepage.install.title",
      message: "Installing Maps",
    }),
    description: translate({
      id: "homepage.install.description",
      message:
        "Step-by-step guide to installing custom maps using Kronifer's Map Patcher.",
    }),
    href: "/wiki/legacy/map-installation-guide",
  },
  {
    id: "create",
    letter: "C",
    bullet: "#0036A7",
    title: translate({
      id: "homepage.create.title",
      message: "Creating Custom Maps",
    }),
    description: translate({
      id: "homepage.create.description",
      message:
        "Step-by-step workflow for generating, packaging, and shipping custom maps.",
    }),
    href: "/wiki/creating-custom-maps/making-custom-maps",
  },
  {
    id: "updates",
    letter: "U",
    bullet: "#0C493B",
    title: translate({
      id: "homepage.updates.title",
      message: "Updates & Changelogs",
    }),
    description: translate({
      id: "homepage.updates.description",
      message:
        "Stay up to date with new releases from the Subway Builder Modded Team.",
    }),
    href: "/updates",
  },
  {
    id: "modding",
    letter: "D",
    bullet: "#FF6312",
    title: translate({
      id: "homepage.modding.title",
      message: "Template Mod Docs",
    }),
    description: translate({
      id: "homepage.modding.description",
      message: "Build your own mods using our Mod Template.",
    }),
    href: "/wiki/template-mod/getting-started",
  },
];

function useHeroZoom() {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const onScroll = () =>
      setScale(Math.min(1 + window.scrollY * 0.0004, 1.25));
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return scale;
}

function useThemeImage(light, dark) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkTheme = () =>
      setIsDark(
        document.documentElement.getAttribute("data-theme") === "dark"
      );

    checkTheme();

    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true });

    return () => observer.disconnect();
  }, []);

  return isDark ? dark : light;
}

export default function Home() {
  const heroScale = useHeroZoom();
  const heroBg = useThemeImage(
    "/images/home-light.png",
    "/images/home-dark.png"
  );

  return (
    <Layout
      description={translate({
        id: "homepage.meta.description",
        message:
          "The complete hub for everything modded in Subway Builder.",
      })}
    >
      <section className={styles.hero}>
        <img
          src={heroBg}
          alt="Hero Background"
          className={styles.heroBackground}
          style={{ transform: `scale(${heroScale})` }}
        />
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            {translate({
              id: "homepage.hero.title",
              message: "Subway Builder Modded",
            })}
          </h1>
          <p className={styles.heroSubtitle}>
            {translate({
              id: "homepage.hero.subtitle",
              message:
                "The complete hub for everything modded in Subway Builder.",
            })}
          </p>
        </div>
      </section>

      <section className={styles.cardSection}>
        <div className={styles.cardGrid}>
          {HOMEPAGE_ITEMS.map((item) => (
            <Link key={item.id} to={item.href} className={styles.card}>
              <div className={styles.cardHeader}>
                <div
                  className={styles.lineBullet}
                  style={{ background: item.bullet }}
                >
                  {item.letter}
                </div>
                <h3 className={styles.cardTitle}>
                  {item.title}
                </h3>
              </div>
              <p className={styles.cardDesc}>
                {item.description}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <footer className={styles.footerBars}>
        <span className={styles.bar} style={{ background: "#0039A6" }} />
        <span className={styles.bar} style={{ background: "#FF6319" }} />
        <span className={styles.bar} style={{ background: "#00933C" }} />
        <span className={styles.bar} style={{ background: "#FCCC0A" }} />
        <span className={styles.bar} style={{ background: "#752F82" }} />
      </footer>
    </Layout>
  );
}
