/* eslint-disable @next/next/no-img-element */
import type { PersonaDef } from "@/engine/types";

const SIZE = {
  sm: "size-10 text-[14px]",
  md: "size-14 text-[18px]",
  lg: "size-20 text-[26px]",
} as const;

/** Initialen aus dem Namen, Artikel überspringen: "The Ruiz Family" → "RF", "Mika" → "M". */
export function personaInitials(name: string): string {
  const words = name.split(/\s+/).filter((w) => w && !/^(the|a|an|die|der|das)$/i.test(w));
  return words.slice(0, 2).map((w) => w.charAt(0).toUpperCase()).join("") || name.charAt(0).toUpperCase();
}

/** Rundes Persona-Portrait; ohne Foto ein Kupferkreis mit den Initialen (einheitlicher Fallback). */
export function PersonaAvatar({ persona, size = "md", className = "" }: { persona: PersonaDef; size?: keyof typeof SIZE; className?: string }) {
  const base = `shrink-0 overflow-hidden rounded-full border border-white/15 ${SIZE[size]} ${className}`;
  if (persona.image) {
    return <img alt={persona.name} src={persona.image} className={`${base} object-cover`} />;
  }
  return (
    <span className={`${base} flex items-center justify-center bg-copper-gradient font-medium leading-none tracking-[1px] text-white`} aria-hidden>
      {personaInitials(persona.name)}
    </span>
  );
}
