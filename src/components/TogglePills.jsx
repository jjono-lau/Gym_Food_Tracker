export default function TogglePills({ options, value, onChange }) {
  return (
    <div className="grid w-full grid-cols-3 gap-1 rounded-3xl bg-white/70 p-1 shadow-inner shadow-pink/30 border border-white/60 sm:inline-flex sm:w-auto sm:max-w-full sm:overflow-auto sm:rounded-full">
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`relative min-h-10 rounded-full px-2 py-2 text-xs font-semibold leading-tight transition sm:px-4 sm:text-sm sm:leading-normal ${
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
