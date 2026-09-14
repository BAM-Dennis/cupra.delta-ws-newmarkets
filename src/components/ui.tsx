import Link from "next/link";
import type { ReactNode } from "react";

const BUTTON_BASE =
  "flex min-h-12 w-full items-center justify-center gap-1 rounded-[6px] px-4 py-[14px] text-center text-[14px] font-medium uppercase leading-5 tracking-[1px] transition active:scale-[0.99] disabled:opacity-40";

/** Primär-Button im Kupfer-Verlauf (Figma "Button", Type=Primary). */
export function PrimaryButton({
  children, onClick, type = "button", disabled, href, className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  href?: string;
  className?: string;
}) {
  const cls = `${BUTTON_BASE} bg-copper-gradient text-white ${className}`;
  if (href) return <Link href={href} className={cls}>{children}</Link>;
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={cls}>
      {children}
    </button>
  );
}

/** Sekundär-Button als Glasfläche mit Rand. */
export function SecondaryButton({
  children, onClick, href, disabled, className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
  className?: string;
}) {
  const cls = `${BUTTON_BASE} border border-white/25 bg-white/5 text-white backdrop-blur-[10px] ${className}`;
  if (href) return <Link href={href} className={cls}>{children}</Link>;
  return (
    <button type="button" onClick={onClick} disabled={disabled} className={cls}>
      {children}
    </button>
  );
}

/** Dunkle Karte mit feinem Rand und Innenschatten (Figma "Status Bar Container"). */
export function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <section className={`relative flex flex-col gap-4 rounded-[12px] border border-white/10 bg-black/10 px-5 pb-5 pt-[15px] shadow-[inset_0_2px_2px_0_rgba(0,0,0,0.1)] ${className}`}>
      {children}
    </section>
  );
}

/** Kleine Kennzahl-Kachel (Figma "Player Row" / "Result Row"). */
export function StatTile({
  label, children, footer, variant = "default", className = "",
}: {
  label?: string;
  children: ReactNode;
  footer?: string;
  variant?: "default" | "you";
  className?: string;
}) {
  const tone = variant === "you" ? "border-copper bg-copper/10" : "border-white/5 bg-white/5";
  return (
    <div className={`flex min-w-0 flex-1 flex-col items-center justify-end gap-[7px] rounded-[6px] border p-2 shadow-card ${tone} ${className}`}>
      {label && <p className="w-full truncate text-center text-[8px] font-medium uppercase leading-none">{label}</p>}
      <div className="flex w-full items-center justify-center gap-[3px] text-[16px] font-medium leading-none">{children}</div>
      {footer !== undefined && (
        <p className="w-full truncate text-center text-[10px] font-medium uppercase leading-none">{footer || " "}</p>
      )}
    </div>
  );
}

/** Kleines Overline-Label, z. B. "ROUND 2 OF 4". */
export function Overline({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <p className={`text-[10px] font-medium uppercase leading-[1.2] tracking-[1px] ${className}`}>{children}</p>;
}

const BADGE: Record<"teal" | "copper" | "neutral" | "correct" | "warn" | "signal", string> = {
  teal: "bg-teal-tint border border-teal/60 text-white",
  copper: "bg-copper/20 border border-copper text-white",
  neutral: "bg-white/10 border border-white/10 text-white/70",
  correct: "bg-correct/25 border border-correct text-white",
  warn: "bg-warn/25 border border-warn text-white",
  signal: "bg-signal/25 border border-signal text-white",
};

/** Kleine Pille für Schwierigkeit, Treffer, Status. */
export function Badge({ tone = "neutral", children, className = "" }: { tone?: keyof typeof BADGE; children: ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-[10px] py-[4px] text-[10px] font-medium uppercase leading-none tracking-[1px] ${BADGE[tone]} ${className}`}>
      {children}
    </span>
  );
}

/** Texteingabe im Stil des Nickname-Felds der Streak Challenge. */
export function TextField({
  id, value, onChange, placeholder, maxLength, type = "text", inputMode, autoFocus,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  maxLength?: number;
  type?: "text" | "number";
  inputMode?: "text" | "numeric";
  autoFocus?: boolean;
}) {
  return (
    <div className="flex h-[54px] w-full items-center rounded-[6px] border border-white/25 bg-white/5 px-4 focus-within:border-white/60">
      <input
        id={id}
        type={type}
        inputMode={inputMode}
        value={value}
        maxLength={maxLength}
        autoComplete="off"
        autoFocus={autoFocus}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="min-w-0 flex-1 bg-transparent text-[14px] uppercase leading-[1.2] tracking-[0.56px] text-white outline-none placeholder:text-white/50"
      />
    </div>
  );
}

/** Kurzer Fehlerhinweis in Signalfarbe. */
export function ErrorText({ children }: { children: ReactNode }) {
  return <p className="text-center text-[13px] leading-[1.3] text-signal">{children}</p>;
}
