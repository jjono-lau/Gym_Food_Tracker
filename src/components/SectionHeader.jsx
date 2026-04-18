import { motion } from "framer-motion";

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
      <motion.h2
        initial={disableAnimation ? false : { opacity: 0, y: 12 }}
        whileInView={disableAnimation ? undefined : { opacity: 1, y: 0 }}
        animate={disableAnimation ? { opacity: 1, y: 0 } : undefined}
        transition={disableAnimation ? undefined : { duration: 0.4 }}
        viewport={disableAnimation ? undefined : { once: true }}
        className="text-3xl sm:text-4xl font-semibold text-ink"
      >
        {title}
      </motion.h2>
      {subtitle && <p className="text-base text-muted max-w-2xl mx-auto">{subtitle}</p>}
    </div>
  );
}
