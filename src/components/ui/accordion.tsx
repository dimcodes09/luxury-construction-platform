"use client";

import { Accordion as RadixAccordion } from "radix-ui";
import { Plus } from "lucide-react";
import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/components/foundation/icon";

/* design.md §3.19 — Accordion.
 *
 * "Hairline-separated rows, no boxes." The + rotates 45° into an ×, which is
 * one glyph doing two jobs and avoids a second icon asset.
 *
 * NOTE on semantics: §3.19 asks for native <details>/<summary> so content is in
 * the DOM for SEO and Ctrl+F. That is implemented in FAQItem (§3.19, domain
 * layer) which is the SEO-bearing surface. This Radix version is for in-app
 * disclosure — filter groups, admin panels — where the WAI-ARIA accordion
 * pattern and controlled state matter more than crawlability.
 */

export const AccordionRoot = RadixAccordion.Root;

export function AccordionItem({
  className,
  ...rest
}: ComponentPropsWithoutRef<typeof RadixAccordion.Item>) {
  return (
    <RadixAccordion.Item
      className={cn("border-b border-hairline", className)}
      {...rest}
    />
  );
}

export function AccordionTrigger({
  className,
  children,
  ...rest
}: ComponentPropsWithoutRef<typeof RadixAccordion.Trigger>) {
  return (
    <RadixAccordion.Header className="flex">
      <RadixAccordion.Trigger
        className={cn(
          // §3.19: entire row clickable, 24px vertical padding, min-height 64px.
          "group flex min-h-16 w-full items-center justify-between gap-4 py-6",
          "text-left font-sans text-heading-sm text-fg",
          "transition-colors duration-fast ease-standard",
          "focus-visible:outline-2 focus-visible:outline-offset-2",
          className,
        )}
        {...rest}
      >
        {children}
        <Icon
          icon={Plus}
          size={20}
          className={cn(
            "shrink-0 text-fg-muted",
            "transition-transform duration-base ease-standard",
            // + becomes × at 45°.
            "group-data-[state=open]:rotate-45",
          )}
        />
      </RadixAccordion.Trigger>
    </RadixAccordion.Header>
  );
}

export function AccordionContent({
  className,
  children,
  ...rest
}: ComponentPropsWithoutRef<typeof RadixAccordion.Content>) {
  return (
    <RadixAccordion.Content
      className={cn(
        "overflow-hidden",
        // Radix exposes the measured height as a CSS variable so the height
        // transition works without JS measuring on every frame.
        "data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",
        className,
      )}
      {...rest}
    >
      <div className={cn("pb-6 text-body-md text-fg-secondary measure-body")}>
        {children}
      </div>
    </RadixAccordion.Content>
  );
}
