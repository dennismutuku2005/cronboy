import React from "react";

// Helper to format cron to human-readable string
export function translateCron(expression) {
  if (!expression) return "No linked cron job";
  const trimmed = expression.trim().replace(/\s+/g, " ");
  if (trimmed === "0 0 * * *") return "Runs daily at 00:00 UTC";
  if (trimmed === "0 8 * * *") return "Runs daily at 08:00 UTC";
  if (trimmed === "* * * * *") return "Runs every minute";
  if (trimmed === "*/5 * * * *") return "Runs every 5 minutes";
  if (trimmed === "*/15 * * * *") return "Runs every 15 minutes";
  if (trimmed === "*/30 * * * *") return "Runs every 30 minutes";
  if (trimmed === "0 * * * *") return "Runs every hour";
  if (trimmed === "0 */2 * * *") return "Runs every 2 hours";
  if (trimmed === "0 0 * * 0") return "Runs weekly on Sunday";
  if (trimmed === "0 0 1 * *") return "Runs monthly on the 1st";
  
  const parts = trimmed.split(" ");
  if (parts.length === 5) {
    const [min, hour, dom, month, dow] = parts;
    if (min.startsWith("*/") && hour === "*" && dom === "*" && month === "*" && dow === "*") {
      return `Runs every ${min.slice(2)} minutes`;
    }
    if (min === "0" && hour.startsWith("*/") && dom === "*" && month === "*" && dow === "*") {
      return `Runs every ${hour.slice(3)} hours`;
    }
  }
  return `Runs on schedule: ${expression}`;
}

// Sparkline generator (80x28px)
export function renderSparkline(history, status) {
  if (!history || history.length === 0) return null;
  const maxVal = Math.max(...history) || 100;
  const minVal = Math.min(...history.filter(h => h > 0)) || 0;
  const range = maxVal - minVal || 1;

  const width = 80;
  const height = 28;
  const points = history.map((val, idx) => {
    const x = (idx / (history.length - 1)) * width;
    const y = val === 0 ? height - 2 : height - 2 - ((val - minVal) / range) * (height - 6);
    return `${x},${y}`;
  }).join(" ");

  const strokeColor = status === "down" ? "#EF4444" : (status === "degraded" ? "#F59E0B" : "#3B82F6");

  return (
    <svg className="stat-sparkline" width={width} height={height}>
      <polyline
        fill="none"
        stroke={strokeColor}
        strokeWidth="1.5"
        points={points}
      />
    </svg>
  );
}

// Trend area chart (center panels)
export function renderTrendChart(history, status) {
  if (!history || history.length === 0) return null;
  const maxVal = Math.max(...history) || 120;
  const minVal = Math.min(...history.filter(h => h > 0)) || 20;
  const range = (maxVal - minVal) || 1;

  const width = 500;
  const height = 130;
  const padding = { top: 10, bottom: 20, left: 35, right: 10 };

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const points = history.map((val, idx) => {
    const x = padding.left + (idx / (history.length - 1)) * chartWidth;
    const y = val === 0 ? padding.top + chartHeight : padding.top + chartHeight - ((val - minVal) / range) * chartHeight;
    return { x, y };
  });

  const pathD = points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(" ");
  const areaD = `${pathD} L ${points[points.length - 1].x} ${padding.top + chartHeight} L ${points[0].x} ${padding.top + chartHeight} Z`;

  const strokeColor = status === "down" ? "#EF4444" : (status === "degraded" ? "#F59E0B" : "#22C55E");
  const fillColor = status === "down" ? "rgba(239,68,68,0.08)" : (status === "degraded" ? "rgba(245,158,11,0.08)" : "rgba(34,197,94,0.08)");

  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
        const y = padding.top + chartHeight * ratio;
        return (
          <line
            key={idx}
            x1={padding.left}
            y1={y}
            x2={width - padding.right}
            y2={y}
            stroke="#F4F4F5"
            strokeDasharray="2,2"
            strokeWidth="1"
          />
        );
      })}

      {points.map((p, idx) => (
        <text
          key={idx}
          x={p.x}
          y={height - 2}
          textAnchor="middle"
          className="mono-text"
          fontSize="10"
          fill="#A1A1AA"
        >
          {`D-${7 - idx}`}
        </text>
      ))}

      <text x={4} y={padding.top + 8} className="mono-text" fontSize="10" fill="#A1A1AA">{maxVal}ms</text>
      <text x={4} y={padding.top + chartHeight} className="mono-text" fontSize="10" fill="#A1A1AA">{minVal}ms</text>

      <path d={areaD} fill={fillColor} />
      <path d={pathD} fill="none" stroke={strokeColor} strokeWidth="1.5" />

      {points.map((p, idx) => (
        <circle
          key={idx}
          cx={p.x}
          cy={p.y}
          r="3"
          fill="#FFFFFF"
          stroke={strokeColor}
          strokeWidth="1.5"
        />
      ))}
    </svg>
  );
}
