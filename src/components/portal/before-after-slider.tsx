"use client";

import Image from "next/image";
import { useState } from "react";

type BeforeAfterSliderProps = {
  beforeImage: string;
  afterImage: string;
  title: string;
};

export default function BeforeAfterSlider({
  beforeImage,
  afterImage,
  title,
}: BeforeAfterSliderProps) {
  const [value, setValue] = useState(55);

  return (
    <div className="comparison-frame aspect-[16/10]">
      <Image
        src={beforeImage}
        alt={`${title} before intervention`}
        fill
        sizes="(min-width: 1024px) 58vw, 100vw"
        className="object-cover"
      />
      <div className="comparison-after" style={{ width: `${value}%` }}>
        <Image
          src={afterImage}
          alt={`${title} after intervention`}
          fill
          sizes="(min-width: 1024px) 58vw, 100vw"
          className="object-cover"
        />
      </div>
      <div className="comparison-handle" style={{ left: `${value}%` }} />
      <div className="absolute inset-x-4 bottom-4 flex items-center gap-4 rounded-lg bg-slate-950/70 p-4 text-white backdrop-blur">
        <span className="text-xs font-black uppercase tracking-[0.16em]">
          Before
        </span>
        <input
          type="range"
          min="8"
          max="92"
          value={value}
          onChange={(event) => setValue(Number(event.target.value))}
          className="comparison-range w-full"
          aria-label={`${title} before and after image comparison`}
        />
        <span className="text-xs font-black uppercase tracking-[0.16em]">
          After
        </span>
      </div>
    </div>
  );
}
