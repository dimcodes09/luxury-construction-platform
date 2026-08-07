"use client";

import { Checkbox as RadixCheckbox, RadioGroup, Switch as RadixSwitch } from "radix-ui";
import { Check, Minus } from "lucide-react";
import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/components/foundation/icon";

/* design.md §3.3 — Checkbox / Radio / Switch.
 *
 * 20×20 box, radius-sm (checkbox) / radius-full (radio), 1.5px border.
 * Checked fills ink-900 with a basalt-050 glyph.
 *
 * §3.3: "The whole label row is a hit target, min height 44px." That is what
 * <ControlRow> below enforces — a 20px box alone fails §9.3 badly, and it is
 * the most common touch-target miss in form UI.
 */

const boxClasses = [
  "peer grid size-5 shrink-0 place-items-center border-control border-ink-900",
  "bg-basalt-000 transition-colors duration-instant ease-standard",
  "data-[state=checked]:bg-ink-900 data-[state=checked]:text-basalt-050",
  "data-[state=indeterminate]:bg-ink-900 data-[state=indeterminate]:text-basalt-050",
  "focus-visible:outline-2 focus-visible:outline-offset-3",
  "disabled:opacity-38 disabled:cursor-not-allowed",
  "dark:border-basalt-050 dark:bg-basalt-800",
  "dark:data-[state=checked]:bg-basalt-050 dark:data-[state=checked]:text-ink-900",
].join(" ");

export function Checkbox({
  className,
  ...rest
}: ComponentPropsWithoutRef<typeof RadixCheckbox.Root>) {
  return (
    <RadixCheckbox.Root
      className={cn(boxClasses, "rounded-sm", className)}
      {...rest}
    >
      <RadixCheckbox.Indicator>
        {rest.checked === "indeterminate" ? (
          <Icon icon={Minus} size={16} />
        ) : (
          <Icon icon={Check} size={16} />
        )}
      </RadixCheckbox.Indicator>
    </RadixCheckbox.Root>
  );
}

export function Radio({
  className,
  ...rest
}: ComponentPropsWithoutRef<typeof RadioGroup.Item>) {
  return (
    <RadioGroup.Item className={cn(boxClasses, "rounded-full", className)} {...rest}>
      <RadioGroup.Indicator className="size-2 rounded-full bg-current" />
    </RadioGroup.Item>
  );
}

export const RadioRoot = RadioGroup.Root;

/* §3.3 Switch. Used for binary settings in admin, never for form consent —
 * consent is a checkbox, because a switch's state is ambiguous when printed or
 * read aloud. */
export function Switch({
  className,
  ...rest
}: ComponentPropsWithoutRef<typeof RadixSwitch.Root>) {
  return (
    <RadixSwitch.Root
      className={cn(
        "peer relative inline-flex h-6 w-11 shrink-0 items-center rounded-full",
        "border-control border-ink-900 bg-basalt-000",
        "transition-colors duration-fast ease-standard",
        "data-[state=checked]:bg-ink-900",
        "focus-visible:outline-2 focus-visible:outline-offset-3",
        "disabled:opacity-38 disabled:cursor-not-allowed",
        "dark:border-basalt-050 dark:bg-basalt-800 dark:data-[state=checked]:bg-basalt-050",
        className,
      )}
      {...rest}
    >
      <RadixSwitch.Thumb
        className={cn(
          "block size-4 translate-x-1 rounded-full bg-ink-900",
          "transition-transform duration-fast ease-standard",
          "data-[state=checked]:translate-x-6 data-[state=checked]:bg-basalt-050",
          "dark:bg-basalt-050 dark:data-[state=checked]:bg-ink-900",
        )}
      />
    </RadixSwitch.Root>
  );
}

/* §3.3 / §9.3 — the row wrapper that makes the whole label a 44px hit target.
 * Use this for every checkbox, radio and switch that carries a label. */
export function ControlRow({
  htmlFor,
  control,
  children,
  description,
  className,
}: {
  htmlFor: string;
  control: React.ReactNode;
  children: React.ReactNode;
  description?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex min-h-target items-start gap-3 py-2", className)}>
      <span className="flex h-6 items-center">{control}</span>
      <label htmlFor={htmlFor} className="cursor-pointer select-none">
        <span className="block text-body-md text-fg">{children}</span>
        {description ? (
          <span className="mt-1 block text-caption text-fg-muted">
            {description}
          </span>
        ) : null}
      </label>
    </div>
  );
}
