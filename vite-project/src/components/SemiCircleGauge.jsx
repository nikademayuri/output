// SemiCircleGauge.jsx
import React from "react";

/**
 * SemiCircleGauge
 * Props:
 *  - percent (0..100)
 *  - size (pixel width, default 260)
 *  - strokeWidth (default 18)
 *  - animate (bool) — enable CSS animation of the arc
 */
const getGaugeColor = (p) => {
  if (p < 34) return "#2563eb"; // blue
  if (p < 67) return "#fdba20"; // yellow
  return "#ee4444"; // red
};

const getPriorityText = (p) => {
  if (p < 34) return "Low Priority";
  if (p < 67) return "Medium Priority";
  return "High Priority";
};

export default function SemiCircleGauge({
  percent = 0,
  size = 260,
  strokeWidth = 18,
  animate = true,
}) {
  const p = Math.max(0, Math.min(100, Math.round(Number(percent) || 0)));
  const center = size / 2;
  const radius = center - strokeWidth / 2;

  // Path for the semicircle (left -> right, top arc)
  const pathD = `M ${center - radius} ${center} A ${radius} ${radius} 0 0 1 ${
    center + radius
  } ${center}`;

  // Length of the semicircle (approx)
  const total = Math.PI * radius;
  const visible = (p / 100) * total;

  // strokeDasharray + strokeDashoffset technique:
  // when offset = total -> nothing visible, offset = 0 -> full semicircle visible
  const dashArray = total; // numeric
  const dashOffset = Math.max(0, total - visible);

  // Compute end-point for pointer (angle moves from π -> 0 as percent increases)

  const color = getGaugeColor(p);
  const priority = getPriorityText(p);

  return (
    <div style={{ width: size, textAlign: "center", margin: "0 auto" }}>
      <svg
        width={size}
        height={size / 2}
        viewBox={`0 0 ${size} ${size / 2}`}
        style={{ overflow: "visible" }}
        aria-label={`Gauge ${p} percent`}
      >
        {/* background semicircle */}
        <path
          d={pathD}
          fill="none"
          stroke="#e9edf5"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* progress semicircle (same path, revealed via dashoffset) */}
        <path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={dashArray}
          strokeDashoffset={dashOffset}
          style={{
            transition: animate ? "stroke-dashoffset 700ms ease" : "none",
          }}
        />

        {/* Percentage text (centered) */}
        <text
          x="50%"
          y={center * 0.75}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={size / 9}
          fontWeight="700"
          fill={color}
        >
          {p}%
        </text>

        {/* Priority text (below percentage) */}
        <text
          x="50%"
          y={center * 0.95}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={size / 14}
          fontWeight="600"
          fill={color}
        >
          {priority}
        </text>
      </svg>
    </div>
  );
}
