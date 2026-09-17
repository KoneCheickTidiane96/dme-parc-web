"use client";

// Motif de fond decoratif evoquant l'univers de l'electricite (pylone stylise,
// eclair, points façon lignes electriques), dans les couleurs CIE (orange/vert).

export function ElectricPatternBackground() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      <svg
        className="h-full w-full opacity-[0.12] dark:opacity-[0.16]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="cie-electric-pattern"
            width="160"
            height="160"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(8)"
          >
            {/* Pylone electrique stylise, en orange (couleur primary) */}
            <g stroke="var(--primary)" strokeWidth="2.5" fill="none" strokeLinecap="round">
              <path d="M50 10 L30 130 M50 10 L70 130 M35 50 L65 50 M32 80 L68 80 M38 110 L62 110" />
              <path d="M50 10 L50 0" />
            </g>
            {/* Eclair stylise, en vert (couleur success) */}
            <g fill="var(--success)">
              <path d="M120 20 L108 55 L118 55 L104 95 L124 58 L114 58 Z" />
            </g>
            {/* Petits points evoquant des lignes electriques */}
            <g fill="var(--primary)" opacity="0.7">
              <circle cx="10" cy="140" r="2.5" />
              <circle cx="140" cy="30" r="2.5" />
              <circle cx="90" cy="140" r="2.5" />
            </g>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#cie-electric-pattern)" />
      </svg>
    </div>
  );
}