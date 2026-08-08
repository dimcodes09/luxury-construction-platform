"use client";

import { useRef, useState } from "react";
import NextLink from "next/link";
import { Star, CheckCircle2, ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { Display, Heading, Body, Label } from "@/components/foundation/typography";
import { Icon } from "@/components/foundation/icon";
import { Button } from "@/components/ui/button";

type DragCardData = {
  id: string;
  quote: string;
  body: string;
  clientName: string;
  role: string;
  project: string;
  rating: number;
  initialX: number;
  initialY: number;
  rotation: number;
  floatDelay: string;
  initials: string;
};

// Exactly 2 cards positioned clear of the central text (top-left & bottom-right)
const TWO_TESTIMONIALS: DragCardData[] = [
  {
    id: "t1",
    quote: "The 38-step milestone protocol is real.",
    body: "I've built twice before with local contractors. ZYVORA gave us line-item BOQ numbers before we signed. Zero cost overrun.",
    clientName: "Anand Kulkarni",
    role: "Homeowner",
    project: "4BHK Villa • Baner, Pune",
    rating: 5,
    initialX: -320,
    initialY: -110,
    rotation: -3,
    floatDelay: "0s",
    initials: "AK",
  },
  {
    id: "t2",
    quote: "Delivered 14 days ahead of occupancy.",
    body: "Seeing pressure test certificates for every wet wall before tiling was unbelievable. Daily 3D updates gave total peace of mind.",
    clientName: "Priya & Vikram Deshmukh",
    role: "IT Director & Doctor",
    project: "Turnkey Home • Koregaon Park",
    rating: 5,
    initialX: 320,
    initialY: 90,
    rotation: 3,
    floatDelay: "2.5s",
    initials: "PD",
  },
];

function FloatingDraggableCard({ card }: { card: DragCardData }) {
  const [pos, setPos] = useState({ x: card.initialX, y: card.initialY });
  const [isDragging, setIsDragging] = useState(false);
  const [zIndex, setZIndex] = useState(10);
  const dragStart = useRef({ x: 0, y: 0, posX: 0, posY: 0 });

  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setIsDragging(true);
    setZIndex(50);
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      posX: pos.x,
      posY: pos.y,
    };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setPos({
      x: dragStart.current.posX + dx,
      y: dragStart.current.posY + dy,
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Ignore if capture released
    }
    setIsDragging(false);
    setZIndex(20);
  };

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{
        transform: `translate3d(${pos.x}px, ${pos.y}px, 0) rotate(${
          isDragging ? 0 : card.rotation
        }deg) scale(${isDragging ? 1.04 : 1})`,
        zIndex,
      }}
      className={cn(
        "absolute left-1/2 top-1/2 w-[300px] sm:w-[340px] -ml-[150px] sm:-ml-[170px] -mt-[110px]",
        "select-none cursor-grab active:cursor-grabbing",
        "rounded-xl bg-basalt-900/90 text-basalt-050 p-6 backdrop-blur-xl",
        "border transition-shadow duration-300 hairline shadow-xl",
        !isDragging && "animate-bounce-subtle",
        isDragging
          ? "border-brass-500 shadow-2xl shadow-brass-500/20"
          : "border-basalt-700/80 hover:border-brass-500/60 hover:shadow-2xl",
      )}
    >
      {/* CARD HEADER WITH RATING & VERIFIED BADGE */}
      <div className="flex items-center justify-between border-b border-basalt-800 pb-3 mb-3">
        <div className="flex items-center gap-1">
          {Array.from({ length: card.rating }).map((_, i) => (
            <Icon key={i} icon={Star} size={16} className="fill-brass-400 text-brass-400" />
          ))}
        </div>
        <span className="inline-flex items-center gap-1 font-mono text-caption text-emerald-400">
          <Icon icon={CheckCircle2} size={16} />
          VERIFIED
        </span>
      </div>

      {/* QUOTE & BODY */}
      <h4 className="font-serif text-heading-xs font-bold text-basalt-050 leading-snug">
        “{card.quote}”
      </h4>
      <p className="mt-2 font-sans text-body-sm text-basalt-300 leading-relaxed line-clamp-3">
        {card.body}
      </p>

      {/* CLIENT FOOTER */}
      <div className="mt-4 pt-3 border-t border-basalt-800/80 flex items-center gap-3">
        <div className="size-9 rounded-full bg-brass-500/20 border border-brass-500/40 text-brass-400 flex items-center justify-center font-mono font-bold text-caption shrink-0">
          {card.initials}
        </div>
        <div className="overflow-hidden">
          <span className="block font-sans text-body-sm font-medium text-basalt-100 truncate">
            {card.clientName}
          </span>
          <span className="block font-mono text-caption text-basalt-400 truncate">
            {card.project}
          </span>
        </div>
      </div>
    </div>
  );
}

export function TestimonialsDragBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <section className="relative py-20 bg-bg border-y border-border">
      <div className="container-main">
        {/* INTERACTIVE CANVAS CONTAINER matching original theme */}
        <div
          ref={containerRef}
          className="relative min-h-[520px] sm:min-h-[580px] w-full rounded-2xl bg-bg-surface border border-border overflow-hidden shadow-sm flex items-center justify-center"
        >
          {/* Subtle theme dot grid */}
          <div className="absolute inset-0 bg-[radial-gradient(#b8860b25_1.5px,transparent_1.5px)] [background-size:24px_24px] opacity-70 pointer-events-none" />

          {/* Floating hint badge */}
          <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-30 inline-flex items-center gap-2 rounded-full bg-bg/90 border border-border px-3.5 py-1.5 font-mono text-caption text-brass-600 dark:text-brass-400 backdrop-blur-md shadow-sm pointer-events-none">
            <span className="size-2 rounded-full bg-brass-500 animate-pulse" />
            <span>✦ Interactive Floating Cards — Drag to move</span>
          </div>

          {/* EXACTLY 2 FLOATING DRAGGABLE CARDS */}
          {TWO_TESTIMONIALS.map((card) => (
            <FloatingDraggableCard key={card.id} card={card} />
          ))}

          {/* CENTERED OVERLAY CONTENT (POINTER-EVENTS-NONE) */}
          <div className="relative z-20 max-w-xl px-6 text-center pointer-events-none flex flex-col items-center gap-4 py-12">
            <span className="inline-flex items-center gap-2 font-mono text-caption text-brass-600 dark:text-brass-400 tracking-widest uppercase rounded-full bg-bg/90 px-4 py-1 border border-brass-500/30 backdrop-blur-md">
              CLIENT TESTIMONIALS & PROOF
            </span>

            <Display as="h2" size="xl" className="text-fg tracking-tight">
              Loved by thousands of happy homeowners
            </Display>

            <Body size="lg" className="text-fg-secondary max-w-md">
              Hear from our community of homeowners, architects, and site engineers who trust ZYVORA to build their dream homes.
            </Body>

            <div className="mt-4 pointer-events-auto">
              <Button asChild variant="accent" size="lg" className="shadow-md">
                <NextLink href="/reviews">
                  Read all verified reviews
                  <Icon icon={ArrowRight} size={20} className="ml-2" />
                </NextLink>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
