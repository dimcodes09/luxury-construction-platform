"use client";

import { Tabs as RadixTabs } from "radix-ui";
import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/utils";

/* design.md §3.0 composites — Tabs.
 *
 * Styled as a hairline rail with a brass underline on the active tab, matching
 * the header's active-item treatment (§3.5: "Active item carries a 1px brass
 * underline offset 6px"). Consistency between nav and tabs is what makes the
 * system feel designed rather than assembled.
 */

export const TabsRoot = RadixTabs.Root;

export function TabsList({
  className,
  ...rest
}: ComponentPropsWithoutRef<typeof RadixTabs.List>) {
  return (
    <RadixTabs.List
      className={cn(
        "flex items-center gap-8 border-b border-hairline",
        // Tabs overflow horizontally on mobile rather than wrapping — a wrapped
        // tab rail reads as a broken menu.
        "overflow-x-auto",
        className,
      )}
      {...rest}
    />
  );
}

export function TabsTrigger({
  className,
  ...rest
}: ComponentPropsWithoutRef<typeof RadixTabs.Trigger>) {
  return (
    <RadixTabs.Trigger
      className={cn(
        "relative shrink-0 whitespace-nowrap py-4 font-sans text-body-md",
        "text-fg-muted transition-colors duration-fast ease-standard",
        "hover:text-fg",
        "data-[state=active]:text-fg",
        "focus-visible:outline-2 focus-visible:outline-offset-2",
        // §3.5 — the 1px brass underline, offset from the text.
        "after:absolute after:inset-x-0 after:bottom-0 after:h-px",
        "after:origin-left after:scale-x-0 after:bg-brass-500",
        "after:transition-transform after:duration-base after:ease-standard",
        "data-[state=active]:after:scale-x-100",
        className,
      )}
      {...rest}
    />
  );
}

export function TabsContent({
  className,
  ...rest
}: ComponentPropsWithoutRef<typeof RadixTabs.Content>) {
  return (
    <RadixTabs.Content
      className={cn("pt-6 focus-visible:outline-2", className)}
      {...rest}
    />
  );
}
