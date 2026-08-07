import Image from "next/image";
import NextLink from "next/link";

import { cn } from "@/lib/utils";
import { Heading, Body, Datum } from "@/components/foundation/typography";

/* design.md §3.0 domain — ArticleCard, for The Zyvora Journal (§1.1.4).
 *
 * §10.5 content strategy: "COST GUIDES ARE THE HIGHEST-INTENT ORGANIC ENTRY
 * POINT in this category." So the card leads with category and read time —
 * the two things a researching visitor (R-03, the silent lurker) uses to decide
 * whether to commit attention.
 *
 * §1.1.4: the blog is "The Zyvora Journal", sentence case in body copy.
 */

export type Article = {
  href: string;
  title: string;
  excerpt: string;
  category: string;
  publishedAt: string;
  readTimeMinutes: number;
  image?: { src: string; alt: string };
};

export function ArticleCard({
  article,
  size = "md",
  className,
}: {
  article: Article;
  /** `lg` is the featured slot on the journal index. */
  size?: "md" | "lg";
  className?: string;
}) {
  return (
    <article className={cn("group relative flex flex-col", className)}>
      {article.image ? (
        <div
          className={cn(
            "relative w-full overflow-hidden rounded-md bg-basalt-100",
            size === "lg" ? "aspect-16/10" : "aspect-video",
          )}
        >
          <Image
            src={article.image.src}
            alt={article.image.alt}
            fill
            sizes={
              size === "lg"
                ? "(min-width: 1024px) 66vw, 100vw"
                : "(min-width: 1024px) 33vw, 100vw"
            }
            quality={72}
            className="object-cover transition-transform duration-base ease-standard group-hover:scale-103"
          />
        </div>
      ) : null}

      <div className={cn(article.image && "mt-4")}>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <Datum className="text-brass-600 dark:text-brass-300">
            {article.category}
          </Datum>
          <span aria-hidden="true" className="h-3 w-px bg-hairline" />
          <Datum>
            <span className="font-mono tabular">{article.readTimeMinutes}</span>{" "}
            min read
          </Datum>
        </div>

        <Heading as="h3" size={size === "lg" ? "lg" : "sm"} className="mt-3">
          <NextLink
            href={article.href}
            className="after:absolute after:inset-0 focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            {article.title}
          </NextLink>
        </Heading>

        <Body size="sm" className="mt-2" measure={false}>
          {article.excerpt}
        </Body>

        <time
          dateTime={article.publishedAt}
          className="mt-3 block font-mono text-datum uppercase tabular text-fg-muted"
        >
          {article.publishedAt}
        </time>
      </div>
    </article>
  );
}
