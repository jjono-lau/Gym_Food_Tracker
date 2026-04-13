export default function TogglePills({ options, value, onChange }) {
  return (
    <div className="inline-flex rounded-full bg-white/70 p-1 shadow-inner shadow-pink/30 border border-white/60 overflow-auto max-w-full">
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`relative px-4 py-2 text-sm font-semibold rounded-full transition ${
              active ? "bg-gradient-to-r from-pink to-peach text-ink shadow-md" : "text-muted hover:text-ink"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
