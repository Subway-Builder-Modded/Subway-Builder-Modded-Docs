import React, { useEffect, useState } from "react";
import Link from "@docusaurus/Link";
import { translate } from "@docusaurus/Translate";
import { ALL_DOWNLOADS } from "./railyardHelpers";

export function getSortValue(sortBy, sortConfig) {
  const [column, direction] = sortBy.split("-");
  const config = sortConfig[column] || sortConfig.name;
  const sortDirection = direction || config.defaultDirection;
  return {
    getValue: config.value,
    descending: sortDirection === "desc",
  };
}

export function MapPinPlaceholder({ className, size = 42 }) {
  return (
    <div className={className}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
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

export function GalleryImage({ candidates, alt, className, placeholderClassName }) {
  const [candidateIndex, setCandidateIndex] = useState(0);

  useEffect(() => {
    setCandidateIndex(0);
  }, [candidates]);

  if (candidateIndex >= candidates.length) {
    return <MapPinPlaceholder className={placeholderClassName} />;
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

export function PaginationNav({
  styles,
  isTop = false,
  safePage,
  totalPages,
  onPrev,
  onNext,
  prefix,
}) {
  if (totalPages <= 1) return null;

  return (
    <nav className={`${styles.pagination} ${isTop ? styles.paginationTop : ""}`}>
      <button type="button" disabled={safePage <= 1} onClick={onPrev}>
        {translate({ id: `${prefix}.previous`, message: "Back" })}
      </button>
      <span>
        {translate(
          {
            id: `${prefix}.pageCounter`,
            message: "Page {page} of {totalPages}",
          },
          { page: safePage, totalPages },
        )}
      </span>
      <button type="button" disabled={safePage >= totalPages} onClick={onNext}>
        {translate({ id: `${prefix}.next`, message: "Next" })}
      </button>
    </nav>
  );
}

export function DownloadInAppModal({ styles, selectedItem, nativeDownload, onClose }) {
  const [downloadsOpen, setDownloadsOpen] = useState(false);

  useEffect(() => {
    if (!selectedItem) {
      setDownloadsOpen(false);
    }
  }, [selectedItem]);

  if (!selectedItem) return null;

  return (
    <div className={styles.modalOverlay} role="presentation" onClick={onClose}>
      <section
        className={styles.modalCard}
        role="dialog"
        aria-modal="true"
        aria-labelledby="railyard-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className={styles.modalCloseIconButton}
          aria-label={translate({ id: "railyard.shared.modal.close", message: "Close" })}
          onClick={onClose}
        >
          ×
        </button>
        <h2 id="railyard-modal-title">
          {translate({
            id: "railyard.shared.modal.title",
            message: "Open in the Railyard app",
          })}
        </h2>
        <p>
          {translate(
            {
              id: "railyard.shared.modal.description",
              message:
                "{name} is available through the Railyard app. Direct web downloads are intentionally disabled so installation stays streamlined and up to date.",
            },
            { name: selectedItem.title },
          )}
        </p>

        <div className={styles.modalActions}>
          <button
            type="button"
            className={`${styles.modalActionButton} ${styles.modalActionPrimary}`}
          >
            {translate({ id: "railyard.shared.modal.comingSoon", message: "Coming Soon" })}
          </button>
          <Link
            to={nativeDownload.link}
            className={`${styles.modalActionButton} ${styles.modalActionDownload}`}
          >
            {translate(
              {
                id: "railyard.shared.modal.downloadForPlatform",
                message: "Download for {platform}",
              },
              { platform: nativeDownload.label },
            )}
          </Link>
        </div>

        <div className={styles.modalDropdownWrap}>
          <button
            type="button"
            className={styles.modalDropdownToggle}
            aria-expanded={downloadsOpen}
            onClick={() => setDownloadsOpen((value) => !value)}
          >
            <span>
              {translate({ id: "railyard.shared.modal.moreDownloads", message: "More Downloads" })}
            </span>
            <svg
              width="12"
              height="7"
              viewBox="0 0 14 8"
              fill="none"
              className={downloadsOpen ? styles.rotated : ""}
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

          {downloadsOpen && (
            <div className={styles.modalDropdownMenu}>
              {ALL_DOWNLOADS.map((download) => (
                <Link key={download.label} to={download.link} className={styles.modalDropdownItem}>
                  {download.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
