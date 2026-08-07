"use client";

import NextLink from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/foundation/icon";
import { Field } from "@/components/ui/field";
import { Select } from "@/components/ui/input";
import { Datum } from "@/components/foundation/typography";

/* design.md §4.3 — the /work filter row.
 *
 * "Filters are URL STATE (/work?type=renovation&locality=baner) so results are
 * shareable, back-button-safe, and INDEXABLE." FR-PORT-02 requires the page to
 * be fully server-rendered for any combination — so this component only ever
 * navigates; it never holds the result set.
 *
 * §4.17 / §4.3: on mobile the type chips scroll horizontally in one row and
 * every other filter collapses into a single `Filters (n)` button opening a
 * bottom Sheet with an apply button showing the live count.
 *
 * §4.3: "Budget filter uses BANDS, NOT SLIDERS — publishing project budgets is
 * unusual and directly serves the 'am I overpaying?' hesitation" (§0.7).
 */

const TYPES = [
  { value: "all", label: "All" },
  { value: "new-construction", label: "New construction" },
  { value: "renovation", label: "Renovation" },
  { value: "interiors", label: "Interiors" },
  { value: "commercial", label: "Commercial" },
] as const;

const BUDGET_BANDS = [
  { value: "under-25L", label: "Under ₹25L" },
  { value: "25-50L", label: "₹25–50L" },
  { value: "50L-1Cr", label: "₹50L–1Cr" },
  { value: "1Cr+", label: "₹1Cr+" },
] as const;

export type FilterOptions = {
  localities: string[];
  years: number[];
  styles: string[];
};

export function FilterBar({
  options,
  resultCount,
}: {
  options: FilterOptions;
  resultCount: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [sheetOpen, setSheetOpen] = useState(false);

  const activeType = searchParams.get("type") ?? "all";

  /* Every change rewrites the URL and lets the server re-render. `page` is
   * always dropped, otherwise changing a filter can strand you on page 3 of a
   * result set that now has one page. */
  const buildHref = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") params.set(key, value);
    else params.delete(key);
    params.delete("page");
    const query = params.toString();
    return query ? `${pathname}?${query}` : pathname;
  };

  const setFilter = (key: string, value: string | null) => {
    router.push(buildHref(key, value), { scroll: false });
  };

  // Everything except `type`, which has its own always-visible chip row.
  const secondaryKeys = ["locality", "budget", "year", "style"] as const;
  const activeSecondaryCount = secondaryKeys.filter((key) =>
    searchParams.get(key),
  ).length;

  const hasAnyFilter = activeSecondaryCount > 0 || activeType !== "all";

  return (
    <div className="border-b border-hairline pb-6">
      {/* §4.17 — type chips scroll horizontally in a single row on mobile.
       * Rendered as LINKS, not buttons: FR-PORT-02 wants these crawlable and
       * middle-clickable, and a button would be neither. */}
      <div className="-mx-5 flex gap-2 overflow-x-auto px-5 md:mx-0 md:flex-wrap md:px-0">
        {TYPES.map((type) => {
          const isActive = activeType === type.value;
          return (
            <NextLink
              key={type.value}
              href={buildHref("type", type.value)}
              scroll={false}
              aria-current={isActive ? "true" : undefined}
              className={cn(
                "inline-flex min-h-target shrink-0 items-center rounded-sm border px-4 py-2",
                "font-sans text-body-sm transition-colors duration-fast ease-standard",
                "focus-visible:outline-2 focus-visible:outline-offset-2",
                isActive
                  ? "border-ink-900 bg-ink-900 text-basalt-050 dark:border-basalt-050 dark:bg-basalt-050 dark:text-ink-900"
                  : "border-hairline text-fg-secondary hover:bg-basalt-100 dark:hover:bg-basalt-800",
              )}
            >
              {type.label}
            </NextLink>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-between gap-4">
        {/* Desktop: the four secondary filters inline. */}
        <div className="hidden flex-wrap items-end gap-4 lg:flex">
          <SelectFilter
            id="filter-locality"
            label="Locality"
            value={searchParams.get("locality")}
            options={options.localities.map((l) => ({ value: l, label: l }))}
            onChange={(value) => setFilter("locality", value)}
          />
          <SelectFilter
            id="filter-budget"
            label="Budget"
            value={searchParams.get("budget")}
            options={BUDGET_BANDS.map((b) => ({ value: b.value, label: b.label }))}
            onChange={(value) => setFilter("budget", value)}
          />
          <SelectFilter
            id="filter-year"
            label="Year"
            value={searchParams.get("year")}
            options={options.years.map((y) => ({
              value: String(y),
              label: String(y),
            }))}
            onChange={(value) => setFilter("year", value)}
          />
          {options.styles.length > 0 ? (
            <SelectFilter
              id="filter-style"
              label="Style"
              value={searchParams.get("style")}
              options={options.styles.map((s) => ({ value: s, label: s }))}
              onChange={(value) => setFilter("style", value)}
            />
          ) : null}
        </div>

        {/* Mobile: one button opening the bottom sheet. */}
        <Button
          variant="secondary"
          size="md"
          className="lg:hidden"
          onClick={() => setSheetOpen(true)}
          iconLeading={<Icon icon={SlidersHorizontal} size={20} />}
        >
          Filters{activeSecondaryCount > 0 ? ` (${activeSecondaryCount})` : ""}
        </Button>

        <div className="flex items-center gap-4">
          {hasAnyFilter ? (
            <NextLink
              href={pathname}
              scroll={false}
              className="font-sans text-body-sm text-brass-600 underline-wipe focus-visible:outline-2 dark:text-brass-300"
            >
              Clear filters
            </NextLink>
          ) : null}
          <Datum className="shrink-0 tabular">
            {resultCount} {resultCount === 1 ? "result" : "results"}
          </Datum>
        </div>
      </div>

      {/* §4.3 / §9.2 — mobile filters open in a bottom Sheet with an apply
       * button showing the LIVE result count. Plain markup rather than the
       * Radix Dialog: this must not trap focus away from the URL-driven list
       * behind it, and it carries no overlay content of its own. */}
      {sheetOpen ? (
        <div className="fixed inset-0 z-drawer lg:hidden">
          <div
            aria-hidden="true"
            onClick={() => setSheetOpen(false)}
            className="absolute inset-0 bg-scrim"
          />
          <div
            role="dialog"
            aria-label="Filters"
            className="absolute inset-x-0 bottom-0 max-h-sheet overflow-y-auto rounded-t-lg bg-raised p-6 pb-safe shadow-modal"
          >
            <div className="flex items-center justify-between">
              <Datum>Filters</Datum>
              <button
                type="button"
                onClick={() => setSheetOpen(false)}
                aria-label="Close filters"
                className="grid size-target place-items-center rounded-full text-fg-muted focus-visible:outline-2"
              >
                <Icon icon={X} size={20} />
              </button>
            </div>

            <div className="mt-6 flex flex-col gap-4">
              <SelectFilter
                id="sheet-locality"
                label="Locality"
                value={searchParams.get("locality")}
                options={options.localities.map((l) => ({ value: l, label: l }))}
                onChange={(value) => setFilter("locality", value)}
                fullWidth
              />
              <SelectFilter
                id="sheet-budget"
                label="Budget"
                value={searchParams.get("budget")}
                options={BUDGET_BANDS.map((b) => ({
                  value: b.value,
                  label: b.label,
                }))}
                onChange={(value) => setFilter("budget", value)}
                fullWidth
              />
              <SelectFilter
                id="sheet-year"
                label="Year"
                value={searchParams.get("year")}
                options={options.years.map((y) => ({
                  value: String(y),
                  label: String(y),
                }))}
                onChange={(value) => setFilter("year", value)}
                fullWidth
              />
            </div>

            <Button
              variant="primary"
              size="lg"
              className="mt-6 w-full"
              onClick={() => setSheetOpen(false)}
            >
              Show {resultCount} {resultCount === 1 ? "result" : "results"}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function SelectFilter({
  id,
  label,
  value,
  options,
  onChange,
  fullWidth = false,
}: {
  id: string;
  label: string;
  value: string | null;
  options: { value: string; label: string }[];
  onChange: (value: string | null) => void;
  fullWidth?: boolean;
}) {
  return (
    <Field id={id} label={label} className={fullWidth ? "w-full" : "w-44"}>
      <Select
        id={id}
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value || null)}
      >
        <option value="">Any</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
    </Field>
  );
}
