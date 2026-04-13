import { motion } from "framer-motion";

export default function SectionHeader({ eyebrow, title, subtitle, align = "left" }) {
  return (
    <div className={`space-y-2 ${align === "center" ? "text-center" : ""}`}>
      {eyebrow && <p className="text-sm font-semibold text-muted uppercase tracking-[0.14em]">{eyebrow}</p>}
      <motion.h2
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        viewport={{ once: true }}
        className="text-3xl sm:text-4xl font-semibold text-ink"
      >
        {title}
      </motion.h2>
      {subtitle && <p className="text-base text-muted max-w-2xl mx-auto">{subtitle}</p>}
    </div>
  );
}
