export default function StatCard({
  label,
  value,
  sub,
  accent = '#1793d1'
}) {
  return (
    <div
      style={{
        background: '#0a0a0a',
        border: '1px solid #222',
        borderTop: `3px solid ${accent}`,
        borderRadius: '4px',
        padding: '20px 24px',
        minWidth: '160px'
      }}
    >

      <div
        style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: '28px',
          fontWeight: 700,
          color: accent
        }}
      >
        {value}
      </div>


      <div
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: '13px',
          color: '#c4c9cf',
          marginTop: '4px',
          letterSpacing: '0.05em',
          textTransform: 'uppercase'
        }}
      >
        {label}
      </div>


      {sub && (
        <div
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '11px',
            color: '#8d949b',
            marginTop: '6px'
          }}
        >
          {sub}
        </div>
      )}

    </div>
  );
}