import React from "react";

interface LicLogoProps {
  className?: string;
  showText?: boolean;
  variant?: "default" | "white" | "compact";
  size?: "sm" | "md" | "lg" | "xl";
}

/**
 * Exact SVG recreation of the Langley Islamic Centre (LIC) official emblem:
 * - 5 Cerulean Sky Blue (#009FE3) onion domes (with elevated 2nd and 4th minarets)
 * - Deep Royal Blue (#005A9C) Square Kufic calligraphy base ("Al-Islam")
 * - Bold two-line "LANGLEY ISLAMIC / CENTRE" geometric typography
 */
export const LicLogo: React.FC<LicLogoProps> = ({
  className = "",
  showText = true,
  variant = "default",
  size = "md",
}) => {
  const domeColor = variant === "white" ? "#7FD4FF" : "#009FE3";
  const baseColor = variant === "white" ? "#FFFFFF" : "#005A9C";
  const textColor = variant === "white" ? "#FFFFFF" : "#009FE3";

  const sizeMap = {
    sm: showText ? "h-10" : "h-8",
    md: showText ? "h-14" : "h-10",
    lg: showText ? "h-24" : "h-16",
    xl: showText ? "h-32" : "h-24",
  };

  // Helper to generate an onion dome path centered at cx with bottom at baseY (width 56, height 44)
  const renderDome = (cx: number, baseY: number) => {
    const topY = baseY - 44;
    return (
      <path
        key={`dome-${cx}`}
        d={`
          M ${cx} ${topY}
          C ${cx + 4} ${topY + 10}, ${cx + 18} ${topY + 16}, ${cx + 25} ${topY + 26}
          C ${cx + 29} ${topY + 32}, ${cx + 29} ${baseY - 4}, ${cx + 27} ${baseY}
          L ${cx - 27} ${baseY}
          C ${cx - 29} ${baseY - 4}, ${cx - 29} ${topY + 32}, ${cx - 25} ${topY + 26}
          C ${cx - 18} ${topY + 16}, ${cx - 4} ${topY + 10}, ${cx} ${topY}
          Z
        `}
        fill={domeColor}
      />
    );
  };

  return (
    <div className={`inline-flex items-center select-none ${className}`}>
      <svg
        viewBox={showText ? "20 8 368 272" : "30 8 348 202"}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${sizeMap[size]} w-auto`}
        role="img"
        aria-label="Langley Islamic Centre Official Logo"
      >
        {/* 5 Cerulean Onion Domes (2nd and 4th elevated) */}
        {renderDome(68, 98)}   {/* 1st Dome (Left) */}
        {renderDome(136, 58)}  {/* 2nd Dome (Elevated Minaret) */}
        {renderDome(204, 98)}  {/* 3rd Dome (Centre) */}
        {renderDome(272, 58)}  {/* 4th Dome (Elevated Minaret) */}
        {renderDome(340, 98)}  {/* 5th Dome (Right) */}

        {/* Deep Royal Blue Square Kufic Calligraphy Base */}
        <g fill={baseColor}>
          {/* Column 1 (Left loop + Left bottom bar) */}
          {/* Top bar under Dome 1 */}
          <rect x="40" y="104" width="56" height="22" />
          {/* Left outer vertical stem */}
          <rect x="40" y="104" width="22" height="100" />
          {/* Right vertical stem of loop */}
          <rect x="74" y="104" width="22" height="66" />
          {/* Mid-lower closure of loop */}
          <rect x="62" y="148" width="34" height="22" />
          {/* Bottom horizontal bar extending to center */}
          <rect x="40" y="182" width="158" height="22" />

          {/* Column 2 (Elevated Minaret 1) */}
          {/* Top cap under Dome 2 */}
          <rect x="108" y="64" width="56" height="22" />
          {/* Left vertical shaft of Minaret 1 */}
          <rect x="108" y="64" width="22" height="72" />
          {/* Inner vertical stroke of Column 2 */}
          <rect x="142" y="96" width="22" height="74" />

          {/* Central Horizontal Connecting Bar (Columns 2 & 3) */}
          <rect x="108" y="148" width="158" height="22" />

          {/* Column 3 (Central Kufic Teeth under Dome 3) */}
          <rect x="176" y="104" width="22" height="66" />
          <rect x="210" y="104" width="22" height="66" />
          <rect x="244" y="104" width="22" height="66" />

          {/* Column 4 (Elevated Minaret 2) */}
          {/* Top cap under Dome 4 */}
          <rect x="244" y="64" width="56" height="22" />
          {/* Right vertical shaft of Minaret 2 */}
          <rect x="278" y="64" width="22" height="72" />

          {/* Column 5 (Rightmost Kufic strokes + Right bottom bar) */}
          {/* Inner vertical stroke under Dome 5 */}
          <rect x="312" y="104" width="22" height="66" />
          {/* Horizontal hook under Column 4/5 */}
          <rect x="278" y="148" width="56" height="22" />
          {/* Rightmost outer vertical stem */}
          <rect x="346" y="104" width="22" height="100" />
          {/* Bottom right horizontal bar meeting at center */}
          <rect x="210" y="182" width="158" height="22" />
        </g>

        {/* Bold Two-Line Typography */}
        {showText && (
          <g fill={textColor} style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
            <text
              x="204"
              y="241"
              textAnchor="middle"
              fontWeight="800"
              fontSize="31"
              letterSpacing="1.2"
            >
              LANGLEY ISLAMIC
            </text>
            <text
              x="204"
              y="273"
              textAnchor="middle"
              fontWeight="800"
              fontSize="31"
              letterSpacing="1.5"
            >
              CENTRE
            </text>
          </g>
        )}
      </svg>
    </div>
  );
};
