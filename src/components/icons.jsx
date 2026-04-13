const iconProps = { xmlns: "http://www.w3.org/2000/svg", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" };

const Icon = ({ children, size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...iconProps}>
    {children}
  </svg>
);

export const Dumbbell = (props) => (
  <Icon {...props}>
    <path d="M6.5 6.5v11" />
    <path d="M17.5 6.5v11" />
    <path d="M9 5v14" />
    <path d="M15 5v14" />
    <path d="M2 10h4" />
    <path d="M18 14h4" />
  </Icon>
);

export const Salad = (props) => (
  <Icon {...props}>
    <path d="M7 13c0-3 2.5-5.5 5.5-5.5S18 10 18 13c0 3.5-2.5 6-6 6s-5-2.5-5-6Z" />
    <path d="M5 11c0-2.5 1.5-4.5 3.5-5.5" />
    <path d="M12.5 7s.5-2 3-2c.5 0 1 .5 1 1 0 2-2.5 2.5-4 1Z" />
    <path d="m7.5 17 .5-.5" />
    <path d="m10 17 .5-.5" />
  </Icon>
);

export const BookOpen = (props) => (
  <Icon {...props}>
    <path d="M12 4.5v15" />
    <path d="M20 18.5V7a2 2 0 0 0-2-2h-5.5a1.5 1.5 0 0 0-1.5 1.5V18a1.5 1.5 0 0 1 1.5 1.5H18a2 2 0 0 0 2-2Z" />
    <path d="M4 18.5V7a2 2 0 0 1 2-2h5.5A1.5 1.5 0 0 1 13 6.5V18a1.5 1.5 0 0 0-1.5 1.5H6a2 2 0 0 1-2-2Z" />
  </Icon>
);

export const Sparkles = (props) => (
  <Icon {...props}>
    <path d="m6 9 1.5 4.5L12 15l-4.5 1.5L6 21l-1.5-4.5L0 15l4.5-1.5Z" />
    <path d="M18 4l.6 1.4L20 6l-1.4.6L18 8l-.6-1.4L16 6l1.4-.6Z" />
    <path d="M18 11l.6 1.4L20 13l-1.4.6L18 15l-.6-1.4L16 13l1.4-.6Z" />
    <path d="m21 16 1 2.5L24 19l-2 1-1 2-1-2-2-1 2-0.5Z" />
  </Icon>
);

export const HeartPulse = (props) => (
  <Icon {...props}>
    <path d="M12 21s-7-4.5-7-11a4.5 4.5 0 0 1 8-2.6A4.5 4.5 0 0 1 19 10c0 6.5-7 11-7 11Z" />
    <path d="m8 13 2 2.5 2.5-4L14 13h2" />
  </Icon>
);

export const Flame = (props) => (
  <Icon {...props}>
    <path d="M12 4c-.5 2-2.5 3.5-3 6-.4 1.8.4 3.9 3 5 2.6-1.1 3.4-3.2 3-5-.5-2.5-2.5-4-3-6Z" />
    <path d="M12 15a2 2 0 0 1-1.2-3.6" />
  </Icon>
);

export const Activity = (props) => (
  <Icon {...props}>
    <path d="M22 12h-3l-2 7-4-14-2 7H2" />
  </Icon>
);

export const Gauge = (props) => (
  <Icon {...props}>
    <path d="M12 15h.01" />
    <path d="M21 12a9 9 0 1 0-18 0" />
    <path d="m14.31 8.29-2.65 6.35" />
  </Icon>
);

export const ClipboardList = (props) => (
  <Icon {...props}>
    <rect x="5" y="3" width="14" height="18" rx="2" />
    <path d="M9 7h6" />
    <path d="M9 11h6" />
    <path d="M9 15h6" />
  </Icon>
);

export const Menu = (props) => (
  <Icon {...props}>
    <path d="M4 6h16" />
    <path d="M4 12h16" />
    <path d="M4 18h16" />
  </Icon>
);

export const X = (props) => (
  <Icon {...props}>
    <path d="M18 6 6 18" />
    <path d="M6 6l12 12" />
  </Icon>
);

export const Circle = (props) => (
  <Icon {...props}>
    <circle cx="12" cy="12" r="9" />
  </Icon>
);

export const CheckCircle = (props) => (
  <Icon {...props}>
    <path d="M9 12.5 11.5 15 16 9" />
    <circle cx="12" cy="12" r="9" />
  </Icon>
);
