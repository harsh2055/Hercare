// client/src/components/CycleCalendar.jsx
import React from 'react';

export default function CycleCalendar({ cycleData, phase, cycleDay }) {
  const { logs = [] } = cycleData || {};
  const latest = logs[0];
  const today = new Date();

  const days = Array.from({ length: 35 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - 17 + i);
    return d;
  });

  const isToday = d => d.toDateString() === today.toDateString();

  const getType = date => {
    if (isToday(date)) return 'today';
    if (!latest) return null;
    const lp = new Date(latest.lastPeriodDate);
    const ov = new Date(latest.ovulationDate);
    const diffLp = Math.floor((date - lp) / 86400000);
    const diffOv = Math.abs(Math.floor((date - ov) / 86400000));
    if (diffLp >= 0 && diffLp < (latest.periodLength || 5)) return 'period';
    if (diffOv <= 2) return 'fertile';
    return null;
  };

  const styles = {
    today:   { background:'var(--forest)', color:'white', fontWeight:700, border:'none' },
    period:  { background:'#fecdd3', color:'#9f1239', border:'none' },
    fertile: { background:'#d1fae5', color:'#065f46', border:'none' },
    null:    { background:'transparent', color:'var(--ink-soft)', border:'none' },
  };

  return (
    <div>
      {/* Day headers */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:3, marginBottom:4 }}>
        {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
          <div key={d} style={{ textAlign:'center', fontSize:10, color:'var(--ink-faint)', fontWeight:700, letterSpacing:'0.06em', padding:'4px 0', textTransform:'uppercase' }}>{d}</div>
        ))}
      </div>

      {/* Days grid */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:3 }}>
        {days.map((date, i) => {
          const type = getType(date);
          const s = styles[type] || styles[null];
          return (
            <div key={i} style={{
              aspectRatio:'1', display:'flex', alignItems:'center', justifyContent:'center',
              borderRadius:3, fontSize:12, transition:'all 0.15s',
              ...s,
            }}>
              {date.getDate()}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{ display:'flex', gap:20, marginTop:14 }}>
        {[
          { color:'var(--forest)', label:'Today' },
          { color:'#fecdd3', label:'Period', border:'1px solid #fca5a5' },
          { color:'#d1fae5', label:'Fertile', border:'1px solid #6ee7b7' },
        ].map(item => (
          <div key={item.label} style={{ display:'flex', alignItems:'center', gap:6 }}>
            <div style={{ width:10, height:10, borderRadius:2, background:item.color, border:item.border||'none' }} />
            <span style={{ fontSize:11, color:'var(--ink-faint)', fontWeight:500, letterSpacing:'0.04em', textTransform:'uppercase' }}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
