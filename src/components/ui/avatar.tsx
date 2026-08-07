"use client";

import { Avatar as RadixAvatar } from "radix-ui";
import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/utils";

/* design.md §2.5 — radius-full is restricted to avatars, pills and the
 * WhatsApp dock. This is one of the three places it is allowed.
 *
 * §3.13 / §3.7 — avatars carry real faces of real named people. R-07:
 * authenticity signals outperform stock polish, and a named human on a CTA
 * converts better than a generic bubble.
 */

const avatarSizes = {
  sm: "size-8",
  md: "size-10", // §3.13 — 40px in the testimonial card
  lg: "size-14",
} as const;

export function Avatar({
  src,
  name,
  size = "md",
  className,
  ...rest
}: Omit<ComponentPropsWithoutRef<typeof RadixAvatar.Root>, "children"> & {
  src?: string;
  /** Used for the alt text and to derive the initials fallback. */
  name: string;
  size?: keyof typeof avatarSizes;
}) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();

  return (
    <RadixAvatar.Root
      className={cn(
        "relative inline-flex shrink-0 overflow-hidden rounded-full",
        "bg-basalt-100 dark:bg-basalt-800",
        avatarSizes[size],
        className,
      )}
      {...rest}
    >
      {src ? (
        <RadixAvatar.Image
          src={src}
          alt={name}
          className="size-full object-cover"
        />
      ) : null}
      <RadixAvatar.Fallback
        // Delay avoids a flash of initials while a fast image decodes.
        delayMs={src ? 300 : 0}
        className="grid size-full place-items-center font-sans text-caption text-fg-muted"
      >
        {initials}
      </RadixAvatar.Fallback>
    </RadixAvatar.Root>
  );
}
