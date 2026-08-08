"use client";

import { useRef, useState, useCallback } from "react";
import NextLink from "next/link";
import { Star, CheckCircle2, ArrowRight, MoveHand } from "lucide-react";

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
  avatarUrl?: string;
  initials: string;
};

const TESTIMONIAL_CARDS: DragCardData[] = [
  {
    id: "t1",
    quote: "The 38-step milestone protocol is real.",
    body: "I've built twice before with local contractors and both times were nightmares of cost escalation. ZYVORA gave us line-item BOQ numbers before we signed.",
    clientName: "Anand Kulkarni",
    role: "Homeowner",
    project: "4BHK Villa • Baner, Pune",
    rating: 5,
    initialX: -320,
    initialY: -140,
    rotation: -4,
    initials: "AK",
  },
  {
    id: "t2",
    quote: "Behind-the-wall photos gave us 100% peace of mind.",
    body: "Seeing pressure test certificates for every wet wall before tiles were laid was unbelievable. No hidden shortcuts anywhere.",
    clientName: "Priya & Vikram Deshmukh",
    role: "IT Director & Doctor",
    project: "Turnkey Home • Koregaon Park",
    rating: 5,
    initialX: 280,
    initialY: -160,
    rotation: 5,
    initials: "PD",
  },
  {
    id: "t3",
    quote: "Zero cost overrun beyond our approved BOQ.",
    body: "They quoted ₹58.4 Lakhs in the initial deterministic estimate and final handover came in at exactly ₹58.2 Lakhs. Unmatched engineering discipline.",
    clientName: "Rajesh Malhotra",
    role: "Architectural Consultant",
    project: "Duplex Renovation • Kothrud",
    rating: 5,
    initialX: -360,
    initialY: 120,
    rotation: 3,
    initials: "RM",
  },
  {
    id: "t4",
    quote: "Delivered 14 days ahead of promised occupancy.",
    body: "The site engineer sent daily photographic logs and 3D scan updates. They treated our house with the exact precision of a commercial project.",
    clientName: "Sneha & Amit Patil",
    role: "Homeowners",
    project: "3BHK Luxury Interior • Wakad",
    rating: 5,
    initialX: 300,
    initialY: 110,
    rotation: -3,
    initials: "SP",
  },
  {
    id: "t5",
    quote: "The structural foundation documentation is bulletproof.",
    body: "As a civil engineer myself, I checked every steel benchmark and cube test result. ZYVORA adheres strictly to IS 456 standards.",
    clientName: "Er. Rameshwar Rao",
    role: "Senior Civil Engineer",
    project: "Custom Bungalow • Kalyani Nagar",
    rating: 5,
    initialX: 0,
    initialY: -220,
    rotation: 2,
    initials: "RR",
  },
];

function DraggableCard({
  card,
  containerRef,
}: {
  card: DragCardData;
  containerRef: React.RefObject<HTMLDivElement | null>;
}) {
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
        }deg) scale(${isDragging ? 1.05 : 1})`,
        zIndex,
      }}
      className={cn(
        "absolute left-1/2 top-1/2 w-[310px] sm:w-[350px] -ml-[155px] sm:-ml-[175px] -mt-[110px]",
        "select-none cursor-grab active:cursor-grabbing",
        "rounded-xl bg-basalt-900/90 p-6 backdrop-blur-xl",
        "border transition-shadow duration-200 hairline",
        isDragging
          ? "border-brass-500 shadow-2xl shadow-brass-500/20"
          : "border-basalt-700/80 hover:border-brass-500/50 hover:shadow-xl",
      )}
    >
      {/* CARD HEADER WITH RATING & VERIFIED BADGE */}
      <div className="flex items-center justify-between border-b border-basalt-800 pb-3 mb-3">
        <div className="flex items-center gap-1">
          {Array.from({ length: card.rating }).map((_, i) => (
            <Icon key={i} icon={Star} size={14} className="fill-brass-400 text-brass-400" />
          ))}
        </div>
        <span className="inline-flex items-center gap-1 text-caption font-mono text-emerald-400">
          <Icon icon={CheckCircle2} size={14} />
          VERIFIED CLIENT
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
    <section className="relative py-20 overflow-hidden bg-basalt-950 text-basalt-050">
      <div className="container-main">
        {/* INTERACTIVE CANVAS CONTAINER */}
        <div
          ref={containerRef}
          className="relative min-h-[580px] sm:min-h-[640px] lg:min-h-[700px] w-full rounded-2xl bg-basalt-900/60 border border-basalt-800 overflow-hidden shadow-2xl flex items-center justify-center"
        >
          {/* ARCHITECTURAL DOT GRID PATTERN */}
          <div className="absolute inset-0 bg-[radial-gradient(#b8860b20_1.5px,transparent_1.5px)] [background-size:28px_28px] opacity-60 pointer-events-none" />
          
          {/* RADIAL GLOW ACCENTS */}
          <div className="absolute -top-32 -left-32 size-96 rounded-full bg-brass-500/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -right-32 size-96 rounded-full bg-brass-500/10 blur-3xl pointer-events-none" />

          {/* INTERACTIVE HINT BADGE */}
          <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-30 inline-flex items-center gap-2 rounded-full bg-basalt-900/90 border border-basalt-700 px-3.5 py-1.5 font-mono text-caption text-brass-400 backdrop-blur-md shadow-md pointer-events-none">
            <span className="size-2 rounded-full bg-brass-400 animate-pulse" />
            <span>✦ Interactive Canvas — Drag reviews around</span>
          </div>

          {/* DRAGGABLE CARDS LAYER */}
          {TESTIMONIAL_CARDS.map((card) => (
            <DraggableCard key={card.id} card={card} containerRef={containerRef} />
          ))}

          {/* CENTERED OVERLAY CONTENT (POINTER-EVENTS-NONE) */}
          <div className="relative z-20 max-w-2xl px-6 text-center pointer-events-none flex flex-col items-center gap-4 py-12">
            <span className="inline-flex items-center gap-2 font-mono text-caption text-brass-400 tracking-widest uppercase rounded-full bg-basalt-900/90 px-4 py-1 border border-brass-500/30 backdrop-blur-md">
              CLIENT TESTIMONIALS & PROOF
            </span>

            <Display as="h2" size="xl" className="text-basalt-050 tracking-tight drop-shadow-md">
              Loved by thousands of happy homeowners
            </Display>

            <Body size="lg" className="text-basalt-200 max-w-lg drop-shadow-sm">
              Hear from our community of homeowners, architects, and site engineers who trust ZYVORA to build their dream homes.
            </Body>

            <div className="mt-4 pointer-events-auto">
              <Button asChild variant="accent" size="lg" className="shadow-xl">
                <NextLink href="/reviews">
                  Read all verified reviews
                  <Icon icon={ArrowRight} size={18} className="ml-2" />
                </NextLink>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
