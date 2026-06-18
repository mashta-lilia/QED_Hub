interface RingProps {
  pct: number;
  accent: string;
  size?: number;
  sw?: number;
}

export function Ring({ pct, accent, size = 40, sw = 5 }: RingProps) {
  const r = (size - sw) / 2;
  const c = 2 * Math.PI * r;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r} className="ring-bg" strokeWidth={sw} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        className="ring-fg"
        stroke={accent}
        strokeWidth={sw}
        strokeDasharray={c}
        strokeDashoffset={c * (1 - pct / 100)}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text x={size / 2} y={size / 2 + 4} className="ring-txt" fontSize={size * 0.3}>
        {Math.round(pct)}
      </text>
    </svg>
  );
}
