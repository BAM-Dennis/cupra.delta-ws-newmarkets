/* eslint-disable @next/next/no-img-element */
import type { PersonaDef } from "@/engine/types";

const SIZE = {
  sm: "size-10 text-[16px]",
  md: "size-14 text-[22px]",
  lg: "size-20 text-[30px]",
} as const;

/** Rundes Persona-Portrait; ohne Foto ein Kupferkreis mit der Initiale. */
export function PersonaAvatar({ persona, size = "md", className = "" }: { persona: PersonaDef; size?: keyof typeof SIZE; className?: string }) {
  const base = `shrink-0 overflow-hidden rounded-full border border-white/15 ${SIZE[size]} ${className}`;
  if (persona.image) {
    return <img alt={persona.name} src={persona.image} className={`${base} object-cover`} />;
  }
  return (
    <span className={`${base} flex items-center justify-center bg-copper-gradient font-medium leading-none text-white`} aria-hidden>
      {persona.name.charAt(0).toUpperCase()}
    </span>
  );
}
