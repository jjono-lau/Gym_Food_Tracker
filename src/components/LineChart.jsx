import { motion } from "framer-motion";

export default function LineChart({ data, color = "#ffb7a2", height = 140, label }) {
  const max = Math.max(...data.map((d) => d.value)) || 1;
  const min = Math.min(...data.map((d) => d.value)) || 0;
  const range = max - min || 1;
  const points = data
    .map((d, i) => {
      const x = (i / Math.max(data.length - 1, 1)) * 100;
      const y = ((max - d.value) / range) * 100;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-semibold text-ink">{label}</p>
        <p className="text-xs text-muted">{data.at(-1)?.value ?? ""}</p>
      </div>
      <div className="relative">
        <svg viewBox="0 0 100 100" className="w-full" style={{ height }}>
          <defs>
            <linearGradient id="lineGradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.9" />
              <stop offset="100%" stopColor={color} stopOpacity="0.15" />
            </linearGradient>
          </defs>
          <polyline
            fill="none"
            stroke="#f3e6ff"
            strokeWidth="1.5"
            points="0,0 0,100 100,100 100,0"
            opacity="0"
          />
          <motion.polyline
            fill="none"
            stroke={color}
            strokeWidth="2"
            points={points}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            strokeLinecap="round"
          />
          <motion.polygon
            points={`${points} 100,100 0,100`}
            fill="url(#lineGradient)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.35 }}
            transition={{ delay: 0.2 }}
          />
          {data.map((d, i) => {
            const x = (i / Math.max(data.length - 1, 1)) * 100;
            const y = ((max - d.value) / range) * 100;
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="1.8"
                fill="#2b1b2d"
                stroke={color}
                strokeWidth="1"
              />
            );
          })}
        </svg>
      </div>
      <div className="mt-1 flex justify-between text-[11px] text-muted uppercase tracking-wide">
        {data.map((d) => (
          <span key={d.label}>{d.label}</span>
        ))}
      </div>
    </div>
  );
}
