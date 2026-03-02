import React, { useEffect, useMemo, useState } from "react";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";
import { translate } from "@docusaurus/Translate";
import sharedStyles from "../../css/railyardShared.module.css";
import {
  buildManifestUrl,
  compareValues,
  fetchUpdatedAt,
  flattenRecord,
  formatUpdatedDate,
  getFirstValue,
  getTitle,
  normalizeImageList,
  normalizeTags,
  PAGE_SIZES,
  ALL_DOWNLOADS,
  detectNativeDownload,
  CARD_POPUP_ENABLED,
} from "../../helpers/railyardHelpers";
import {
  DownloadInAppModal,
  ExpandableMarkdown,
  GalleryImage,
  MapPinPlaceholder,
  PaginationNav,
  getSortValue,
} from "../../helpers/railyardCatalogHelpers";

const SOURCE = {
  type: "mods",
  indexUrl:
    "https://raw.githubusercontent.com/Subway-Builder-Modded/The-Railyard/main/mods/index.json",
};

const SORT_CONFIG = {
  name: { value: (item) => item.title, defaultDirection: "asc" },
  updated: { value: (item) => item.updatedAtDate, defaultDirection: "desc" },
  id: { value: (item) => item.id, defaultDirection: "asc" },
};

const SPOTLIGHT_MOD_IDS = [
  // Add mod IDs here to spotlight them at the top of the list.
  "subwaybuilder-regions",
];
const SPOTLIGHT_MOD_ID_SET = new Set(SPOTLIGHT_MOD_IDS);

export default function RailyardModsPage() {
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [sortBy, setSortBy] = useState("updated-desc");
  const [pageSize, setPageSize] = useState(12);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [imageIndexById, setImageIndexById] = useState({});
  const [pendingFocusId, setPendingFocusId] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [nativeDownload, setNativeDownload] = useState(ALL_DOWNLOADS[0]);

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
          .map((entry) =>
            typeof entry === "string" ? entry : entry?.id || entry?.slug || entry?.name || null,
          )
          .filter(Boolean);

        const loadedItems = await Promise.all(
          ids.map(async (id) => {
            try {
              const response = await fetch(buildManifestUrl(SOURCE.type, id));
              if (!response.ok) return null;
              const manifest = await response.json();
              const updatedAt = await fetchUpdatedAt(SOURCE.type, id);
              const updatedAtDate = updatedAt ? new Date(updatedAt) : null;

              return {
                id,
                title: getTitle(manifest, id),
                description:
                  getFirstValue(manifest, "description") ||
                  translate({
                    id: "railyard.mods.noDescription",
                    message: "No description provided.",
                  }),
                tags: normalizeTags(manifest),
                author:
                  getFirstValue(manifest, "author") ||
                  translate({ id: "railyard.mods.unknownAuthor", message: "Unknown" }),
                updatedAt,
                updatedAtDate,
                images: normalizeImageList(manifest, SOURCE.type, id),
                fields: flattenRecord(manifest),
              };
            } catch {
              return null;
            }
          }),
        );

        if (!cancelled) setItems(loadedItems.filter(Boolean));
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : translate({ id: "railyard.mods.error.unknown", message: "Unknown loading error." }),
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
        item.updatedAt,
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

    const sorted = [...tagFiltered].sort((a, b) => {
      const { getValue, descending } = getSortValue(sortBy, SORT_CONFIG);
      const comparison = compareValues(getValue(a), getValue(b));
      return descending ? -comparison : comparison;
    });

    const spotlighted = [];
    const regular = [];

    sorted.forEach((item) => {
      if (SPOTLIGHT_MOD_ID_SET.has(item.id)) {
        spotlighted.push(item);
        return;
      }
      regular.push(item);
    });

    return [...spotlighted, ...regular];
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
      if (target) target.scrollIntoView({ behavior: "smooth", block: "center" });
      setPendingFocusId(null);
    });
  }, [pendingFocusId, paginated]);

  useEffect(() => {
    if (!CARD_POPUP_ENABLED) return undefined;

    let cancelled = false;

    async function detectDownload() {
      const detected = await detectNativeDownload();
      if (!cancelled) setNativeDownload(detected);
    }

    detectDownload();
    return () => {
      cancelled = true;
    };
  }, []);

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

  return (
    <Layout
      title={translate({ id: "railyard.mods.layoutTitle", message: "Railyard Mods" })}
      description={translate({
        id: "railyard.mods.layoutDescription",
        message: "Browse community Subway Builder mods from Railyard.",
      })}
    >
      <main className={sharedStyles.page}>
        <Link to="/railyard" className={sharedStyles.back}>
          &larr; {translate({ id: "railyard.mods.back", message: "Back" })}
        </Link>

        <section className={sharedStyles.hero}>
          <p className={sharedStyles.heroEyebrow}>
            {translate({ id: "railyard.mods.eyebrow", message: "Railyard registry" })}
          </p>
          <h1 className={sharedStyles.heroHeading}>
            {translate({ id: "railyard.mods.heading", message: "Railyard Mods" })}
          </h1>
          <p className={sharedStyles.heroDescription}>
            {translate({
              id: "railyard.mods.subtitle",
              message:
                "Explore community mods, filter by tags, and surface the latest updates first.",
            })}
          </p>
          <Link to="/railyard/maps" className={sharedStyles.switchLink}>
            {translate({ id: "railyard.mods.switchToMaps", message: "Switch to Maps" })} →
          </Link>
        </section>

        <section className={sharedStyles.controls}>
          <input
            type="search"
            className={sharedStyles.search}
            placeholder={translate({
              id: "railyard.mods.searchPlaceholder",
              message: "Search by name, author, tags, IDs, or any manifest field...",
            })}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />

          <div className={sharedStyles.controlRow}>
            <label className={sharedStyles.controlLabel}>
              {translate({ id: "railyard.mods.sortBy", message: "Sort By" })}
              <select
                className={sharedStyles.select}
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
              >
                <option value="updated-desc">
                  {translate({ id: "railyard.mods.sort.updatedDesc", message: "Recently Updated" })}
                </option>
                <option value="updated-asc">
                  {translate({ id: "railyard.mods.sort.updatedAsc", message: "Oldest Updated" })}
                </option>
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

            <label className={sharedStyles.controlLabel}>
              {translate({ id: "railyard.mods.cardsPerPage", message: "Cards Per Page" })}
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

          <div className={sharedStyles.tags}>
            {allTags.map((tag) => {
              const active = selectedTags.includes(tag);
              return (
                <button
                  type="button"
                  key={tag}
                  className={`${sharedStyles.tagButton} ${active ? sharedStyles.tagButtonActive : ""}`}
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </section>

        <PaginationNav
          styles={sharedStyles}
          isTop
          safePage={safePage}
          totalPages={totalPages}
          onPrev={() => setPage((value) => Math.max(1, value - 1))}
          onNext={() => setPage((value) => Math.min(totalPages, value + 1))}
          prefix="railyard.mods"
        />

        {isLoading && (
          <p className={sharedStyles.status}>
            {translate({ id: "railyard.mods.loading", message: "Loading mod manifests…" })}
          </p>
        )}
        {error && <p className={sharedStyles.error}>{error}</p>}

        <section className={sharedStyles.grid}>
          {paginated.map((item) => {
            const imageIndex = imageIndexById[item.id] || 0;
            const activeImage = item.images[imageIndex] || [];
            const isSpotlighted = SPOTLIGHT_MOD_ID_SET.has(item.id);

            return (
              <article
                key={item.id}
                className={`${sharedStyles.card} ${isSpotlighted ? sharedStyles.cardSpotlight : ""}`}
                data-card-id={item.id}
              >
                <header className={sharedStyles.cardHeader}>
                  {isSpotlighted && (
                    <img
                      src="/assets/spotlight.svg"
                      alt={translate({ id: "railyard.mods.spotlighted", message: "Spotlighted" })}
                      className={sharedStyles.spotlightIcon}
                    />
                  )}
                  {CARD_POPUP_ENABLED ? (
                    <button
                      type="button"
                      className={sharedStyles.itemTitleButton}
                      onClick={() => setSelectedItem(item)}
                    >
                      {item.title}
                    </button>
                  ) : (
                    <span className={sharedStyles.itemTitleText}>{item.title}</span>
                  )}
                  <span className={sharedStyles.cardId}>{item.id}</span>
                </header>
                <p className={sharedStyles.updatedText}>
                  {translate({ id: "railyard.mods.updated", message: "Updated" })}:{" "}
                  {formatUpdatedDate(item.updatedAt) ||
                    translate({ id: "railyard.mods.updatedUnknown", message: "Unknown" })}
                </p>

                <div className={sharedStyles.carousel}>
                  {activeImage.length > 0 ? (
                    <GalleryImage
                      candidates={activeImage}
                      alt={`${item.title} preview`}
                      className={sharedStyles.previewImage}
                      placeholderClassName={sharedStyles.noImage}
                    />
                  ) : (
                    <MapPinPlaceholder className={sharedStyles.noImage} />
                  )}
                  {item.images.length > 1 && (
                    <>
                      <button
                        type="button"
                        aria-label={translate({
                          id: "railyard.mods.prevImage",
                          message: "Previous image",
                        })}
                        className={`${sharedStyles.carouselButton} ${sharedStyles.carouselPrev}`}
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
                        className={`${sharedStyles.carouselButton} ${sharedStyles.carouselNext}`}
                        onClick={() => cycleImage(item.id, 1, item.images.length)}
                      >
                        ›
                      </button>
                    </>
                  )}
                </div>

                <ExpandableMarkdown
                  text={item.description}
                  styles={sharedStyles}
                  readMoreId="railyard.mods.description"
                />
                <p className={sharedStyles.metaLine}>
                  <strong>{translate({ id: "railyard.mods.author", message: "Author" })}:</strong>{" "}
                  <span className={sharedStyles.metaValue}>{String(item.author)}</span>
                </p>

                <div className={sharedStyles.tagRow}>
                  {item.tags.map((tag) => (
                    <button
                      type="button"
                      key={`${item.id}-${tag}`}
                      className={sharedStyles.cardTag}
                      onClick={() => {
                        setPendingFocusId(item.id);
                        toggleTag(tag);
                      }}
                    >
                      {tag}
                    </button>
                  ))}
                </div>

                <details className={sharedStyles.details}>
                  <summary className={sharedStyles.fieldsSummary}>
                    <span>
                      {translate({ id: "railyard.mods.allFields", message: "All Manifest Fields" })}
                    </span>
                    <span className={sharedStyles.fieldsSummaryArrow} aria-hidden="true">
                      ▾
                    </span>
                  </summary>
                  <dl>
                    {item.fields.map((field) => (
                      <div key={`${item.id}-${field.key}`} className={sharedStyles.fieldRow}>
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

        <PaginationNav
          styles={sharedStyles}
          safePage={safePage}
          totalPages={totalPages}
          onPrev={() => setPage((value) => Math.max(1, value - 1))}
          onNext={() => setPage((value) => Math.min(totalPages, value + 1))}
          prefix="railyard.mods"
        />

        <footer className={sharedStyles.footerBars}>
          <span className={sharedStyles.bar} style={{ background: "#0039A6" }} />
          <span className={sharedStyles.bar} style={{ background: "#FF6319" }} />
          <span className={sharedStyles.bar} style={{ background: "#00933C" }} />
          <span className={sharedStyles.bar} style={{ background: "#FCCC0A" }} />
          <span className={sharedStyles.bar} style={{ background: "#752F82" }} />
        </footer>

        {CARD_POPUP_ENABLED && (
          <DownloadInAppModal
            styles={sharedStyles}
            selectedItem={selectedItem}
            nativeDownload={nativeDownload}
            onClose={() => setSelectedItem(null)}
          />
        )}
      </main>
    </Layout>
  );
}
