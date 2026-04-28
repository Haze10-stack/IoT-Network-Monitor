import { useState, useEffect, useCallback, useMemo } from 'react';
import { getDevices, getAlerts, getDevice } from '../api/client';
import StatCard    from '../components/StateCard';
import DeviceTable from '../components/DeviceTable';
import AlertList   from '../components/AlertList';
import RSSIChart   from '../components/RSSIChart';

const POLL_MS = 5000;
const TYPE_WORDS = ['Arch Linux', 'Rolling Release', 'Minimal Footprint', 'Terminal First'];

function ArchLogo({ offset }) {
  return (
    <div style={{
      width: '260px',
      height: '260px',
      borderRadius: '28px',
      background: 'rgba(24, 47, 81, 0.16)',
      border: '1px solid rgba(255,255,255,0.08)',
      boxShadow: '0 35px 80px rgba(0,0,0,0.28)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transform: `translate(${offset.x}px, ${offset.y}px)`,
      transition: 'transform 0.14s ease-out',
      position: 'relative',
    }}>
      <svg viewBox="0 0 260 260" style={{ width: '180px', height: '180px' }}>
        <defs>
          <linearGradient id="archGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1793d1" />
            <stop offset="100%" stopColor="#79c4ff" />
          </linearGradient>
        </defs>
        <path d="M130 24 L60 140 H94 L130 88 L166 140 H200 Z" fill="url(#archGrad)" />
        <path d="M130 80 L106 140 H154 Z" fill="rgba(255,255,255,0.18)" />
        <circle cx="130" cy="172" r="28" fill="rgba(255,255,255,0.08)" />
      </svg>
      <div style={{
        position: 'absolute',
        bottom: '16px',
        left: '50%',
        transform: 'translateX(-50%)',
        color: '#8fbfff',
        fontFamily: "'Space Mono'",
        fontSize: '12px',
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
      }}>
        Arch Linux
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [devices,     setDevices]     = useState([]);
  const [alerts,      setAlerts]      = useState([]);
  const [selectedMac, setSelectedMac] = useState(null);
  const [selectedDev, setSelectedDev] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [activeOnly,  setActiveOnly]  = useState(false);
  const [typedText,   setTypedText]   = useState(TYPE_WORDS[0]);
  const [typingIndex, setTypingIndex] = useState(0);
  const [isDeleting,  setIsDeleting]  = useState(false);
  const [logoOffset,  setLogoOffset]  = useState({ x: 0, y: 0 });

  const fetchAll = useCallback(async () => {
    const [devs, alts] = await Promise.all([
      getDevices(activeOnly),
      getAlerts(),
    ]);
    setDevices(devs);
    setAlerts(alts);
    setLastUpdated(new Date());
  }, [activeOnly]);

  useEffect(() => {
    fetchAll();
    const id = setInterval(fetchAll, POLL_MS);
    return () => clearInterval(id);
  }, [fetchAll]);

  useEffect(() => {
    if (!selectedMac) { setSelectedDev(null); return; }
    getDevice(selectedMac).then(setSelectedDev).catch(() => setSelectedDev(null));
  }, [selectedMac, devices]); // re-fetch when devices refresh

  useEffect(() => {
    const timeout = setTimeout(() => {
      const fullText = TYPE_WORDS[typingIndex % TYPE_WORDS.length];
      if (isDeleting) {
        setTypedText(prev => fullText.substring(0, prev.length - 1));
      } else {
        setTypedText(prev => fullText.substring(0, prev.length + 1));
      }

      if (!isDeleting && typedText === fullText) {
        setTimeout(() => setIsDeleting(true), 1200);
      } else if (isDeleting && typedText === '') {
        setIsDeleting(false);
        setTypingIndex(prev => prev + 1);
      }
    }, isDeleting ? 80 : 120);
    return () => clearTimeout(timeout);
  }, [typedText, isDeleting, typingIndex]);

  const handleHeroMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / 18;
    const y = (e.clientY - rect.top - rect.height / 2) / 18;
    setLogoOffset({ x, y });
  };

  const handleHeroLeave = () => setLogoOffset({ x: 0, y: 0 });

  const activeCount        = devices.filter(d => Date.now() - new Date(d.lastSeen).getTime() < 60_000).length;
  const unknownVendorCount = devices.filter(d => d.vendor === 'Unknown').length;
  const alertCount         = alerts.length;

  return (
    <div style={{ minHeight: '100vh', background: '#010409', color: '#e6edf3' }}>

      {/* ── Header ── */}
      <header style={{
        borderBottom: '1px solid #1e2a38',
        padding: '16px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#0d1117',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '10px', height: '10px', borderRadius: '50%',
            background: '#00ff9d', boxShadow: '0 0 8px #00ff9d',
            animation: 'pulse 2s infinite',
          }} />
          <span style={{ fontFamily: "'Space Mono'", fontSize: '16px', fontWeight: 700, letterSpacing: '0.1em', color: '#e6edf3' }}>
            NET<span style={{ color: '#00ff9d' }}>MONITOR</span>
          </span>
          <span style={{ fontFamily: "'DM Sans'", fontSize: '12px', color: '#484f58', marginLeft: '8px' }}>
            IoT Network Anomaly Detection
          </span>
        </div>
        <div style={{ fontFamily: "'Space Mono'", fontSize: '11px', color: '#484f58' }}>
          {lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString()}` : 'Connecting...'}
        </div>
      </header>

      <main style={{ padding: '28px 32px', maxWidth: '1440px', margin: '0 auto' }}>

        <section
          onMouseMove={handleHeroMove}
          onMouseLeave={handleHeroLeave}
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 360px',
            gap: '28px',
            alignItems: 'center',
            padding: '42px 40px',
            background: 'linear-gradient(180deg, rgba(8,15,30,0.96), rgba(4,8,15,0.96))',
            borderRadius: '24px',
            border: '1px solid rgba(255,255,255,0.06)',
            boxShadow: '0 35px 120px rgba(0,0,0,0.35)',
            marginBottom: '36px',
          }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#00ff9d', boxShadow: '0 0 10px rgba(0,255,157,0.4)' }} />
              <span style={{ fontFamily: "'Space Mono'", letterSpacing: '0.2em', fontSize: '12px', color: '#6fb6f0' }}>ARCH NETMONITOR</span>
            </div>
            <h1 style={{ fontFamily: "'Space Mono'", fontSize: '56px', lineHeight: 1.05, margin: 0, maxWidth: '700px' }}>
              Your IoT stack, powered by <span style={{ color: '#79c4ff' }}>Arch Linux</span>.
            </h1>
            <p style={{ fontFamily: "'DM Sans'", color: '#94a7c1', maxWidth: '660px', fontSize: '16px', marginTop: '18px', lineHeight: 1.8 }}>
              Visualize devices, detect anomalies, and explore the network with a responsive dashboard built for modern, rolling-release environments.
            </p>
            <div style={{ marginTop: '30px', display: 'flex', flexWrap: 'wrap', gap: '14px' }}>
              <div style={{ background: '#081223', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '18px 22px', minWidth: '180px' }}>
                <div style={{ fontSize: '14px', letterSpacing: '0.14em', color: '#6fb6f0', marginBottom: '8px', textTransform: 'uppercase' }}>Live Status</div>
                <div style={{ fontFamily: "'Space Mono'", fontSize: '28px', color: '#00ff9d' }}>{activeCount}</div>
                <div style={{ fontSize: '12px', color: '#7b8aa3', marginTop: '4px' }}>active devices</div>
              </div>
              <div style={{ background: '#081223', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '18px 22px', minWidth: '180px' }}>
                <div style={{ fontSize: '14px', letterSpacing: '0.14em', color: '#f4c24b', marginBottom: '8px', textTransform: 'uppercase' }}>Alerts</div>
                <div style={{ fontFamily: "'Space Mono'", fontSize: '28px', color: '#ff5a5a' }}>{alertCount}</div>
                <div style={{ fontSize: '12px', color: '#7b8aa3', marginTop: '4px' }}>open anomalies</div>
              </div>
            </div>
            <div style={{ marginTop: '36px', fontFamily: "'Space Mono'", fontSize: '20px', lineHeight: 1.25, color: '#e6edf3' }}>
              <span style={{ color: '#79c4ff' }}>{typedText}</span><span style={{ opacity: 0.75 }}>|</span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
            <ArchLogo offset={logoOffset} />
          </div>
        </section>

        <section style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '20px', alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <section style={{ background: '#0d1117', border: '1px solid #1e2a38', borderRadius: '6px', overflow: 'hidden' }}>
              <div style={{ padding: '18px 20px', borderBottom: '1px solid #1e2a38', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontFamily: "'DM Sans'", fontSize: '13px', letterSpacing: '0.16em', color: '#6fb6f0', textTransform: 'uppercase' }}>Device inventory</div>
                  <div style={{ fontFamily: "'Space Mono'", fontSize: '20px', color: '#e6edf3', marginTop: '6px' }}>Connected endpoints</div>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#8b949e', fontFamily: "'DM Sans'", fontSize: '12px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={activeOnly}
                    onChange={e => setActiveOnly(e.target.checked)}
                    style={{ accentColor: '#00ff9d' }}
                  />
                  Active only
                </label>
              </div>
              <DeviceTable
                devices={devices}
                onSelect={setSelectedMac}
                selectedMac={selectedMac}
                onUpdate={fetchAll}
              />
            </section>

            <section style={{ background: '#0d1117', border: '1px solid #1e2a38', borderRadius: '6px', padding: '18px' }}>
              <div style={{ fontFamily: "'DM Sans'", fontWeight: 600, color: '#e6edf3', fontSize: '14px', marginBottom: '14px' }}>
                Signal Strength History
              </div>
              <RSSIChart device={selectedDev} />
            </section>
          </div>

          <section style={{ background: '#0d1117', border: '1px solid #1e2a38', borderRadius: '6px', overflow: 'hidden' }}>
            <div style={{ padding: '18px 20px', borderBottom: '1px solid #1e2a38', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontFamily: "'DM Sans'", fontSize: '13px', letterSpacing: '0.16em', color: '#f4c24b', textTransform: 'uppercase' }}>Alerts</div>
                <div style={{ fontFamily: "'Space Mono'", fontSize: '20px', color: '#e6edf3', marginTop: '6px' }}>Live issues</div>
              </div>
              {alertCount > 0 && (
                <span style={{ background: '#ff4d4f22', color: '#ff4d4f', borderRadius: '12px', padding: '4px 10px', fontFamily: "'Space Mono'", fontSize: '12px', fontWeight: 700 }}>
                  {alertCount}
                </span>
              )}
            </div>
            <div style={{ padding: '12px' }}>
              <AlertList alerts={alerts} onResolve={fetchAll} />
            </div>
          </section>
        </section>
      </main>
    </div>
  );
}