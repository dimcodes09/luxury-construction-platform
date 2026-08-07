"use client";

import { DropdownMenu, Popover as RadixPopover } from "radix-ui";
import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/utils";

/* design.md §3.0 composites — Popover and Dropdown.
 *
 * §2.5: --shadow-sheet exists for exactly these two surfaces. Both sit on
 * bg-raised with a hairline, because a shadow alone is not enough separation in
 * a system this flat.
 */

const surfaceClasses = [
  "z-modal min-w-48 overflow-hidden rounded-md bg-raised p-2",
  "hairline shadow-sheet",
  "data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out",
].join(" ");

export const PopoverRoot = RadixPopover.Root;
export const PopoverTrigger = RadixPopover.Trigger;

export function PopoverContent({
  className,
  sideOffset = 8,
  ...rest
}: ComponentPropsWithoutRef<typeof RadixPopover.Content>) {
  return (
    <RadixPopover.Portal>
      <RadixPopover.Content
        sideOffset={sideOffset}
        className={cn(surfaceClasses, "p-4", className)}
        {...rest}
      />
    </RadixPopover.Portal>
  );
}

export const DropdownRoot = DropdownMenu.Root;
export const DropdownTrigger = DropdownMenu.Trigger;

export function DropdownContent({
  className,
  sideOffset = 8,
  ...rest
}: ComponentPropsWithoutRef<typeof DropdownMenu.Content>) {
  return (
    <DropdownMenu.Portal>
      <DropdownMenu.Content
        sideOffset={sideOffset}
        // §3.3: max-height 320px with scroll, matching the select listbox.
        className={cn(surfaceClasses, "max-h-80 overflow-y-auto", className)}
        {...rest}
      />
    </DropdownMenu.Portal>
  );
}

export function DropdownItem({
  className,
  ...rest
}: ComponentPropsWithoutRef<typeof DropdownMenu.Item>) {
  return (
    <DropdownMenu.Item
      className={cn(
        // §9.3 — every row clears the 44px target, even in a dense menu.
        "flex min-h-target cursor-pointer select-none items-center gap-3 rounded-sm px-3 py-2",
        "font-sans text-body-md text-fg-secondary outline-none",
        "transition-colors duration-fast ease-standard",
        "data-[highlighted]:bg-basalt-100 data-[highlighted]:text-fg",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-38",
        "dark:data-[highlighted]:bg-basalt-800",
        className,
      )}
      {...rest}
    />
  );
}

export function DropdownSeparator({
  className,
  ...rest
}: ComponentPropsWithoutRef<typeof DropdownMenu.Separator>) {
  return (
    <DropdownMenu.Separator
      className={cn("my-2 h-px bg-hairline", className)}
      {...rest}
    />
  );
}
