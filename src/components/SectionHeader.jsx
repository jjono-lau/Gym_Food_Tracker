import { m } from "framer-motion";

export default function SectionHeader({
  eyebrow,
  title,
  subtitle,
  align = "left",
  disableAnimation = false,
}) {
  return (
    <div className={`space-y-2 ${align === "center" ? "text-center" : ""}`}>
      {eyebrow && <p className="text-sm font-semibold text-muted uppercase tracking-[0.14em]">{eyebrow}</p>}
      <m.h2
        initial={disableAnimation ? false : { opacity: 0, y: 12 }}
        whileInView={disableAnimation ? undefined : { opacity: 1, y: 0 }}
        animate={disableAnimation ? { opacity: 1, y: 0 } : undefined}
        transition={disableAnimation ? undefined : { duration: 0.58, ease: [0.22, 1, 0.36, 1] }}
        viewport={disableAnimation ? undefined : { once: true }}
        className="text-3xl sm:text-4xl font-semibold text-ink"
      >
        {title}
      </m.h2>
      {subtitle && (
        <p className={`text-base text-muted max-w-2xl ${align === "center" ? "mx-auto" : ""}`}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
