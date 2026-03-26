import React from 'react'

/**
 * Mokorotlo (Basotho conical hat) SVG mark.
 * Used inline in sidebar, login card, passports, and certificates.
 *
 * Smart-contract namespace: LSAgriFlow_Supply_v1
 */

export function MokorotloMark({ size = 32, color = '#FFFFFF' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="LS-AgriFlow mokorotlo logo mark"
    >
      {/* Brim — wide ellipse at base */}
      <ellipse cx="32" cy="52" rx="26" ry="5" fill={color} opacity="0.9" />

      {/* Hat body — cone from brim up to peak */}
      <path
        d="M6 52 C6 52 18 38 24 22 C27 13 30 8 32 6 C34 8 37 13 40 22 C46 38 58 52 58 52 Z"
        fill={color}
        opacity="0.95"
      />

      {/* Decorative woven band near brim */}
      <path
        d="M10 46 C16 44 24 43 32 43 C40 43 48 44 54 46"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.4"
      />

      {/* Second decorative band — mid-cone */}
      <path
        d="M17 36 C21 34.5 26.5 34 32 34 C37.5 34 43 34.5 47 36"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity="0.35"
      />

      {/* Top knot / peak accent */}
      <circle cx="32" cy="6" r="2.5" fill={color} opacity="0.7" />

      {/* Chain-link accent below hat — the "blockchain" touch */}
      <path
        d="M26 57 Q28 60 32 60 Q36 60 38 57"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.5"
      />
    </svg>
  )
}

export function LogoFull({ dark = false }) {
  const textColor  = dark ? '#1F4E79' : '#FFFFFF'
  const subColor   = dark ? '#2E75B6' : 'rgba(255,255,255,0.65)'
  const hatColor   = dark ? '#1F4E79' : '#FFFFFF'

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <MokorotloMark size={38} color={hatColor} />
      <div>
        <div style={{
          fontWeight: 800,
          fontSize: 19,
          letterSpacing: '-0.5px',
          color: textColor,
          lineHeight: 1.1,
        }}>
          LS<span style={{ fontWeight: 400, opacity: 0.8 }}>-</span>AgriFlow
        </div>
        <div style={{
          fontSize: 10,
          color: subColor,
          letterSpacing: '0.3px',
          fontStyle: 'italic',
          marginTop: 1,
        }}>
          Ho tloha polasing ho ea 'marakeng
        </div>
      </div>
    </div>
  )
}

export function LogoCompact({ dark = false }) {
  const textColor = dark ? '#1F4E79' : '#FFFFFF'
  const hatColor  = dark ? '#1F4E79' : '#FFFFFF'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <MokorotloMark size={28} color={hatColor} />
      <span style={{ fontWeight: 800, fontSize: 15, color: textColor, letterSpacing: '-0.3px' }}>
        LS-AgriFlow
      </span>
    </div>
  )
}

/** Contract name constant — used in certificate issuance and ledger stamps */
export const CONTRACT_NAME = 'LSAgriFlow_Supply_v1'
export const PLATFORM_NAME = 'LS-AgriFlow'
export const TAGLINE       = "Ho tloha polasing ho ea 'marakeng"
export const VERIFY_DOMAIN = 'ls-agriflow.gov.ls'
