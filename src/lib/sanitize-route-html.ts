import "server-only";

import sanitizeHtml from "sanitize-html";

import { isAllowedBlobImageSrc as isAllowedBlobImageSrcWithHost } from "~/lib/blob-image-src";

const ROUTE_DESCRIPTION_ALLOWED_TAGS = [
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "h1",
  "h2",
  "h3",
  "ul",
  "ol",
  "li",
  "a",
  "blockquote",
  "img",
];

function isAllowedBlobImageSrc(src: string) {
  return isAllowedBlobImageSrcWithHost(src);
}

export function sanitizeRouteDescriptionHtml(html: string) {
  return sanitizeHtml(html, {
    allowedTags: ROUTE_DESCRIPTION_ALLOWED_TAGS,
    allowedAttributes: {
      a: ["href", "rel", "target"],
      img: ["src", "alt"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    allowedSchemesByTag: {
      img: ["https"],
    },
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", {
        rel: "noopener noreferrer",
        target: "_blank",
      }),
    },
    exclusiveFilter: (frame) => {
      if (frame.tag !== "img") {
        return false;
      }

      const src = frame.attribs.src;
      return !src || !isAllowedBlobImageSrc(src);
    },
  });
}

export function stripRouteDescriptionImages(html: string) {
  return html.replace(/<img\b[^>]*>/gi, "");
}

export function extractDescriptionBlobImageUrls(html: string) {
  const sanitized = sanitizeRouteDescriptionHtml(html);
  const urls: string[] = [];
  const seen = new Set<string>();
  const imgSrcRegex = /<img\b[^>]*\bsrc=["']([^"']+)["']/gi;

  for (const match of sanitized.matchAll(imgSrcRegex)) {
    const src = match[1];
    if (src && !seen.has(src) && isAllowedBlobImageSrc(src)) {
      seen.add(src);
      urls.push(src);
    }
  }

  return urls;
}

export function vanishedDescriptionBlobImageUrls(
  previousHtml: string,
  nextHtml: string,
) {
  const nextUrls = new Set(extractDescriptionBlobImageUrls(nextHtml));
  return extractDescriptionBlobImageUrls(previousHtml).filter(
    (url) => !nextUrls.has(url),
  );
}
