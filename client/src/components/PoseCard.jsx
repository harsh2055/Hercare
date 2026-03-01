// client/src/components/PoseCard.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const INTENSITY_CONFIG = {
  gentle:   { label: 'Gentle',   color: '#166534', bg: '#dcfce7', dot: '#16a34a' },
  moderate: { label: 'Moderate', color: '#854d0e', bg: '#fef9c3', dot: '#ca8a04' },
  active:   { label: 'Active',   color: '#991b1b', bg: '#fee2e2', dot: '#dc2626' },
};

// Fallback SVG pose silhouette if image fails to load
function PoseSilhouette({ name }) {
  return (
    <div style={{
      width: '100%', height: '100%',
      background: 'linear-gradient(160deg, var(--sage-pale) 0%, var(--cream) 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      gap: 10,
    }}>
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
        {/* Simple figure doing yoga - universal pose silhouette */}
        <circle cx="32" cy="12" r="6" fill="var(--sage)" opacity="0.6" />
        <path d="M32 18 L32 40" stroke="var(--sage)" strokeWidth="3" strokeLinecap="round" opacity="0.6"/>
        <path d="M32 26 Q18 20 12 28" stroke="var(--sage)" strokeWidth="3" strokeLinecap="round" opacity="0.6"/>
        <path d="M32 26 Q46 20 52 28" stroke="var(--sage)" strokeWidth="3" strokeLinecap="round" opacity="0.6"/>
        <path d="M32 40 Q22 48 18 56" stroke="var(--sage)" strokeWidth="3" strokeLinecap="round" opacity="0.6"/>
        <path d="M32 40 Q42 48 46 56" stroke="var(--sage)" strokeWidth="3" strokeLinecap="round" opacity="0.6"/>
      </svg>
      <span style={{ fontSize: 11, color: 'var(--ink-soft)', fontWeight: 600, textAlign: 'center', padding: '0 12px' }}>
        {name}
      </span>
    </div>
  );
}

export default function PoseCard({ pose, index = 0 }) {
  const [flipped,    setFlipped]    = useState(false);
  const [imgError,   setImgError]   = useState(false);
  const [imgLoaded,  setImgLoaded]  = useState(false);

  const intensity = INTENSITY_CONFIG[pose.intensity] || INTENSITY_CONFIG.moderate;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      style={{ perspective: 1000, height: 360 }}
    >
      {/* ── Card flip container ─────────────────────────────────────────── */}
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{
          width: '100%', height: '100%',
          position: 'relative',
          transformStyle: 'preserve-3d',
          cursor: 'pointer',
        }}
        onClick={() => setFlipped(f => !f)}
      >
        {/* ════════════════════════════════════════════════════
            FRONT FACE — Image + name + quick info
        ════════════════════════════════════════════════════ */}
        <div style={{
          position: 'absolute', inset: 0,
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
          borderRadius: 6, overflow: 'hidden',
          background: 'var(--warm-white)',
          border: '1px solid var(--border)',
          boxShadow: '0 2px 16px rgba(26,46,31,0.07)',
          display: 'flex', flexDirection: 'column',
        }}>
          {/* Image area */}
          <div style={{ position: 'relative', flex: '0 0 200px', overflow: 'hidden', background: 'var(--sage-pale)' }}>

            {/* Loading shimmer */}
            {!imgLoaded && !imgError && pose.imageUrl && (
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(90deg, var(--sage-pale) 25%, var(--cream) 50%, var(--sage-pale) 75%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.4s infinite',
              }} />
            )}

            {/* Actual image */}
            {pose.imageUrl && !imgError ? (
              <img
                src={pose.imageUrl}
                alt={pose.name}
                onLoad={() => setImgLoaded(true)}
                onError={() => setImgError(true)}
                style={{
                  width: '100%', height: '100%',
                  objectFit: 'cover', objectPosition: 'center top',
                  opacity: imgLoaded ? 1 : 0,
                  transition: 'opacity 0.3s ease',
                  display: 'block',
                }}
              />
            ) : (
              <PoseSilhouette name={pose.name} />
            )}

            {/* Gradient overlay at bottom of image */}
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0, height: 80,
              background: 'linear-gradient(transparent, rgba(26,46,31,0.55))',
              pointerEvents: 'none',
            }} />

            {/* Duration badge — top left */}
            <div style={{
              position: 'absolute', top: 10, left: 10,
              background: 'rgba(26,46,31,0.8)',
              backdropFilter: 'blur(4px)',
              borderRadius: 2, padding: '3px 8px',
              fontSize: 10.5, fontWeight: 700,
              color: 'rgba(255,255,255,0.9)',
              letterSpacing: '0.04em',
            }}>
              ⏱ {pose.duration}
            </div>

            {/* Intensity badge — top right */}
            <div style={{
              position: 'absolute', top: 10, right: 10,
              background: intensity.bg,
              borderRadius: 2, padding: '3px 8px',
              fontSize: 10.5, fontWeight: 700,
              color: intensity.color,
              display: 'flex', alignItems: 'center', gap: 4,
            }}>
              <div style={{
                width: 6, height: 6, borderRadius: '50%',
                background: intensity.dot,
                flexShrink: 0,
              }} />
              {intensity.label}
            </div>

            {/* Flip hint — bottom right */}
            <div style={{
              position: 'absolute', bottom: 8, right: 10,
              fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.7)',
              letterSpacing: '0.06em', textTransform: 'uppercase',
              display: 'flex', alignItems: 'center', gap: 4,
            }}>
              Details ↺
            </div>
          </div>

          {/* Text area */}
          <div style={{ flex: 1, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {/* Sanskrit name */}
            {pose.sanskritName && (
              <p style={{
                fontSize: 10.5, fontWeight: 700,
                color: 'var(--sage)',
                letterSpacing: '0.1em', textTransform: 'uppercase',
                margin: 0,
              }}>
                {pose.sanskritName}
              </p>
            )}

            {/* English name */}
            <h3 style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: 20, fontWeight: 600,
              color: 'var(--ink)',
              margin: 0, lineHeight: 1.2,
            }}>
              {pose.name}
            </h3>

            {/* Description */}
            <p style={{
              fontSize: 12.5, color: 'var(--ink-soft)',
              lineHeight: 1.6, margin: 0, flex: 1,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}>
              {pose.description}
            </p>

            {/* Safety warning preview on front */}
            {pose.safetyWarning && (
              <div style={{
                display: 'flex', alignItems: 'flex-start', gap: 5,
                marginTop: 4,
              }}>
                <span style={{ color: '#dc2626', fontSize: 12, flexShrink: 0, marginTop: 1 }}>⚠</span>
                <p style={{
                  fontSize: 11, color: '#991b1b', fontWeight: 600,
                  margin: 0, lineHeight: 1.4,
                  display: '-webkit-box',
                  WebkitLineClamp: 1,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}>
                  See safety note
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ════════════════════════════════════════════════════
            BACK FACE — Benefits + full description + safety
        ════════════════════════════════════════════════════ */}
        <div style={{
          position: 'absolute', inset: 0,
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
          transform: 'rotateY(180deg)',
          borderRadius: 6, overflow: 'hidden',
          background: 'var(--forest)',
          border: '1px solid var(--forest)',
          boxShadow: '0 2px 16px rgba(26,46,31,0.15)',
          display: 'flex', flexDirection: 'column',
          padding: '22px 20px',
        }}>
          {/* Decorative circle */}
          <div style={{
            position: 'absolute', right: -30, top: -30,
            width: 120, height: 120, borderRadius: '50%',
            border: '1px solid rgba(201,168,76,0.2)',
            pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', right: 10, bottom: -20,
            width: 80, height: 80, borderRadius: '50%',
            border: '1px solid rgba(255,255,255,0.06)',
            pointerEvents: 'none',
          }} />

          {/* Name */}
          <div style={{ marginBottom: 14, position: 'relative' }}>
            {pose.sanskritName && (
              <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--gold)', letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 4px' }}>
                {pose.sanskritName}
              </p>
            )}
            <h3 style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: 21, fontWeight: 600,
              color: 'var(--cream)',
              margin: 0, lineHeight: 1.2,
            }}>
              {pose.name}
            </h3>
          </div>

          {/* Full description */}
          <p style={{
            fontSize: 12.5, color: 'rgba(255,255,255,0.7)',
            lineHeight: 1.7, margin: '0 0 16px',
            flex: pose.safetyWarning ? '0 0 auto' : 1,
          }}>
            {pose.description}
          </p>

          {/* Benefits */}
          {pose.benefits?.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 8px' }}>
                Benefits
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {pose.benefits.map((b, i) => (
                  <span key={i} style={{
                    padding: '3px 9px', borderRadius: 2,
                    background: 'rgba(122,158,130,0.25)',
                    border: '1px solid rgba(122,158,130,0.3)',
                    fontSize: 11, fontWeight: 600,
                    color: 'rgba(255,255,255,0.85)',
                    letterSpacing: '0.02em',
                  }}>
                    {b}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Duration + intensity row */}
          <div style={{ display: 'flex', gap: 10, marginBottom: pose.safetyWarning ? 12 : 0 }}>
            <div style={{
              flex: 1, padding: '8px 10px', borderRadius: 3,
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}>
              <p style={{ fontSize: 9.5, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 2px' }}>Duration</p>
              <p style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--cream)', margin: 0 }}>{pose.duration}</p>
            </div>
            <div style={{
              flex: 1, padding: '8px 10px', borderRadius: 3,
              background: `${intensity.bg}22`,
              border: `1px solid ${intensity.dot}33`,
            }}>
              <p style={{ fontSize: 9.5, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 2px' }}>Intensity</p>
              <p style={{ fontSize: 12.5, fontWeight: 600, color: intensity.bg, margin: 0 }}>{intensity.label}</p>
            </div>
          </div>

          {/* SAFETY WARNING — bold red box */}
          {pose.safetyWarning && (
            <div style={{
              marginTop: 'auto',
              padding: '10px 12px',
              background: '#7f1d1d',
              border: '1px solid #991b1b',
              borderRadius: 3,
              display: 'flex', alignItems: 'flex-start', gap: 8,
            }}>
              <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>⚠</span>
              <p style={{
                fontSize: 11.5, fontWeight: 700,
                color: '#fecaca',
                margin: 0, lineHeight: 1.5,
              }}>
                {pose.safetyWarning}
              </p>
            </div>
          )}

          {/* Flip back hint */}
          <p style={{
            fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)',
            letterSpacing: '0.06em', textTransform: 'uppercase',
            textAlign: 'right', marginTop: 10, marginBottom: 0,
          }}>
            ↺ Tap to flip back
          </p>
        </div>
      </motion.div>

      {/* Shimmer keyframe */}
      <style>{`
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </motion.div>
  );
}