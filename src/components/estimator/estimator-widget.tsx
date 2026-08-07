"use client";

import { useState } from "react";
import NextLink from "next/link";
import { ArrowRight, Calculator } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Heading, Body, Label } from "@/components/foundation/typography";
import { Icon } from "@/components/foundation/icon";

export function EstimatorWidget({
  defaultType = "house-construction",
  defaultLocality = "Baner",
  className,
}: {
  defaultType?: string;
  defaultLocality?: string;
  className?: string;
}) {
  const [projectType, setProjectType] = useState(defaultType);
  const [locality, setLocality] = useState(defaultLocality);
  const [area, setArea] = useState("2400");

  const buildUrl = () => {
    const params = new URLSearchParams({
      type: projectType,
      locality,
      area,
      step: "1",
    });
    return `/estimate?${params.toString()}`;
  };

  return (
    <div className={`rounded-md bg-blueprint-700 p-6 text-basalt-050 hairline ${className}`}>
      <div className="flex items-center gap-2 text-blueprint-300">
        <Icon icon={Calculator} size={20} />
        <Label className="text-blueprint-300">COMPACT ESTIMATOR WIDGET</Label>
      </div>

      <Heading as="h3" size="sm" className="mt-2 text-basalt-050">
        Calculate your cost range in 30 seconds
      </Heading>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <Label className="block text-blueprint-300 mb-1">PROJECT TYPE</Label>
          <Select
            value={projectType}
            onChange={(e) => setProjectType(e.target.value)}
            className="w-full bg-blueprint-800 text-basalt-050 border-blueprint-600"
          >
            <option value="house-construction">House Construction</option>
            <option value="turnkey-home-solutions">Turnkey Home Solutions</option>
            <option value="home-renovation">Home Renovation</option>
            <option value="interior-design">Interior Design</option>
            <option value="modular-kitchen">Modular Kitchen</option>
            <option value="waterproofing">Waterproofing</option>
            <option value="painting">Painting</option>
            <option value="electrical-work">Electrical Work</option>
            <option value="false-ceiling">False Ceiling</option>
          </Select>
        </div>

        <div>
          <Label className="block text-blueprint-300 mb-1">LOCALITY</Label>
          <Input
            value={locality}
            onChange={(e) => setLocality(e.target.value)}
            placeholder="e.g. Baner"
            className="w-full bg-blueprint-800 text-basalt-050 border-blueprint-600"
          />
        </div>

        <div>
          <Label className="block text-blueprint-300 mb-1">BUILT-UP AREA (SQ FT)</Label>
          <Input
            type="number"
            value={area}
            onChange={(e) => setArea(e.target.value)}
            placeholder="2400"
            className="w-full bg-blueprint-800 text-basalt-050 border-blueprint-600 font-mono"
          />
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <Button asChild variant="accent">
          <NextLink href={buildUrl()}>
            Calculate cost range
            <Icon icon={ArrowRight} size={16} className="ml-2" />
          </NextLink>
        </Button>
      </div>
    </div>
  );
}
