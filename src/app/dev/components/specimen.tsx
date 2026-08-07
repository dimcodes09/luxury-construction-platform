"use client";

import { useState } from "react";
import { Check, Hammer, PaintRoller, Ruler } from "lucide-react";

import { Button, useSuccessFlash } from "@/components/ui/button";
import { Input, Textarea, Select } from "@/components/ui/input";
import { Field, FormRow, FormFootnote } from "@/components/ui/field";
import {
  Checkbox,
  ControlRow,
  Radio,
  RadioRoot,
  Switch,
} from "@/components/ui/checkbox";
import { SliderField } from "@/components/ui/slider";
import { Chip } from "@/components/ui/chip";
import { Tooltip, TooltipProvider } from "@/components/ui/tooltip";
import { Modal, ModalRoot, ModalTrigger, Sheet } from "@/components/ui/modal";
import {
  AccordionRoot,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { TabsRoot, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  DropdownRoot,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
  DropdownSeparator,
  PopoverRoot,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Toast, ToastProvider, ToastViewport } from "@/components/ui/toast";
import { LoadMore } from "@/components/ui/pagination";
import { Body } from "@/components/foundation/typography";
import { ShortlistButton } from "@/components/domain/shortlist-button";

/* Interactive specimens. Kept in one client island so the gallery page itself
 * stays a Server Component and every static component below renders on the
 * server — which is also a check that they genuinely ARE server-safe. */

export function ButtonStates() {
  const { active: flashed, flash } = useSuccessFlash();

  return (
    <div className="flex flex-wrap items-center gap-4">
      <Button>Default</Button>
      <Button className="hover:after:scale-x-100">Hover (forced)</Button>
      <Button autoFocus={false} className="outline-2 outline-offset-3 outline-focus">
        Focus (forced)
      </Button>
      <Button className="translate-y-px">Active (forced)</Button>
      <Button loading>Saving</Button>
      <Button success successLabel="Saved">
        Save to shortlist
      </Button>
      <Button disabled>Disabled</Button>
      <Button onClick={flash} success={flashed} successLabel="Saved">
        Click me (live 1600ms)
      </Button>
    </div>
  );
}

export function FormSpecimen() {
  const [area, setArea] = useState(2400);
  const [checked, setChecked] = useState(true);
  const [whatsapp, setWhatsapp] = useState(true);

  return (
    <div className="max-w-narrow">
      <FormRow columns={2}>
        <Field id="name" label="Your name" helper="As it should appear on the quote">
          <Input id="name" placeholder="e.g. Anjali Deshpande" />
        </Field>
        <Field id="phone" label="Phone" helper="We'll WhatsApp you first">
          <Input id="phone" inputMode="numeric" placeholder="e.g. 98765 43210" />
        </Field>
      </FormRow>

      <div className="mt-6">
        <Field
          id="area"
          label="Built-up area"
          helper="Carpet area is usually 70–80% of this"
        >
          <Input
            id="area"
            inputMode="numeric"
            defaultValue={2400}
            suffix="sq ft"
          />
        </Field>
      </div>

      <div className="mt-6">
        <Field
          id="email"
          label="Email"
          optional
          error="That doesn't look like an email address."
        >
          <Input id="email" invalid defaultValue="anjali@" />
        </Field>
      </div>

      <div className="mt-6">
        <Field id="type" label="Project type">
          <Select id="type" defaultValue="new-construction">
            <option value="new-construction">New construction</option>
            <option value="renovation">Renovation</option>
            <option value="interiors">Interiors</option>
          </Select>
        </Field>
      </div>

      <div className="mt-6">
        <Field
          id="brief"
          label="Tell us about the site"
          optional
          helper="Plot size, orientation, anything unusual"
        >
          <Textarea id="brief" placeholder="e.g. 40x60 plot, north-facing, corner" />
        </Field>
      </div>

      <div className="mt-6">
        <SliderField
          id="area-slider"
          label="Built-up area"
          value={area}
          onValueChange={setArea}
          min={500}
          max={8000}
          step={50}
          unit="sq ft"
          formatValue={(value) => value.toLocaleString("en-IN")}
        />
      </div>

      <div className="mt-6 flex flex-col">
        <ControlRow
          htmlFor="consent"
          control={
            <Checkbox
              id="consent"
              checked={checked}
              onCheckedChange={(next) => setChecked(next === true)}
            />
          }
          description="Deleted after 30 days. Never used to train anything."
        >
          I agree to the photo retention terms
        </ControlRow>

        <ControlRow
          htmlFor="whatsapp"
          control={
            <Switch
              id="whatsapp"
              checked={whatsapp}
              onCheckedChange={setWhatsapp}
            />
          }
        >
          Send updates on WhatsApp
        </ControlRow>

        <RadioRoot defaultValue="essential" className="mt-2">
          {["essential", "signature", "bespoke"].map((tier) => (
            <ControlRow
              key={tier}
              htmlFor={`tier-${tier}`}
              control={<Radio id={`tier-${tier}`} value={tier} />}
            >
              <span className="capitalize">{tier}</span>
            </ControlRow>
          ))}
        </RadioRoot>
      </div>

      <FormFootnote className="mt-6" />
    </div>
  );
}

export function ChipSpecimen() {
  const [selected, setSelected] = useState<string[]>(["renovation"]);

  const toggle = (value: string) =>
    setSelected((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value],
    );

  return (
    <div className="flex flex-wrap gap-3">
      {["new-construction", "renovation", "interiors", "commercial"].map(
        (value) => (
          <Chip
            key={value}
            selected={selected.includes(value)}
            onClick={() => toggle(value)}
          >
            {value.replace("-", " ")}
          </Chip>
        ),
      )}
      <Chip disabled>Disabled</Chip>
    </div>
  );
}

export function OverlaySpecimen() {
  return (
    <TooltipProvider>
      <div className="flex flex-wrap items-center gap-4">
        <Tooltip content="Because the tooltip must stay reachable on a disabled control (§3.1).">
          <Button variant="secondary">Hover for tooltip</Button>
        </Tooltip>

        <ModalRoot>
          <ModalTrigger asChild>
            <Button variant="secondary">Open modal</Button>
          </ModalTrigger>
          <Modal
            title="What this estimate excludes"
            description="Per-sq-ft construction rates cover structure, basic finishing and MEP only."
            footer={<Button size="md">Get a cost estimate</Button>}
          >
            <Body size="md">
              Interiors, furnishing and landscaping are additional. Most
              competitor calculators hide this, which is why homeowners feel
              misled later.
            </Body>
          </Modal>
        </ModalRoot>

        <ModalRoot>
          <ModalTrigger asChild>
            <Button variant="secondary">Open sheet (bottom)</Button>
          </ModalTrigger>
          <Sheet side="bottom" title="Filter projects">
            <Body size="md">The filter bottom sheet used below 1024px (§9.2).</Body>
          </Sheet>
        </ModalRoot>

        <DropdownRoot>
          <DropdownTrigger asChild>
            <Button variant="ghost">Dropdown</Button>
          </DropdownTrigger>
          <DropdownContent>
            <DropdownItem>Save to shortlist</DropdownItem>
            <DropdownItem>Download the spec sheet</DropdownItem>
            <DropdownSeparator />
            <DropdownItem disabled>Disabled item</DropdownItem>
          </DropdownContent>
        </DropdownRoot>

        <PopoverRoot>
          <PopoverTrigger asChild>
            <Button variant="ghost">Popover</Button>
          </PopoverTrigger>
          <PopoverContent>
            <Body size="sm" measure={false}>
              Popovers and dropdowns are the only two surfaces using
              --shadow-sheet (§2.5).
            </Body>
          </PopoverContent>
        </PopoverRoot>
      </div>
    </TooltipProvider>
  );
}

export function DisclosureSpecimen() {
  return (
    <div className="grid gap-12 lg:grid-cols-2">
      <div>
        <AccordionRoot type="single" collapsible defaultValue="a">
          <AccordionItem value="a">
            <AccordionTrigger>What does turnkey actually include?</AccordionTrigger>
            <AccordionContent>
              Structure, basic finishing and MEP. Interiors, furnishing and
              landscaping are quoted separately and listed in the exclusions.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="b">
            <AccordionTrigger>When do I pay?</AccordionTrigger>
            <AccordionContent>
              Against nine published milestones, each with a written release
              condition.
            </AccordionContent>
          </AccordionItem>
        </AccordionRoot>
      </div>

      <TabsRoot defaultValue="included">
        <TabsList>
          <TabsTrigger value="included">Included</TabsTrigger>
          <TabsTrigger value="excluded">Excluded</TabsTrigger>
          <TabsTrigger value="assumptions">Assumptions</TabsTrigger>
        </TabsList>
        <TabsContent value="included">
          <Body size="md">Structure, basic finishing, MEP rough-in.</Body>
        </TabsContent>
        <TabsContent value="excluded">
          <Body size="md">
            Interiors, furnishing, landscaping, statutory deposits.
          </Body>
        </TabsContent>
        <TabsContent value="assumptions">
          <Body size="md">Rate card v4, Baner multiplier 1.08, Signature tier.</Body>
        </TabsContent>
      </TabsRoot>
    </div>
  );
}

export function ToastSpecimen() {
  const [open, setOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);

  return (
    <ToastProvider swipeDirection="right">
      <div className="flex flex-wrap gap-4">
        <Button variant="secondary" onClick={() => setOpen(true)}>
          Show toast
        </Button>
        <Button variant="secondary" onClick={() => setErrorOpen(true)}>
          Show error toast (never auto-dismisses)
        </Button>
      </div>

      <Toast
        open={open}
        onOpenChange={setOpen}
        tone="success"
        title="Saved to your shortlist"
        description="Saved on this device. No account needed."
      />
      <Toast
        open={errorOpen}
        onOpenChange={setErrorOpen}
        tone="danger"
        title="We couldn't send that"
        description="Your details are still here. Try again, or WhatsApp us."
        action={
          <Button size="sm" variant="secondary">
            Retry
          </Button>
        }
      />
      <ToastViewport />
    </ToastProvider>
  );
}

export function ShortlistSpecimen() {
  const [saved, setSaved] = useState(false);
  return (
    <div className="group relative inline-flex rounded-md bg-basalt-800 p-4">
      <ShortlistButton
        saved={saved}
        onToggle={() => setSaved((v) => !v)}
        projectTitle="Ridgeline House"
      />
    </div>
  );
}

export function LoadMoreSpecimen() {
  const [loading, setLoading] = useState(false);
  return (
    <LoadMore
      loading={loading}
      remaining={18}
      onClick={() => {
        setLoading(true);
        setTimeout(() => setLoading(false), 1200);
      }}
    />
  );
}

export const specimenIcons = { Hammer, PaintRoller, Ruler, Check };
