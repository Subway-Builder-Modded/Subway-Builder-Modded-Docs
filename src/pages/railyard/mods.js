import React, { useEffect, useMemo, useState } from "react";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";
import { translate } from "@docusaurus/Translate";
import styles from "../../css/railyardMods.module.css";
import sharedStyles from "../../css/railyardShared.module.css";
import {
  compareValues,
  flattenRecord,
  formatTagLabel,
  getFirstValue,
  getTitle,
  normalizeImageList,
} from "../../helpers/railyardHelpers";

const SOURCE = {
  type: "mods",
  indexUrl:
    "https://raw.githubusercontent.com/Subway-Builder-Modded/The-Railyard/main/mods/index.json",
};

const PAGE_SIZES = [12, 24, 48];

const SORT_CONFIG = {
  name: {
    value: (item) => item.title,
    defaultDirection: "asc",
  },
  id: {
    value: (item) => item.id,
    defaultDirection: "asc",
  },
};

function getSortValue(sortBy) {
  const [column, direction] = sortBy.split("-");
  const config = SORT_CONFIG[column] || SORT_CONFIG.name;
  const sortDirection = direction || config.defaultDirection;
  return {
    getValue: config.value,
    descending: sortDirection === "desc",
  };
}

function MapPinPlaceholder() {
  return (
    <div className={styles.noImage}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="40"
        height="40"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1 1 16 0Z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    </div>
  );
}

function GalleryImage({ candidates, alt, className }) {
  const [candidateIndex, setCandidateIndex] = useState(0);

  useEffect(() => {
    setCandidateIndex(0);
  }, [candidates]);

  if (candidateIndex >= candidates.length) {
    return <MapPinPlaceholder />;
  }

  return (
    <img
      src={candidates[candidateIndex]}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => setCandidateIndex((current) => current + 1)}
    />
  );
}

export default function RailyardModsPage() {
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [sortBy, setSortBy] = useState("name-asc");
  const [pageSize, setPageSize] = useState(24);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [imageIndexById, setImageIndexById] = useState({});
  const [pendingFocusId, setPendingFocusId] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError("");

      try {
        const indexResponse = await fetch(SOURCE.indexUrl);
        if (!indexResponse.ok) {
          throw new Error(
            translate({
              id: "railyard.mods.error.registry",
              message: "Unable to load mods registry.",
            }),
          );
        }
        const indexData = await indexResponse.json();
        const idsRaw = Array.isArray(indexData) ? indexData : indexData[SOURCE.type] || [];

        const ids = idsRaw
          .map((entry) => {
            if (typeof entry === "string") return entry;
            return entry?.id || entry?.slug || entry?.name || null;
          })
          .filter(Boolean);

        const loadedItems = await Promise.all(
          ids.map(async (id) => {
            const manifestUrl = `https://raw.githubusercontent.com/Subway-Builder-Modded/The-Railyard/main/mods/${id}/manifest.json`;
            try {
              const response = await fetch(manifestUrl);
              if (!response.ok) return null;
              const manifest = await response.json();
              return {
                id,
                title: getTitle(manifest, id),
                description:
                  getFirstValue(manifest, "description") ||
                  translate({
                    id: "railyard.mods.noDescription",
                    message: "No description provided.",
                  }),
                tags: getFirstValue(manifest, "tags"),
                author:
                  getFirstValue(manifest, "author") ||
                  translate({
                    id: "railyard.mods.unknownAuthor",
                    message: "Unknown",
                  }),
                images: normalizeImageList(manifest, SOURCE.type, id),
                fields: flattenRecord(manifest),
              };
            } catch {
              return null;
            }
          }),
        );

        if (!cancelled) {
          setItems(loadedItems.filter(Boolean));
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : translate({
                  id: "railyard.mods.error.unknown",
                  message: "Unknown loading error.",
                }),
          );
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const allTags = useMemo(() => {
    const tagSet = new Set();
    items.forEach((item) => item.tags.forEach((tag) => tagSet.add(tag)));
    return Array.from(tagSet).sort((a, b) => a.localeCompare(b));
  }, [items]);

  const filtered = useMemo(() => {
    const lowered = query.trim().toLowerCase();

    const searched = items.filter((item) => {
      if (!lowered) return true;
      const haystack = [
        item.id,
        item.title,
        item.description,
        item.author,
        item.tags.join("-"),
        item.fields.map((field) => `${field.key} ${field.value}`).join("-"),
      ]
        .join("-")
        .toLowerCase();
      return haystack.includes(lowered);
    });

    const tagFiltered = searched.filter((item) =>
      selectedTags.length === 0 ? true : selectedTags.every((tag) => item.tags.includes(tag)),
    );

    return tagFiltered.sort((a, b) => {
      const { getValue, descending } = getSortValue(sortBy);
      const comparison = compareValues(getValue(a), getValue(b));
      return descending ? -comparison : comparison;
    });
  }, [items, query, selectedTags, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  useEffect(() => {
    setPage(1);
  }, [query, sortBy, pageSize]);

  useEffect(() => {
    if (!pendingFocusId) return;
    requestAnimationFrame(() => {
      const target = document.querySelector(`[data-card-id="${pendingFocusId}"]`);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      setPendingFocusId(null);
    });
  }, [pendingFocusId, paginated]);

  function toggleTag(tag) {
    setSelectedTags((current) =>
      current.includes(tag) ? current.filter((value) => value !== tag) : [...current, tag],
    );
  }

  function cycleImage(id, direction, max) {
    setImageIndexById((current) => {
      const start = current[id] || 0;
      const next = (start + direction + max) % max;
      return { ...current, [id]: next };
    });
  }

  function renderPagination(isTop = false) {
    if (totalPages <= 1) return null;

    return (
      <nav
        className={`${styles.pagination} ${sharedStyles.pagination} ${isTop ? styles.paginationTop : ""}`}
      >
        <button
          type="button"
          disabled={safePage <= 1}
          onClick={() => setPage((value) => Math.max(1, value - 1))}
        >
          {translate({ id: "railyard.mods.previous", message: "Back" })}
        </button>
        <span>
          {translate(
            {
              id: "railyard.mods.pageCounter",
              message: "Page {page} of {totalPages}",
            },
            { page: safePage, totalPages },
          )}
        </span>
        <button
          type="button"
          disabled={safePage >= totalPages}
          onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
        >
          {translate({ id: "railyard.mods.next", message: "Next" })}
        </button>
      </nav>
    );
  }

  return (
    <Layout
      title={translate({ id: "railyard.mods.layoutTitle", message: "Railyard Mods" })}
      description={translate({
        id: "railyard.mods.layoutDescription",
        message: "Browse community Subway Builder mods from Railyard.",
      })}
    >
      <main className={styles.page}>
        <Link to="/railyard" className={styles.back}>
          &larr; {translate({ id: "railyard.mods.back", message: "Back" })}
        </Link>

        <section className={styles.hero}>
          <h1>{translate({ id: "railyard.mods.heading", message: "Railyard Mods" })}</h1>
          <p>
            {translate({
              id: "railyard.mods.subtitle",
              message:
                "Search, sort, filter, and browse community mods directly from the registry.",
            })}
          </p>
          <Link to="/railyard/maps" className={styles.switchLink}>
            {translate({ id: "railyard.mods.switchToMaps", message: "Browse Maps" })} →
          </Link>
        </section>

        <section className={styles.controls}>
          <input
            type="search"
            className={styles.search}
            placeholder={translate({
              id: "railyard.mods.searchPlaceholder",
              message: "Search by name, author, tags, IDs, or any manifest field...",
            })}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />

          <div className={styles.controlRow}>
            <label>
              {translate({ id: "railyard.mods.sortBy", message: "Sort by" })}
              <select
                className={sharedStyles.select}
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
              >
                <option value="name-asc">
                  {translate({ id: "railyard.mods.sort.nameAsc", message: "Name (A → Z)" })}
                </option>
                <option value="name-desc">
                  {translate({ id: "railyard.mods.sort.nameDesc", message: "Name (Z → A)" })}
                </option>
                <option value="id-asc">
                  {translate({ id: "railyard.mods.sort.idAsc", message: "ID (A → Z)" })}
                </option>
                <option value="id-desc">
                  {translate({ id: "railyard.mods.sort.idDesc", message: "ID (Z → A)" })}
                </option>
              </select>
            </label>

            <label>
              {translate({ id: "railyard.mods.cardsPerPage", message: "Cards per page" })}
              <select
                className={sharedStyles.select}
                value={pageSize}
                onChange={(event) => setPageSize(Number(event.target.value))}
              >
                {PAGE_SIZES.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className={styles.tags}>
            {allTags.map((tag) => {
              const active = selectedTags.includes(tag);
              return (
                <button
                  type="button"
                  key={tag}
                  className={`${styles.tagButton} ${active ? styles.tagButtonActive : ""}`}
                  onClick={() => toggleTag(tag)}
                >
                  {formatTagLabel(tag)}
                </button>
              );
            })}
          </div>
        </section>

        {renderPagination(true)}

        {isLoading && (
          <p className={styles.status}>
            {translate({ id: "railyard.mods.loading", message: "Loading mod manifests…" })}
          </p>
        )}
        {error && <p className={styles.error}>{error}</p>}

        <section className={styles.grid}>
          {paginated.map((item) => {
            const imageIndex = imageIndexById[item.id] || 0;
            const activeImage = item.images[imageIndex] || [];

            return (
              <article key={item.id} className={styles.card} data-card-id={item.id}>
                <header className={styles.cardHeader}>
                  <h2>{item.title}</h2>
                  <span className={styles.cardId}>{item.id}</span>
                </header>

                <div className={styles.carousel}>
                  {activeImage.length > 0 ? (
                    <GalleryImage
                      candidates={activeImage}
                      alt={`${item.title} preview`}
                      className={styles.previewImage}
                    />
                  ) : (
                    <MapPinPlaceholder />
                  )}
                  {item.images.length > 1 && (
                    <>
                      <button
                        type="button"
                        aria-label={translate({
                          id: "railyard.mods.prevImage",
                          message: "Previous image",
                        })}
                        className={`${styles.carouselButton} ${styles.carouselPrev}`}
                        onClick={() => cycleImage(item.id, -1, item.images.length)}
                      >
                        ‹
                      </button>
                      <button
                        type="button"
                        aria-label={translate({
                          id: "railyard.mods.nextImage",
                          message: "Next image",
                        })}
                        className={`${styles.carouselButton} ${styles.carouselNext}`}
                        onClick={() => cycleImage(item.id, 1, item.images.length)}
                      >
                        ›
                      </button>
                    </>
                  )}
                </div>

                <p className={styles.description}>{item.description}</p>

                <div className={styles.metaRow}>
                  <p className={styles.metaLine}>
                    <strong>{translate({ id: "railyard.mods.author", message: "Author" })}:</strong>{" "}
                    <span className={styles.metaValue}>{String(item.author)}</span>
                  </p>
                </div>

                <div className={styles.tagRow}>
                  {item.tags.map((tag) => (
                    <button
                      type="button"
                      key={`${item.id}-${tag}`}
                      className={styles.cardTag}
                      onClick={() => {
                        setPendingFocusId(item.id);
                        toggleTag(tag);
                      }}
                    >
                      {formatTagLabel(tag)}
                    </button>
                  ))}
                </div>

                <details className={styles.details}>
                  <summary>
                    {translate({ id: "railyard.mods.allFields", message: "All manifest fields" })}
                  </summary>
                  <dl>
                    {item.fields.map((field) => (
                      <div key={`${item.id}-${field.key}`} className={styles.fieldRow}>
                        <dt>{field.key}</dt>
                        <dd>{field.value}</dd>
                      </div>
                    ))}
                  </dl>
                </details>
              </article>
            );
          })}
        </section>

        {renderPagination()}

        <footer className={styles.footerBars}>
          <span className={styles.bar} style={{ background: "#0039A6" }} />
          <span className={styles.bar} style={{ background: "#FF6319" }} />
          <span className={styles.bar} style={{ background: "#00933C" }} />
          <span className={styles.bar} style={{ background: "#FCCC0A" }} />
          <span className={styles.bar} style={{ background: "#752F82" }} />
        </footer>
      </main>
    </Layout>
  );
}
