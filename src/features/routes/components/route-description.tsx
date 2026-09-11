import { sanitizeRouteDescriptionHtml } from "~/lib/sanitize-route-html";
import { htmlToPlainText } from "~/lib/html-to-plain-text";
import { cn } from "~/lib/utils";

type RouteDescriptionProps = {
  html: string;
  className?: string;
  clamp?: boolean;
};

export function RouteDescription({
  html,
  className,
  clamp = false,
}: RouteDescriptionProps) {
  const sanitized = sanitizeRouteDescriptionHtml(html);
  const plainText = htmlToPlainText(sanitized);

  if (!plainText) {
    return null;
  }

  if (!/[<>]/.test(sanitized)) {
    return <p className={cn("text-sm", className)}>{plainText}</p>;
  }

  return (
    <div
      className={cn(
        "text-sm",
        "[&_a]:text-primary [&_a]:underline",
        "[&_h2]:mb-2 [&_h2]:text-lg [&_h2]:font-semibold",
        "[&_h3]:mb-2 [&_h3]:text-base [&_h3]:font-semibold",
        "[&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5",
        "[&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5",
        "[&_p]:mb-2 last:[&_p]:mb-0",
        clamp && "line-clamp-3 overflow-hidden",
        className,
      )}
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
}
