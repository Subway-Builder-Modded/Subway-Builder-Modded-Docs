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

const DEFAULT_FETCH_TIMEOUT_MS = 9000;

export const ALL_DOWNLOADS = [
  {
    os: "Windows",
    distribution: "x64",
    arch: "x64",
    link: "https://geek.co.il/2023/02/09/imported-rant-why-i-hate-macos",
    label: "Windows (x64)",
    type: ".zip",
    size: "0 MB",
  },
  {
    os: "Windows",
    distribution: "arm64",
    arch: "arm64",
    link: "https://geek.co.il/2023/02/09/imported-rant-why-i-hate-macos",
    label: "Windows (arm64)",
    type: ".zip",
    size: "0 MB",
  },
  {
    os: "macOS",
    distribution: "Apple Silicon",
    arch: "arm64",
    link: "https://geek.co.il/2023/02/09/imported-rant-why-i-hate-macos",
    label: "macOS (Apple Silicon)",
    type: ".dmg",
    size: "0 MB",
  },
  {
    os: "macOS",
    distribution: "Intel",
    arch: "x64",
    link: "https://geek.co.il/2023/02/09/imported-rant-why-i-hate-macos",
    label: "macOS (Intel)",
    type: ".dmg",
    size: "0 MB",
  },
  {
    os: "Linux",
    distribution: "x64",
    arch: "x64",
    link: "https://geek.co.il/2023/02/09/imported-rant-why-i-hate-macos",
    label: "Linux (x64)",
    type: ".AppImage",
    size: "0 MB",
  },
  {
    os: "Linux",
    distribution: "arm64",
    arch: "arm64",
    link: "https://geek.co.il/2023/02/09/imported-rant-why-i-hate-macos",
    label: "Linux (arm64)",
    type: ".AppImage",
    size: "0 MB",
  },
];

export function getDownloadCatalog() {
  const byOS = new Map();

  ALL_DOWNLOADS.forEach((entry) => {
    if (!byOS.has(entry.os)) {
      byOS.set(entry.os, []);
    }
    byOS.get(entry.os).push(entry);
  });

  return Array.from(byOS.entries()).map(([os, downloads]) => ({ os, downloads }));
}

export function getOSOptions() {
  return getDownloadCatalog().map((group) => group.os);
}

export function getDownloadsForOS(os) {
  return ALL_DOWNLOADS.filter((entry) => entry.os === os);
}

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

  const exactMatch = ALL_DOWNLOADS.find((entry) => entry.os === os && entry.arch === arch);
  if (exactMatch) return exactMatch;

  return ALL_DOWNLOADS.find((entry) => entry.os === os) || ALL_DOWNLOADS[0];
}

export function formatDownloadCount(value) {
  const count = Number(value);
  if (!Number.isFinite(count) || count <= 0) return "0";

  const units = ["", "k", "m", "b", "t", "q"];
  let unitIndex = 0;
  let scaled = count;

  while (scaled >= 1000 && unitIndex < units.length - 1) {
    scaled /= 1000;
    unitIndex += 1;
  }

  if (unitIndex === 0) {
    return scaled.toLocaleString();
  }

  return `${scaled.toFixed(1)}${units[unitIndex]}`;
}

async function getGitHubVersions(repo) {
  const normalizedRepo = normalizeGitHubRepo(repo);
  if (!normalizedRepo) return [];

  const releases = await fetchJSON(`https://api.github.com/repos/${normalizedRepo}/releases`, {
    headers: {
      Accept: "application/vnd.github+json",
    },
  });

  if (!Array.isArray(releases)) return [];

  return releases.map((release) => ({
    downloads: extractReleaseDownloadCount(release),
  }));
}

async function getCustomVersions(url) {
  const data = await fetchJSON(url);
  const versions =
    (Array.isArray(data?.versions) && data.versions) ||
    (Array.isArray(data?.releases) && data.releases) ||
    (Array.isArray(data) && data) ||
    [];

  return versions.map((version) => ({ downloads: extractDownloadValue(version) }));
}

export async function fetchManifestDownloadCount(manifest) {
  if (!manifest || typeof manifest !== "object") return 0;

  const update =
    manifest.update ||
    manifest.updater ||
    manifest.releaseSource ||
    manifest.updateSource ||
    {};
  const updateType = String(update.type || update.updateType || update.provider || "").toLowerCase();

  try {
    if (updateType.includes("github") || update.repo || update.repository || update.github) {
      const repo = update.repo || update.repository || update.github || update.source || update.url;
      if (!repo || typeof repo !== "string") return 0;
      const versions = await getGitHubVersions(repo);
      return versions.reduce((sum, version) => sum + (version.downloads || 0), 0);
    }

    if (updateType.includes("custom") || updateType.includes("json") || update.url) {
      const updateURL = update.url || update.updateUrl || update.source;
      if (!updateURL || typeof updateURL !== "string") return 0;
      const versions = await getCustomVersions(updateURL);
      return versions.reduce((sum, version) => sum + (version.downloads || 0), 0);
    }
  } catch {
    return 0;
  }

  return 0;
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
  const encodedPath = encodeURIComponent(`${type}/${id}/manifest.json`);
  const commits =
    (await fetchJSON(
      `https://api.github.com/repos/Subway-Builder-Modded/The-Railyard/commits?path=${encodedPath}&sha=main&per_page=1`,
      {
        headers: { Accept: "application/vnd.github+json" },
      },
    )) ||
    (await fetchJSON(
      `https://api.github.com/repos/Subway-Builder-Modded/The-Railyard/commits?path=${encodedPath}&sha=refs/heads/main&per_page=1`,
      {
        headers: { Accept: "application/vnd.github+json" },
      },
    ));

  const latest = Array.isArray(commits) ? commits[0] : null;
  return latest?.commit?.committer?.date || latest?.commit?.author?.date || null;
}

function normalizeGitHubRepo(value) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  const directMatch = trimmed.match(/^([\w.-]+)\/([\w.-]+)$/);
  if (directMatch) {
    return `${directMatch[1]}/${directMatch[2]}`;
  }

  const urlMatch = trimmed.match(/github\.com\/([\w.-]+)\/([\w.-]+)/i);
  if (urlMatch) {
    return `${urlMatch[1]}/${urlMatch[2].replace(/\.git$/i, "")}`;
  }

  return null;
}

function extractDownloadValue(version) {
  if (!version || typeof version !== "object") {
    return Number(version) || 0;
  }

  if (Array.isArray(version.assets)) {
    const assetTotal = version.assets.reduce(
      (sum, asset) => sum + (Number(asset?.download_count ?? asset?.downloads) || 0),
      0,
    );
    if (assetTotal > 0) return assetTotal;
  }

  const direct =
    version.downloads ??
    version.downloadCount ??
    version.download_count ??
    version.totalDownloads ??
    version.count;

  return Number(direct) || 0;
}

function extractReleaseDownloadCount(release) {
  if (!release || typeof release !== "object") return 0;
  return extractDownloadValue(release);
}

async function fetchJSON(url, options = {}, timeoutMs = DEFAULT_FETCH_TIMEOUT_MS) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      cache: "no-store",
      ...options,
      signal: controller.signal,
      headers: {
        ...(options.headers || {}),
      },
    });

    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
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
      return toUrl(value.src || value.url || value.path || value.file || value.image);
    }

    return [];
  };

  if (Array.isArray(imageCandidates)) {
    return imageCandidates
      .map((entry) => toUrl(entry))
      .filter((group) => group.length > 0);
  }

  return [toUrl(imageCandidates)].filter((group) => group.length > 0);
}
