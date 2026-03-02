const fieldPathLookup = {
  title: ["name", "title", "displayName"],
  description: ["description", "summary"],
  author: ["author", "creator", "publisher"],
  tags: ["tags", "categories", "labels"],
  population: ["population", "cityPopulation", "populationEstimate"],
  images: ["images", "gallery", "screenshots", "thumbnails"],
};

export const PAGE_SIZES = [12, 24, 48];

export const CARD_POPUP_ENABLED = true;

export const ALL_DOWNLOADS = [
  {
    os: "Windows",
    arch: "x64",
    link: "https://geek.co.il/2023/02/09/imported-rant-why-i-hate-macos",
    label: "Windows x64",
    type: ".zip",
    size: "0 MB",
  },
  {
    os: "Windows",
    arch: "arm64",
    link: "https://geek.co.il/2023/02/09/imported-rant-why-i-hate-macos",
    label: "Windows ARM64",
    type: ".zip",
    size: "0 MB",
  },
  {
    os: "macOS",
    arch: "arm64",
    link: "https://geek.co.il/2023/02/09/imported-rant-why-i-hate-macos",
    label: "macOS Apple Silicon",
    type: ".dmg",
    size: "0 MB",
  },
  {
    os: "macOS",
    arch: "x64",
    link: "https://geek.co.il/2023/02/09/imported-rant-why-i-hate-macos",
    label: "macOS Intel",
    type: ".dmg",
    size: "0 MB",
  },
  {
    os: "Linux",
    arch: "x64",
    link: "https://geek.co.il/2023/02/09/imported-rant-why-i-hate-macos",
    label: "Linux x64",
    type: ".AppImage",
    size: "0 MB",
  },
  {
    os: "Linux",
    arch: "arm64",
    link: "https://geek.co.il/2023/02/09/imported-rant-why-i-hate-macos",
    label: "Linux ARM64",
    type: ".AppImage",
    size: "0 MB",
  },
];

export async function detectNativeDownload() {
  if (typeof navigator === "undefined") {
    return ALL_DOWNLOADS[0];
  }

  const ua = navigator.userAgent.toLowerCase();
  let os = "Windows";
  let arch = "x64";

  if (ua.includes("mac")) os = "macOS";
  else if (ua.includes("linux")) os = "Linux";

  if (navigator.userAgentData?.getHighEntropyValues) {
    const hints = await navigator.userAgentData.getHighEntropyValues(["architecture"]);
    if (hints.architecture === "arm") arch = "arm64";
  } else if (ua.includes("arm64") || ua.includes("aarch64")) {
    arch = "arm64";
  }

  return ALL_DOWNLOADS.find((entry) => entry.os === os && entry.arch === arch) || ALL_DOWNLOADS[0];
}

export function getFirstValue(record, key) {
  for (const path of fieldPathLookup[key] || []) {
    if (Object.prototype.hasOwnProperty.call(record, path) && record[path] != null) {
      return record[path];
    }
  }
  return null;
}

export function flattenRecord(record, prefix = "") {
  if (record == null || typeof record !== "object") {
    return [{ key: prefix || "value", value: String(record) }];
  }

  const rows = [];
  Object.entries(record).forEach(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    if (Array.isArray(value)) {
      rows.push({ key: path, value: JSON.stringify(value) });
    } else if (value && typeof value === "object") {
      rows.push(...flattenRecord(value, path));
    } else {
      rows.push({ key: path, value: String(value) });
    }
  });
  return rows;
}

export function compareValues(a, b) {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;

  if (a instanceof Date && b instanceof Date) {
    return a.getTime() - b.getTime();
  }

  return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: "base" });
}

export function getTitle(manifest, id) {
  return getFirstValue(manifest, "title") || id;
}

export function getPopulation(manifest) {
  const value = getFirstValue(manifest, "population");
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

export function normalizeTags(manifest) {
  const rawTags = getFirstValue(manifest, "tags");
  if (!rawTags) return [];
  if (Array.isArray(rawTags)) return rawTags.map((tag) => String(tag));
  return [String(rawTags)];
}

export function formatUpdatedDate(isoDate, locale = undefined) {
  if (!isoDate) return null;
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

export function getManifestUpdatedAt(manifest) {
  const candidates = [
    manifest?.updatedAt,
    manifest?.updated_at,
    manifest?.lastUpdated,
    manifest?.last_updated,
    manifest?.updated,
    manifest?.date,
    manifest?.releaseDate,
  ];

  for (const candidate of candidates) {
    if (!candidate) continue;
    const date = new Date(candidate);
    if (!Number.isNaN(date.getTime())) {
      return date.toISOString();
    }
  }

  return null;
}

export function buildManifestUrl(type, id) {
  return `https://raw.githubusercontent.com/Subway-Builder-Modded/The-Railyard/main/${type}/${id}/manifest.json`;
}

export function buildManifestCommitUrl(type, id) {
  const path = encodeURIComponent(`${type}/${id}/manifest.json`);
  return `https://api.github.com/repos/Subway-Builder-Modded/The-Railyard/commits?path=${path}&per_page=1`;
}

export async function fetchUpdatedAt(type, id) {
  const response = await fetch(buildManifestCommitUrl(type, id));
  if (!response.ok) {
    return null;
  }

  const commits = await response.json();
  const latest = Array.isArray(commits) ? commits[0] : null;
  return latest?.commit?.committer?.date || latest?.commit?.author?.date || null;
}

function buildGithubImageCandidates(url) {
  if (!url) return [];

  const normalized = url.replace("/refs/heads/", "/").replace("?raw=true", "");
  const candidates = [encodeURI(normalized)];

  // Matches GitHub blob/raw URLs and captures owner, repo, branch, and asset path.
  const githubMatch = normalized.match(
    /^https:\/\/github\.com\/([^/]+)\/([^/]+)\/(?:blob|raw)\/([^/]+)\/(.+)$/,
  );
  if (githubMatch) {
    const [, owner, repo, branch, rawPath] = githubMatch;
    candidates.push(
      `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${encodeURI(rawPath)}`,
    );
    candidates.push(`https://cdn.jsdelivr.net/gh/${owner}/${repo}@${branch}/${encodeURI(rawPath)}`);
  }

  // Matches raw.githubusercontent.com URLs and captures owner, repo, branch, and asset path.
  const rawMatch = normalized.match(
    /^https:\/\/raw\.githubusercontent\.com\/([^/]+)\/([^/]+)\/([^/]+)\/(.+)$/,
  );
  if (rawMatch) {
    const [, owner, repo, branch, rawPath] = rawMatch;
    candidates.push(`https://cdn.jsdelivr.net/gh/${owner}/${repo}@${branch}/${encodeURI(rawPath)}`);
  }

  return [...new Set(candidates)];
}

export function normalizeImageList(manifest, type, id) {
  const imageCandidates = getFirstValue(manifest, "images");
  if (!imageCandidates) return [];

  const toUrl = (value) => {
    if (!value) return [];

    if (typeof value === "string") {
      if (value.startsWith("http")) return buildGithubImageCandidates(value);
      const cleaned = value
        .replace(/^\.\//, "")
        .replace(
          // Removes a leading full registry gallery prefix (e.g., maps/my-id/gallery/).
          new RegExp(`^${type}/${id}/gallery/`),
          "",
        )
        .replace(
          // Removes a leading item-relative gallery prefix (e.g., my-id/gallery/).
          new RegExp(`^${id}/gallery/`),
          "",
        )
        .replace(/^gallery\//, "")
        .replace(
          // Removes a leading content type segment if already present (maps/ or mods/).
          new RegExp(`^${type}/`),
          "",
        )
        .replace(/^\//, "");
      const relative = `${type}/${id}/gallery/${cleaned}`;
      return [
        `https://raw.githubusercontent.com/Subway-Builder-Modded/The-Railyard/main/${encodeURI(relative)}`,
        `https://cdn.jsdelivr.net/gh/Subway-Builder-Modded/The-Railyard@main/${encodeURI(relative)}`,
      ];
    }

    if (typeof value === "object") {
      const nested = value.file || value.src || value.path || value.url;
      return toUrl(nested);
    }

    return [];
  };

  if (Array.isArray(imageCandidates)) {
    return imageCandidates.map(toUrl).filter((candidateList) => candidateList.length > 0);
  }

  const singleUrl = toUrl(imageCandidates);
  return singleUrl.length > 0 ? [singleUrl] : [];
}
