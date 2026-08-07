"use client";

import { Dialog } from "radix-ui";
import { X } from "lucide-react";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/components/foundation/icon";
import { Heading } from "@/components/foundation/typography";

/* design.md §3.0 composites — Modal and Sheet.
 *
 * Both are Radix Dialog underneath: focus trapping, scroll locking, Esc, and
 * restoring focus to the trigger are all things you get wrong by hand, and
 * §9.4 requires every one of them.
 *
 * §2.5 — radius-lg (8px) is the modal/sheet ceiling. --shadow-modal is one of
 * only three shadows in the system and this is its only use.
 */

export const ModalRoot = Dialog.Root;
export const ModalTrigger = Dialog.Trigger;
export const ModalClose = Dialog.Close;

function Overlay({ className }: { className?: string }) {
  return (
    <Dialog.Overlay
      className={cn(
        "fixed inset-0 z-modal bg-scrim",
        "data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out",
        className,
      )}
    />
  );
}

export function Modal({
  title,
  description,
  children,
  footer,
  className,
  ...rest
}: Omit<ComponentPropsWithoutRef<typeof Dialog.Content>, "title"> & {
  title: ReactNode;
  description?: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <Dialog.Portal>
      <Overlay />
      <Dialog.Content
        className={cn(
          "fixed left-1/2 top-1/2 z-modal w-full max-w-narrow -translate-x-1/2 -translate-y-1/2",
          "max-h-modal overflow-y-auto",
          // §2.3 — 24px mobile / 40px desktop.
          "rounded-lg bg-raised p-6 shadow-modal md:p-10",
          "data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out",
          className,
        )}
        {...rest}
      >
        <div className="flex items-start justify-between gap-6">
          <Dialog.Title asChild>
            <Heading as="h2" size="md">
              {title}
            </Heading>
          </Dialog.Title>
          <Dialog.Close
            className="grid size-target shrink-0 place-items-center rounded-full text-fg-muted transition-colors duration-fast hover:bg-basalt-100 focus-visible:outline-2 dark:hover:bg-basalt-800"
            aria-label="Close"
          >
            <Icon icon={X} size={20} />
          </Dialog.Close>
        </div>

        {description ? (
          <Dialog.Description className="mt-2 text-body-md text-fg-secondary">
            {description}
          </Dialog.Description>
        ) : null}

        <div className="mt-6">{children}</div>

        {footer ? (
          <div className="mt-8 flex flex-wrap items-center gap-3">{footer}</div>
        ) : null}
      </Dialog.Content>
    </Dialog.Portal>
  );
}

/* Sheet — the same primitive docked to an edge.
 *
 * §9.2: filters use a bottom sheet below 1024px. §3.5: the mobile nav is a
 * full-screen drawer from the right. Both are this component. */
export function Sheet({
  side = "right",
  title,
  children,
  className,
  ...rest
}: Omit<ComponentPropsWithoutRef<typeof Dialog.Content>, "title"> & {
  side?: "right" | "bottom";
  title: ReactNode;
}) {
  return (
    <Dialog.Portal>
      <Overlay />
      <Dialog.Content
        className={cn(
          "fixed z-drawer bg-raised shadow-modal",
          side === "right" &&
            "inset-y-0 right-0 w-full max-w-prose data-[state=closed]:animate-slide-out-right data-[state=open]:animate-slide-in-right",
          side === "bottom" &&
            // §9.3 — respect the home-indicator inset on fixed elements.
            "inset-x-0 bottom-0 max-h-sheet overflow-y-auto rounded-t-lg pb-safe data-[state=closed]:animate-slide-out-bottom data-[state=open]:animate-slide-in-bottom",
          className,
        )}
        {...rest}
      >
        <div className="flex items-start justify-between gap-6 p-6 md:p-8">
          <Dialog.Title asChild>
            <Heading as="h2" size="md">
              {title}
            </Heading>
          </Dialog.Title>
          <Dialog.Close
            className="grid size-target shrink-0 place-items-center rounded-full text-fg-muted transition-colors duration-fast hover:bg-basalt-100 focus-visible:outline-2 dark:hover:bg-basalt-800"
            aria-label="Close"
          >
            <Icon icon={X} size={20} />
          </Dialog.Close>
        </div>
        <div className="px-6 pb-6 md:px-8 md:pb-8">{children}</div>
      </Dialog.Content>
    </Dialog.Portal>
  );
}
