"use client";

import { useRef, useState, useEffect } from "react";
import NextLink from "next/link";
import { Star, CheckCircle2, ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { Display, Body } from "@/components/foundation/typography";
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
  initials: string;
  floatSpeed: number;
  floatPhase: number;
};

// 3 Handcrafted Testimonial Cards Positioned Completely Clear of Central Text Overlay
const THREE_TESTIMONIALS: DragCardData[] = [
  {
    id: "t1",
    quote: "The 38-step milestone protocol is real.",
    body: "ZYVORA gave us line-item BOQ numbers before we signed. Zero cost overrun and total transparency from day one.",
    clientName: "Anand Kulkarni",
    role: "Homeowner",
    project: "4BHK Villa • Baner, Pune",
    rating: 5,
    initialX: -390,
    initialY: -130,
    rotation: -4,
    initials: "AK",
    floatSpeed: 0.0012,
    floatPhase: 0,
  },
  {
    id: "t2",
    quote: "Delivered 14 days ahead of schedule.",
    body: "Daily 3D scan logs and pressure test certificates for every wet wall before tiling gave us 100% peace of mind.",
    clientName: "Priya & Vikram Deshmukh",
    role: "IT Director & Doctor",
    project: "Turnkey Home • Koregaon Park",
    rating: 5,
    initialX: 390,
    initialY: 110,
    rotation: 4,
    initials: "PD",
    floatSpeed: 0.0015,
    floatPhase: 2.1,
  },
  {
    id: "t3",
    quote: "Structural clarity with zero surprise costs.",
    body: "As an architect, I verified their steel & cement batch tests. ZYVORA adheres strictly to IS 456 engineering standards.",
    clientName: "Rajesh Malhotra",
    role: "Architectural Consultant",
    project: "Duplex Renovation • Kothrud",
    rating: 5,
    initialX: 390,
    initialY: -130,
    rotation: -3,
    initials: "RM",
    floatSpeed: 0.001,
    floatPhase: 4.2,
  },
];

function SelfFloatingDraggableCard({ card }: { card: DragCardData }) {
  const [pos, setPos] = useState({ x: card.initialX, y: card.initialY });
  const [floatOffset, setFloatOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [zIndex, setZIndex] = useState(10);
  const dragStart = useRef({ x: 0, y: 0, posX: 0, posY: 0 });

  // CONTINUOUS SELF-FLOATING ANIMATION VIA REQUESTANIMATIONFRAME
  useEffect(() => {
    if (isDragging) return;
    let animId: number;

    const animate = (time: number) => {
      const floatY = Math.sin(time * card.floatSpeed + card.floatPhase) * 12;
      const floatX = Math.cos(time * (card.floatSpeed * 0.8) + card.floatPhase) * 8;
      setFloatOffset({ x: floatX, y: floatY });
      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [isDragging, card.floatSpeed, card.floatPhase]);

  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setIsDragging(true);
    setZIndex(50);
    // Bake the current floatOffset into the base position when drag starts
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      posX: pos.x + floatOffset.x,
      posY: pos.y + floatOffset.y,
    };
    setFloatOffset({ x: 0, y: 0 });
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

  const currentX = pos.x + (isDragging ? 0 : floatOffset.x);
  const currentY = pos.y + (isDragging ? 0 : floatOffset.y);

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{
        transform: `translate3d(${currentX}px, ${currentY}px, 0) rotate(${
          isDragging ? 0 : card.rotation
        }deg) scale(${isDragging ? 1.05 : 1})`,
        zIndex,
      }}
      className={cn(
        "absolute left-1/2 top-1/2 w-[280px] sm:w-[320px] -ml-[140px] sm:-ml-[160px] -mt-[105px]",
        "select-none cursor-grab active:cursor-grabbing",
        "rounded-xl bg-white dark:bg-basalt-900 text-basalt-900 dark:text-basalt-050 p-5 sm:p-6 backdrop-blur-xl",
        "border border-basalt-200 dark:border-basalt-800 transition-shadow duration-300 shadow-lg shadow-basalt-900/5",
        isDragging
          ? "border-brass-500 shadow-2xl shadow-brass-500/20 ring-2 ring-brass-400/40"
          : "hover:border-brass-500/50 hover:shadow-xl",
      )}
    >
      {/* CARD HEADER WITH RATING & VERIFIED BADGE */}
      <div className="flex items-center justify-between border-b border-basalt-100 dark:border-basalt-800 pb-3 mb-3">
        <div className="flex items-center gap-1">
          {Array.from({ length: card.rating }).map((_, i) => (
            <Icon key={i} icon={Star} size={16} className="fill-brass-500 text-brass-500" />
          ))}
        </div>
        <span className="inline-flex items-center gap-1 font-mono text-caption text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 px-2 py-0.5 rounded-full">
          <Icon icon={CheckCircle2} size={16} />
          VERIFIED
        </span>
      </div>

      {/* QUOTE & BODY */}
      <h4 className="font-serif text-heading-xs font-bold text-basalt-900 dark:text-basalt-050 leading-snug">
        “{card.quote}”
      </h4>
      <p className="mt-2 font-sans text-body-sm text-basalt-600 dark:text-basalt-300 leading-relaxed line-clamp-3">
        {card.body}
      </p>

      {/* CLIENT FOOTER */}
      <div className="mt-4 pt-3 border-t border-basalt-100 dark:border-basalt-800/80 flex items-center gap-3">
        <div className="size-9 rounded-full bg-brass-500/15 border border-brass-500/30 text-brass-700 dark:text-brass-400 flex items-center justify-center font-mono font-bold text-caption shrink-0">
          {card.initials}
        </div>
        <div className="overflow-hidden">
          <span className="block font-sans text-body-sm font-semibold text-basalt-900 dark:text-basalt-100 truncate">
            {card.clientName}
          </span>
          <span className="block font-mono text-caption text-basalt-500 dark:text-basalt-400 truncate">
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
        {/* INTERACTIVE CANVAS CONTAINER matched perfectly with site light cream design */}
        <div
          ref={containerRef}
          className="relative min-h-[560px] sm:min-h-[620px] w-full rounded-2xl bg-bg-surface border border-border overflow-hidden shadow-sm flex items-center justify-center"
        >
          {/* Subtle architectural dot grid */}
          <div className="absolute inset-0 bg-[radial-gradient(#b8860b25_1.5px,transparent_1.5px)] [background-size:24px_24px] opacity-60 pointer-events-none" />

          {/* Floating hint badge */}
          <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-30 inline-flex items-center gap-2 rounded-full bg-white/90 dark:bg-basalt-900/90 border border-basalt-200 dark:border-basalt-800 px-3.5 py-1.5 font-mono text-caption text-brass-700 dark:text-brass-400 backdrop-blur-md shadow-sm pointer-events-none">
            <span className="size-2 rounded-full bg-brass-500 animate-pulse" />
            <span>✦ Self-Floating Cards — Drag to explore</span>
          </div>

          {/* 3 SELF-FLOATING DRAGGABLE CARDS */}
          {THREE_TESTIMONIALS.map((card) => (
            <SelfFloatingDraggableCard key={card.id} card={card} />
          ))}

          {/* CENTERED OVERLAY CONTENT (POINTER-EVENTS-NONE, CLEAN & LEGIBLE) */}
          <div className="relative z-20 max-w-lg px-6 text-center pointer-events-none flex flex-col items-center gap-4 py-12">
            <span className="inline-flex items-center gap-2 font-mono text-caption text-brass-700 dark:text-brass-400 tracking-widest uppercase rounded-full bg-white/90 dark:bg-basalt-900/90 px-4 py-1 border border-brass-500/30 backdrop-blur-md shadow-xs">
              CLIENT TESTIMONIALS & PROOF
            </span>

            <Display as="h2" size="xl" className="text-fg tracking-tight leading-tight">
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
