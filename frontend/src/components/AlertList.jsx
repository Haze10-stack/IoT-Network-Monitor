import { resolveAlert } from '../api/client';

const SEVERITY_COLOR = {
  high: '#ff4d4f',
  medium: '#e8a320',
  low: '#7ab0c0'
};

const TYPE_LABEL = {
  rogue_device:   '[ROGUE_DEVICE]',
  traffic_spike:  '[TRAFFIC_SPIKE]',
  signal_anomaly: '[SIGNAL_ANOMALY]',
};

export default function AlertList({ alerts, onResolve }) {

  if (!alerts.length) {
    return (
      <div style={{
        color:'#8d7750',
        fontFamily:"'IBM Plex Mono'",
        padding:'20px 0',
        textAlign:'center',
        letterSpacing:'0.08em'
      }}>
        no active alerts
      </div>
    );
  }

  async function handleResolve(id){
    await resolveAlert(id);
    onResolve();
  }

  return (
    <div style={{
      display:'flex',
      flexDirection:'column',
      gap:'10px'
    }}>

      {alerts.map(a=>(
        <div
          key={a._id}
          style={{
            background:'#0a0a0a',
            border:'1px solid #433515',
            borderLeft:`4px solid ${SEVERITY_COLOR[a.severity] || '#b29652'}`,
            padding:'12px 16px',
            display:'flex',
            justifyContent:'space-between',
            alignItems:'center',
            gap:'12px'
          }}
        >

          <div style={{flex:1}}>

            <div style={{
              fontFamily:"'IBM Plex Mono'",
              fontSize:'10px',
              color:'#8d7750',
              letterSpacing:'0.18em',
              marginBottom:'6px'
            }}>
              ├── ALERT_EVENT
            </div>

            <div style={{
              fontFamily:"'IBM Plex Mono'",
              color: SEVERITY_COLOR[a.severity] || '#e8a320',
              fontSize:'13px',
              fontWeight:600
            }}>
              {TYPE_LABEL[a.type] || a.type}
            </div>

            <div style={{
              fontFamily:"'IBM Plex Mono'",
              color:'#b29652',
              fontSize:'12px',
              marginTop:'5px',
              lineHeight:1.6
            }}>
              {a.message}
            </div>

            <div style={{
              fontFamily:"'IBM Plex Mono'",
              color:'#6f5c28',
              fontSize:'10px',
              marginTop:'7px'
            }}>
              [{new Date(a.createdAt).toLocaleTimeString()}]
            </div>

          </div>

          <button
            onClick={()=>handleResolve(a._id)}
            style={{
              background:'transparent',
              border:'1px solid #6f5c28',
              color:'#b29652',
              padding:'6px 14px',
              cursor:'pointer',
              fontFamily:"'IBM Plex Mono'",
              fontSize:'11px',
              letterSpacing:'0.08em',
              whiteSpace:'nowrap'
            }}
            onMouseEnter={(e)=>{
              e.target.style.background='#1a1200';
              e.target.style.color='#e8a320';
            }}
            onMouseLeave={(e)=>{
              e.target.style.background='transparent';
              e.target.style.color='#b29652';
            }}
          >
            resolve →
          </button>

        </div>
      ))}

    </div>
  );
}