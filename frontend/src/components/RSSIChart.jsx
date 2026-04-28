import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';

export default function RSSIChart({ device }) {

  if (!device || !device.rssiHistory?.length) {
    return (
      <div
        style={{
          color: '#8d949b',
          fontFamily: "'DM Sans'",
          padding: '20px',
          textAlign: 'center'
        }}
      >
        Select a device to view RSSI history
      </div>
    );
  }

  const data = device.rssiHistory.map((r,i) => ({
    name: i,
    rssi: r.rssi,
    time: new Date(r.ts).toLocaleTimeString(),
  }));


  return (
    <div>

      <div
        style={{
          fontFamily: "'Space Mono'",
          fontSize: '11px',
          color: '#c4c9cf',
          marginBottom: '12px'
        }}
      >
        {device.mac} — RSSI over last {data.length} readings
      </div>


      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>

          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#222"
          />

          <XAxis
            dataKey="time"
            tick={{
              fill: '#8d949b',
              fontSize: 10,
              fontFamily: 'Space Mono'
            }}
          />

          <YAxis
            domain={[-100,-20]}
            tick={{
              fill:'#8d949b',
              fontSize:10,
              fontFamily:'Space Mono'
            }}
          />


          <Tooltip
            contentStyle={{
              background:'#111',
              border:'1px solid #333',
              borderRadius:'4px',
              fontFamily:'DM Sans'
            }}
            labelStyle={{
              color:'#c4c9cf'
            }}
            itemStyle={{
              color:'#1793d1'
            }}
          />


          <ReferenceLine
            y={-70}
            stroke="#6e7681"
            strokeDasharray="4 4"
            label={{
              value:'Weak',
              fill:'#8d949b',
              fontSize:10
            }}
          />


          <Line
            type="monotone"
            dataKey="rssi"
            stroke="#1793d1"
            strokeWidth={2}
            dot={false}
            activeDot={{
              r:4,
              fill:'#1793d1'
            }}
          />

        </LineChart>
      </ResponsiveContainer>

    </div>
  );
}