import React, { useEffect } from "react";

function isExternalHref(href) {
  if (!href || href.startsWith("#") || href.startsWith("/") || href.startsWith("mailto:") || href.startsWith("tel:")) {
    return false;
  }

  try {
    const targetUrl = new URL(href, window.location.href);
    return targetUrl.origin !== window.location.origin;
  } catch {
    return false;
  }
}

function normalizeExternalLinks(rootNode = document) {
  const anchors = rootNode.querySelectorAll("a[href]");

  anchors.forEach((anchor) => {
    const href = anchor.getAttribute("href");
    if (!isExternalHref(href)) return;

    anchor.setAttribute("target", "_blank");

    const relValue = anchor.getAttribute("rel") || "";
    const relParts = relValue.split(/\s+/).filter(Boolean);
    const relSet = new Set(relParts);
    relSet.add("noopener");
    relSet.add("noreferrer");
    anchor.setAttribute("rel", Array.from(relSet).join(" "));
  });
}

export default function Root({ children }) {
  useEffect(() => {
    normalizeExternalLinks();

    const observer = new MutationObserver(() => {
      normalizeExternalLinks();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, []);

  return <>{children}</>;
}
