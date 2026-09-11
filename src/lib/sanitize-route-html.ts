import "server-only";

import sanitizeHtml from "sanitize-html";

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
];

export function sanitizeRouteDescriptionHtml(html: string) {
  return sanitizeHtml(html, {
    allowedTags: ROUTE_DESCRIPTION_ALLOWED_TAGS,
    allowedAttributes: {
      a: ["href", "rel", "target"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", {
        rel: "noopener noreferrer",
        target: "_blank",
      }),
    },
  });
}
