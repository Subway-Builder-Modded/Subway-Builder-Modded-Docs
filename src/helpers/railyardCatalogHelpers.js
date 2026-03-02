import React, { useEffect, useMemo, useRef, useState } from "react";
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

function renderInlineMarkdown(text) {
  const nodes = [];
  const regex = /(\*\*([^*]+)\*\*|\*([^*]+)\*|\[([^\]]+)\]\(([^)]+)\)|`([^`]+)`)/g;
  let match;
  let last = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) {
      nodes.push(text.slice(last, match.index));
    }

    if (match[2]) {
      nodes.push(<strong key={`b-${match.index}`}>{match[2]}</strong>);
    } else if (match[3]) {
      nodes.push(<em key={`i-${match.index}`}>{match[3]}</em>);
    } else if (match[4] && match[5]) {
      nodes.push(
        <a key={`a-${match.index}`} href={match[5]} target="_blank" rel="noreferrer">
          {match[4]}
        </a>,
      );
    } else if (match[6]) {
      nodes.push(<code key={`c-${match.index}`}>{match[6]}</code>);
    }

    last = regex.lastIndex;
  }

  if (last < text.length) {
    nodes.push(text.slice(last));
  }

  return nodes;
}

function renderMarkdownBlocks(markdown) {
  const lines = String(markdown || "").split(/\r?\n/);
  const blocks = [];
  let listItems = [];

  const flushList = () => {
    if (listItems.length > 0) {
      blocks.push(
        <ul key={`ul-${blocks.length}`}>
          {listItems.map((item, index) => (
            <li key={`li-${index}`}>{renderInlineMarkdown(item)}</li>
          ))}
        </ul>,
      );
      listItems = [];
    }
  };

  lines.forEach((line) => {
    const trimmed = line.trim();

    if (!trimmed) {
      flushList();
      return;
    }

    const listMatch = trimmed.match(/^[-*]\s+(.*)$/);
    if (listMatch) {
      listItems.push(listMatch[1]);
      return;
    }

    flushList();

    const headingMatch = trimmed.match(/^#{1,3}\s+(.*)$/);
    if (headingMatch) {
      blocks.push(
        <strong key={`h-${blocks.length}`}>{renderInlineMarkdown(headingMatch[1])}</strong>,
      );
      return;
    }

    blocks.push(<span key={`p-${blocks.length}`}>{renderInlineMarkdown(trimmed)}</span>);
  });

  flushList();
  return blocks;
}

function getCompactPlatformLabel(download) {
  const osAbbreviations = {
    Windows: "Win",
    macOS: "macOS",
    Linux: "Linux",
  };
  const archAbbreviations = {
    x64: "x64",
    arm64: "ARM64",
  };

  const osShort = osAbbreviations[download.os] || download.os;
  const archShort = archAbbreviations[download.arch] || download.arch;
  return `${osShort} ${archShort}`;
}

export function ExpandableMarkdown({ text, styles, readMoreId }) {
  const [expanded, setExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const content = useMemo(() => renderMarkdownBlocks(text), [text]);
  const contentRef = useRef(null);

  useEffect(() => {
    const node = contentRef.current;
    if (!node) return;
    setIsOverflowing(node.scrollHeight > node.clientHeight + 1);
  }, [content]);

  return (
    <div>
      <div
        ref={contentRef}
        className={`${styles.description} ${expanded ? styles.descriptionExpanded : ""}`}
      >
        {content}
      </div>
      {isOverflowing && (
        <button
          type="button"
          className={styles.readMoreButton}
          onClick={() => setExpanded((value) => !value)}
        >
          {expanded
            ? translate({ id: `${readMoreId}.showLess`, message: "Show Less" })
            : translate({ id: `${readMoreId}.readMore`, message: "Read More" })}
        </button>
      )}
    </div>
  );
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
  const [isClosing, setIsClosing] = useState(false);
  const downloadGroupRef = useRef(null);
  const closeTimerRef = useRef(null);

  function handleClose() {
    setIsClosing(true);
  }

  useEffect(() => {
    if (!selectedItem) return undefined;

    document.body.classList.add(styles.modalOpenBodyLock);
    return () => {
      document.body.classList.remove(styles.modalOpenBodyLock);
    };
  }, [selectedItem, styles.modalOpenBodyLock]);

  useEffect(() => {
    if (!selectedItem) {
      setDownloadsOpen(false);
      setIsClosing(false);
      return;
    }

    setIsClosing(false);
  }, [selectedItem]);

  useEffect(
    () => () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
      document.body.classList.remove(styles.modalOpenBodyLock);
    },
    [styles.modalOpenBodyLock],
  );

  useEffect(() => {
    if (!isClosing) return undefined;

    closeTimerRef.current = window.setTimeout(() => {
      onClose();
      setDownloadsOpen(false);
      setIsClosing(false);
      closeTimerRef.current = null;
    }, 220);

    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
    };
  }, [isClosing, onClose]);

  useEffect(() => {
    function handleDocumentPointerDown(event) {
      if (!downloadGroupRef.current?.contains(event.target)) {
        setDownloadsOpen(false);
      }
    }

    document.addEventListener("pointerdown", handleDocumentPointerDown);
    return () => {
      document.removeEventListener("pointerdown", handleDocumentPointerDown);
    };
  }, []);

  if (!selectedItem) return null;

  return (
    <div
      className={`${styles.modalOverlay} ${isClosing ? styles.modalOverlayClosing : styles.modalOverlayOpen}`}
      role="presentation"
      onClick={handleClose}
    >
      <section
        className={`${styles.modalCard} ${isClosing ? styles.modalCardClosing : styles.modalCardOpen}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="railyard-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className={styles.modalCloseIconButton}
          aria-label={translate({ id: "railyard.shared.modal.close", message: "Close" })}
          onClick={handleClose}
        >
          ×
        </button>
        <h2 id="railyard-modal-title">
          {translate({
            id: "railyard.shared.modal.title",
            message: "Open In Railyard App",
          })}
        </h2>
        <p>
          {translate(
            {
              id: "railyard.shared.modal.description",
              message:
                "{name} is available through the Railyard app. You can install it directly via the app by clicking the link below.",
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

          <div className={styles.modalDownloadGroup} ref={downloadGroupRef}>
            <Link
              to={nativeDownload.link}
              className={`${styles.modalActionButton} ${styles.modalActionDownload}`}
            >
              {translate(
                {
                  id: "railyard.shared.modal.downloadForPlatformShort",
                  message: "Download {platform}",
                },
                { platform: getCompactPlatformLabel(nativeDownload) },
              )}
            </Link>
            <button
              type="button"
              className={styles.modalDownloadToggle}
              aria-label={translate({
                id: "railyard.shared.modal.moreDownloads",
                message: "More Downloads",
              })}
              aria-expanded={downloadsOpen}
              onClick={() => setDownloadsOpen((value) => !value)}
            >
              <svg
                width="12"
                height="7"
                viewBox="0 0 14 8"
                fill="none"
                className={`${styles.dropdownChevron} ${downloadsOpen ? styles.rotated : ""}`}
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

            <div
              className={`${styles.modalDropdownMenu} ${downloadsOpen ? styles.modalDropdownMenuOpen : ""} ${isClosing ? styles.modalDropdownMenuClosing : ""}`}
            >
              {ALL_DOWNLOADS.map((download) => (
                <Link
                  key={`${download.os}-${download.arch}`}
                  to={download.link}
                  className={styles.modalDropdownItem}
                >
                  {translate(
                    {
                      id: "railyard.shared.modal.downloadForPlatformShort",
                      message: "Download {platform}",
                    },
                    { platform: getCompactPlatformLabel(download) },
                  )}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
