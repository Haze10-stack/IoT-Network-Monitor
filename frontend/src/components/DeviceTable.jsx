import { whitelistDevice } from '../api/client';

function rssiBar(rssi) {
  const pct   = Math.max(0, Math.min(100, ((rssi + 100) / 70) * 100));

  // muted grayscale + single blue accent
  const color =
    rssi > -60 ? '#1793d1' :
    rssi > -75 ? '#8d949b' :
                 '#6e7681';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div
        style={{
          width: '60px',
          height: '6px',
          background: '#222',
          borderRadius: '3px'
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: '100%',
            background: color,
            borderRadius: '3px',
            transition: 'width 0.4s'
          }}
        />
      </div>

      <span
        style={{
          fontFamily: "'Space Mono'",
          fontSize: '11px',
          color
        }}
      >
        {rssi} dBm
      </span>
    </div>
  );
}


function VendorBadge({ vendor }) {
  const isUnknown = !vendor || vendor === 'Unknown';

  return (
    <span
      style={{
        fontFamily: "'DM Sans'",
        fontSize: '11px',
        color: isUnknown ? '#9aa4af' : '#1793d1',
        background: isUnknown ? '#111' : '#101923',
        border: `1px solid ${isUnknown ? '#333' : '#1793d144'}`,
        borderRadius: '4px',
        padding: '2px 7px',
        whiteSpace: 'nowrap'
      }}
    >
      {isUnknown ? 'Unknown' : vendor}
    </span>
  );
}

export default function DeviceTable({ devices, onSelect, selectedMac, onUpdate }) {

  async function handleWhitelist(e, mac) {
    e.stopPropagation();
    await whitelistDevice(mac);
    onUpdate();
  }

  const TH = ({ children }) => (
    <th
      style={{
        textAlign: 'left',
        padding: '8px 12px',
        fontFamily: "'DM Sans'",
        fontSize: '11px',
        color: '#a8b0b8',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        borderBottom: '1px solid #2a2a2a',
        background: '#0a0a0a'
      }}
    >
      {children}
    </th>
  );


  return (
    <div style={{
      overflowX: 'auto',
      overflowY: 'auto',
      maxHeight: 'calc(100vh - 260px)',
      minHeight: 0,
      paddingRight: '4px'
    }}>

      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse'
        }}
      >
        <thead>
          <tr>
            <TH>MAC Address</TH>
            <TH>Vendor</TH>
            <TH>Node</TH>
            <TH>RSSI</TH>
            <TH>Last Seen</TH>
            <TH>Packets</TH>
            <TH>Status</TH>
            <TH></TH>
          </tr>
        </thead>

        <tbody>
          {devices.map(d => {

            const isActive =
              Date.now() - new Date(d.lastSeen).getTime() < 60000;

            const isSelected =
              d.mac === selectedMac;

            const latestRssi =
              d.rssiHistory?.at(-1)?.rssi ?? null;

            return (
              <tr
                key={d.mac}
                onClick={() => onSelect(d.mac)}
                style={{
                  cursor: 'pointer',
                  background: isSelected ? '#141414' : 'transparent',
                  borderBottom: '1px solid #222',
                  transition: 'background 0.15s'
                }}
                onMouseEnter={e => {
                  if (!isSelected)
                    e.currentTarget.style.background='#111';
                }}
                onMouseLeave={e => {
                  if (!isSelected)
                    e.currentTarget.style.background='transparent';
                }}
              >

                {/* MAC */}
                <td
                  style={{
                    padding: '10px 12px',
                    fontFamily: "'Space Mono'",
                    fontSize: '12px',
                    color: '#1793d1'
                  }}
                >
                  {d.mac}
                </td>


                {/* Vendor */}
                <td style={{ padding: '10px 12px' }}>
                  <VendorBadge vendor={d.vendor} />
                </td>


                {/* Node */}
                <td
                  style={{
                    padding: '10px 12px',
                    fontFamily: "'DM Sans'",
                    fontSize: '13px',
                    color: '#c4c9cf'
                  }}
                >
                  {d.nodeId}
                </td>


                {/* RSSI */}
                <td style={{ padding: '10px 12px' }}>
                  {latestRssi !== null
                    ? rssiBar(latestRssi)
                    : (
                      <span style={{color:'#888'}}>—</span>
                    )}
                </td>


                {/* Last Seen */}
                <td
                  style={{
                    padding: '10px 12px',
                    fontFamily: "'DM Sans'",
                    fontSize: '12px',
                    color: '#c4c9cf'
                  }}
                >
                  {new Date(d.lastSeen).toLocaleTimeString()}
                </td>


                {/* Packets */}
                <td
                  style={{
                    padding: '10px 12px',
                    fontFamily: "'Space Mono'",
                    fontSize: '12px',
                    color: '#e6edf3'
                  }}
                >
                  {d.seenCount?.toLocaleString()}
                </td>


                {/* Status */}
                <td style={{ padding: '10px 12px' }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      fontFamily: "'DM Sans'",
                      fontSize: '11px',
                      fontWeight: 600,
                      color: isActive
                        ? '#1793d1'
                        : '#8d949b'
                    }}
                  >
                    <span
                      style={{
                        width:'6px',
                        height:'6px',
                        borderRadius:'50%',
                        background: isActive
                          ? '#1793d1'
                          : '#8d949b',

                        boxShadow: isActive
                          ? '0 0 6px #1793d188'
                          : 'none'
                      }}
                    />

                    {isActive
                      ? 'Active'
                      : 'Idle'}
                  </span>
                </td>


                {/* Trust */}
                <td style={{ padding:'10px 12px' }}>

                  {!d.isKnown ? (
                    <button
                      onClick={e=>handleWhitelist(e,d.mac)}
                      style={{
                        background:'transparent',
                        border:'1px solid #333',
                        color:'#b6bec8',
                        borderRadius:'4px',
                        padding:'3px 10px',
                        cursor:'pointer',
                        fontFamily:"'DM Sans'",
                        fontSize:'11px'
                      }}
                    >
                      Trust
                    </button>
                  ) : (
                    <span
                      style={{
                        fontFamily:"'DM Sans'",
                        fontSize:'11px',
                        color:'#1793d1'
                      }}
                    >
                      ✓ Trusted
                    </span>
                  )}

                </td>

              </tr>
            );

          })}
        </tbody>
      </table>


      {!devices.length && (
        <div
          style={{
            color:'#8d949b',
            fontFamily:"'DM Sans'",
            padding:'30px',
            textAlign:'center'
          }}
        >
          No devices detected yet
        </div>
      )}

    </div>
  );
}