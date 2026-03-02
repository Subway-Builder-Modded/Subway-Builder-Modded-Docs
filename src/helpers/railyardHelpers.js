const fieldPathLookup = {
  title: ["name", "title", "displayName"],
  description: ["description", "summary"],
  author: ["author", "creator", "publisher"],
  tags: ["tags", "categories", "labels"],
  population: ["population", "cityPopulation", "populationEstimate"],
  images: ["images", "gallery", "screenshots", "thumbnails"],
};

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

export function formatTagLabel(tag) {
  return String(tag).replace(/[-_]+/g, " ").trim().toLowerCase();
}

export function compareValues(a, b) {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
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

function buildGithubImageCandidates(url) {
  if (!url) return [];

  const normalized = url.replace("/refs/heads/", "/").replace("?raw=true", "");
  const candidates = [encodeURI(normalized)];

  // Matches GitHub blob/raw links so we can generate equivalent raw + CDN URLs.
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

  // Matches raw.githubusercontent URLs so we can add a jsDelivr mirror fallback.
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
        // Strips a local './' prefix from manifest image paths.
        .replace(/^\.\//, "")
        // Removes type/id/gallery prefixes when authors include full repository paths.
        .replace(new RegExp(`^${type}/${id}/gallery/`), "")
        // Removes id/gallery prefixes when authors include path relative to type directory.
        .replace(new RegExp(`^${id}/gallery/`), "")
        // Removes remaining gallery or type prefixes before rebuilding canonical path.
        .replace(/^gallery\//, "")
        .replace(new RegExp(`^${type}/`), "")
        // Removes any accidental leading slash.
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
