import { cn } from "~/lib/utils";
import React, { type FC } from "react";

type Props = React.HTMLAttributes<HTMLHeadingElement> & {
  tag: HeadingTag
}

type HeadingTag = 'h1' | 'h2' | 'h3' | 'h4'

const TitleSizeClass: Record<HeadingTag, string> = {
  'h1': 'text-4xl',
  'h2': 'text-3xl',
  'h3': 'text-2xl',
  'h4': 'text-xl',
}

const Title: FC<Props> = ({ tag, children }) => {
  return React.createElement(
    tag,
    { className: cn("scroll-m-20 font-semibold tracking-tight", TitleSizeClass[tag]) },
    children
  );
}

export { Title }