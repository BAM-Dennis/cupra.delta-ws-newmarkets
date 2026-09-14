/* eslint-disable @next/next/no-img-element */

/**
 * Hintergrund aus dem Figma-Design der Streak Challenge. "start" ist die scharfe
 * Nachtaufnahme mit Overlay, "blur" die weichgezeichnete Variante aller anderen Screens.
 * `wide` hebt die 430-px-Begrenzung für die Trainer-/Beamer-Ansicht auf.
 */
export function Background({ variant, wide = false }: { variant: "start" | "blur"; wide?: boolean }) {
  const width = wide ? "max-w-none" : "max-w-[430px]";
  return (
    <div aria-hidden className={`pointer-events-none fixed inset-x-0 top-0 -z-10 mx-auto h-dvh w-full overflow-hidden bg-night ${width}`}>
      {variant === "start" ? (
        <>
          <img alt="" src="/design/bg-start.webp" className="absolute left-[-79%] top-[-20%] h-[155%] w-[254%] max-w-none object-cover" />
          <img alt="" src="/design/bg-overlay.webp" className="absolute left-[-24%] top-[-17.5%] aspect-square w-[148%] max-w-none object-cover" />
          <div className="absolute inset-x-0 bottom-0 h-[23%] bg-gradient-to-b from-transparent to-black/50 backdrop-blur-[5px]" />
        </>
      ) : (
        <>
          <img
            alt=""
            src="/design/bg-blur.webp"
            className={`absolute top-[-18%] max-w-none object-cover blur-[24px] ${wide ? "inset-x-[-10%] h-[135%] w-[120%]" : "left-[-61%] h-[135%] w-[222%]"}`}
          />
          <div className="absolute inset-0 bg-black/30" />
        </>
      )}
    </div>
  );
}
