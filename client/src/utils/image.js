const PLACEHOLDER = "/images/placeholder-bag.svg";

const candidateKeys = [
  "url",
  "secure_url",
  "src",
  "image",
  "imageUrl",
  "path",
];

const toCleanString = (value) =>
  typeof value === "string" ? value.trim() : "";

export const resolveImageUrl = (value, fallback = PLACEHOLDER) => {
  if (!value) return fallback;

  if (typeof value === "string") {
    const url = toCleanString(value);
    return url || fallback;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const resolved = resolveImageUrl(item, "");
      if (resolved) return resolved;
    }
    return fallback;
  }

  if (typeof value === "object") {
    for (const key of candidateKeys) {
      const raw = toCleanString(value[key]);
      if (raw) return raw;
    }
  }

  return fallback;
};

export const PLACEHOLDER_IMAGE = PLACEHOLDER;
