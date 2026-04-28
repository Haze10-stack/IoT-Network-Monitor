import { useState, useEffect, useCallback, useRef } from 'react';
import { getDevices, getAlerts, getDevice } from '../api/client';
import DeviceTable from '../components/DeviceTable';
import AlertList from '../components/AlertList';
import RSSIChart from '../components/RSSIChart';

const POLL_MS = 5000;

const BOOT_LINES = [
  { text: 'SeaBIOS (version 1.16.3-arch)', delay: 0, color: '#3a3020' },
  { text: '', delay: 200 },
  { text: ':: loading early microcode...', delay: 400, ok: true },
  { text: ':: initializing kernel ring buffer...', delay: 600, ok: true },
  { text: ':: mounting virtual filesystems...', delay: 800, ok: true },
  { text: ':: starting udev event manager...', delay: 1000, ok: true },
  { text: ':: bringing up network interfaces...', delay: 1400, ok: true },
  { text: ':: loading netmonitor kernel module...', delay: 1800, ok: true },
  { text: ':: scanning 2.4GHz / 5GHz bands...', delay: 2200, ok: true },
  { text: ':: netmonitor daemon registered on :7331', delay: 2600, ok: true },
  { text: '', delay: 2800 },
  { text: 'Arch Linux 6.9.3-arch1-1 (tty1)', delay: 3000, color: '#e8a320' },
  { text: '', delay: 3100 },
  { text: 'netwatch login: root', delay: 3300, color: '#7ab0c0' },
  { text: 'Last login: Thu Apr 24 03:12:44 on tty1', delay: 3600, color: '#3a3020' },
  { text: '', delay: 3800 },
];

const FUN_ERRORS = {
  'nmap': "nmap: wrong tool — this isn't your laptop",
  'wireshark':"wireshark: no GUI here. you're already deeper than wireshark goes",
  'sudo': "root is already the current user, nice try though",
  'vim': "vim: no escape. just kidding. try netmonitor activate",
  'neofetch': "neofetch: not installed. btw you're already on arch, we know",
  'pwd': "/home/root/netwatch",
  'whoami': "root",
  'uname': "Linux netwatch 6.9.3-arch1-1 x86_64 GNU/Linux",
  'htop': "htop: 1 process found — netmonitor (sleeping). wake it: netmonitor activate",
  'ls': "drwxr-xr-x netmonitor/ passwd shadow (hint: try netmonitor activate)",
  'cat /etc/passwd': "root:x:0:0:root:/root:/bin/bash — yeah that's you",
  'exit': "there is no exit. only the network.",
  'reboot': "reboot: permission denied. the network never sleeps.",
  'ping': "ping: missing host operand. try: ping <target>",
};

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;600;700&display=swap');

*{box-sizing:border-box;margin:0;padding:0;}

::-webkit-scrollbar{width:6px;}
::-webkit-scrollbar-track{background:#0f0f0f;}
::-webkit-scrollbar-thumb{background:#1a1400;}

@keyframes blink{0%,49%{opacity:1}50%,100%{opacity:0}}
@keyframes fadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
@keyframes flicker{0%,100%{opacity:1}93%{opacity:1}94%{opacity:.88}96%{opacity:1}}
@keyframes dashIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}

.boot-line{animation:fadeIn .18s ease both;}
.terminal{animation:flicker 9s infinite;}
.dash-enter{animation:dashIn .35s ease both;}

.term-input{
background:transparent;
border:none;
outline:none;
color:#e8a320;
font-family:'IBM Plex Mono',monospace;
font-size:13px;
caret-color:transparent;
width:100%;
position:absolute;
left:0;
top:0;
opacity:0;
}

.dev-row:hover{
background:#0a0800 !important;
cursor:pointer;
}
`;

function BootLine({ line }) {
  if (line.ok) {
    return (
      <div
        className="boot-line"
        style={{
          display:'flex',
          justifyContent:'space-between',
          color:'#3a3020',
          fontSize:'13px',
          lineHeight:'1.7'
        }}
      >
        <span>{line.text}</span>
        <span style={{ color:'#e8a320', marginLeft:'24px' }}>[ OK ]</span>
      </div>
    );
  }

  return (
    <div
      className="boot-line"
      style={{
        color: line.color || '#3a3020',
        fontSize:'13px',
        lineHeight:'1.7'
      }}
    >
      {line.text || '\u00a0'}
    </div>
  );
}

function Prompt({ children }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:'8px', fontSize:'13px', lineHeight:'1.7' }}>
      <span style={{ color:'#e8a320' }}>root</span>
      <span style={{ color:'#3a3020' }}>@</span>
      <span style={{ color:'#7ab0c0' }}>netwatch</span>
      <span style={{ color:'#3a3020' }}>~</span>
      <span style={{ color:'#4a3a15' }}>$</span>
      <span style={{ color:'#e8a320' }}>{children}</span>
    </div>
  );
}

function asciiTable(devices){
  if(!devices.length) return [' no devices found.'];

  const cols=['IDX','MAC','VENDOR','RSSI','LAST SEEN','STATUS'];

  const rows=devices.map((d,i)=>{
    const age=Math.floor((Date.now()-new Date(d.lastSeen).getTime())/1000);
    const status=age<60?'ACTIVE':'IDLE';

    return[
      String(i+1).padStart(2,'0'),
      d.mac,
      (d.vendor||'Unknown').slice(0,16),
      `${d.rssi??'--'} dBm`,
      `${age}s ago`,
      status
    ];
  });

  const widths=cols.map((c,i)=>
    Math.max(c.length,...rows.map(r=>(r[i]||'').length))+2
  );

  const sep=' ┼'+widths.map(w=>'─'.repeat(w)).join('┼')+'┼';
  const header=' │'+cols.map((c,i)=>` ${c.padEnd(widths[i]-1)}`).join('│')+'│';
  const top=' ┌'+widths.map(w=>'─'.repeat(w)).join('┬')+'┐';
  const bot=' └'+widths.map(w=>'─'.repeat(w)).join('┴')+'┘';

  const dataRows=rows.map(r=>
    ' │'+r.map((c,i)=>` ${c.padEnd(widths[i]-1)}`).join('│')+'│'
  );

  return [top,header,sep,...dataRows,bot];
}

function asciiAlerts(alerts){
  if(!alerts.length) return [' >> no active alerts. system nominal.'];

  return alerts.map((a,i)=>
    `[${String(i+1).padStart(2,'0')}] ${(a.severity?.toUpperCase()||'WARN').padEnd(6)} ${a.message||JSON.stringify(a)}`
  );
}

function asciiSparkline(device){
  if(!device?.rssiHistory?.length)
    return [' >> no signal history. select a device from table.'];

  const bars='▁▂▃▄▅▆▇█';
  const vals=device.rssiHistory.slice(-48);

  const min=Math.min(...vals);
  const max=Math.max(...vals);

  const range=max-min||1;

  const line=vals.map(v=>
    bars[Math.round(((v-min)/range)*7)]
  ).join('');

  return[
    ` RSSI :: ${device.mac} [${device.vendor||'Unknown'}]`,
    ` min ${min} dBm ${'─'.repeat(20)} max ${max} dBm`,
    ` ${line}`
  ];
}

const HELP_TEXT=[
' available commands:',
' ─────────────────────────',
' netmonitor activate',
' filter --active',
' filter --all',
' select --idx=<n>',
' select --mac=<addr>',
' resolve --alert=<n>',
' refresh',
' clear',
' status',
' help',
' ─────────────────────────'
];

function DashOutput({
devices,
alerts,
selectedDev,
selectedMac,
onSelect
}){

const activeCount=devices.filter(
d=>Date.now()-new Date(d.lastSeen).getTime()<60000
).length;

const tableLines=asciiTable(devices);

const dataStart=3;
const dataEnd=tableLines.length-1;

return(
<div className="dash-enter" style={{
fontSize:'13px',
lineHeight:1.75,
marginTop:'4px'
}}>

<div style={{
color:'#4a3a20',
marginBottom:'4px'
}}>
{` >> netmonitor activated — ${devices.length} device(s), ${activeCount} active, ${alerts.length} alert(s)`}
</div>

<div style={{
color:'#2a2010',
marginBottom:'14px'
}}>
{' '+'─'.repeat(60)}
</div>

<div style={{
color:'#7ab0c0',
marginBottom:'4px'
}}>
{' // DEVICE INVENTORY'}
</div>

{tableLines.map((line,i)=>{
const isData=i>=dataStart && i<dataEnd;
const rowIndex=i-dataStart;
const dev=devices[rowIndex];
const isActive=dev&&Date.now()-new Date(dev.lastSeen).getTime()<60000;
const isSel=dev&&dev.mac===selectedMac;

return(
<div
key={i}
className={isData?'dev-row':''}
onClick={isData&&dev?()=>onSelect(dev.mac):undefined}
style={{
color:isSel
?'#e8a320'
:isData&&isActive
?'#c8a870'
:'#4a3a15',
background:isSel?'#0d0900':'transparent'
}}
>
{line}
</div>
);
})}

<div style={{
color:'#2a2010',
margin:'14px 0 4px'
}}>
{' '+'─'.repeat(60)}
</div>

<div style={{color:'#7ab0c0'}}>
{' // ALERT LOG'}
</div>

{asciiAlerts(alerts).map((line,i)=>(
<div key={i}
style={{
color:alerts[i]?'#c0392b':'#4a3a20'
}}>
{line}
</div>
))}

<div style={{
color:'#2a2010',
margin:'14px 0 4px'
}}>
{' '+'─'.repeat(60)}
</div>

<div style={{color:'#7ab0c0'}}>
{' // SIGNAL STRENGTH'}
</div>

{asciiSparkline(selectedDev).map((line,i)=>(
<div key={i} style={{color:'#c8a870'}}>
{line}
</div>
))}

<div style={{
color:'#2a2010',
margin:'14px 0 4px'
}}>
{' '+'─'.repeat(60)}
</div>

<div style={{
color:'#3a3020',
fontSize:'12px'
}}>
{' [live] polling every 5s — type "help" for commands'}
</div>

</div>
);
}

export default function Dashboard(){

const [devices,setDevices]=useState([]);
const [alerts,setAlerts]=useState([]);
const [selectedMac,setSelectedMac]=useState(null);
const [selectedDev,setSelectedDev]=useState(null);
const [activeOnly,setActiveOnly]=useState(false);

const [bootDone,setBootDone]=useState(false);
const [bootLines,setBootLines]=useState([]);
const [activated,setActivated]=useState(false);

const [history,setHistory]=useState([]);
const [input,setInput]=useState('');
const [cmdHistory,setCmdHistory]=useState([]);
const [cmdIdx,setCmdIdx]=useState(-1);

const inputRef=useRef(null);
const bottomRef=useRef(null);

const fetchAll=useCallback(async()=>{
try{
const [devs,alts]=await Promise.all([
getDevices(activeOnly),
getAlerts()
]);

setDevices(devs);
setAlerts(alts);
}catch(e){
console.error(e);
}
},[activeOnly]);

useEffect(()=>{
if(activated){
fetchAll();
const id=setInterval(fetchAll,POLL_MS);
return()=>clearInterval(id);
}
},[activated,fetchAll]);

useEffect(()=>{
if(!selectedMac){
setSelectedDev(null);
return;
}
getDevice(selectedMac)
.then(setSelectedDev)
.catch(()=>setSelectedDev(null));
},[selectedMac,devices]);

useEffect(()=>{
BOOT_LINES.forEach((line,i)=>{
setTimeout(()=>{
setBootLines(prev=>[...prev,line]);

if(i===BOOT_LINES.length-1){
setTimeout(()=>setBootDone(true),300);
}
},line.delay);
});
},[]);

useEffect(()=>{
bottomRef.current?.scrollIntoView({
behavior:'smooth'
});
},[bootLines,history,input,activated]);

useEffect(()=>{
if(bootDone){
inputRef.current?.focus();
}
},[bootDone]);

const handleCommand=useCallback((raw)=>{

const cmd=raw.trim();
const lower=cmd.toLowerCase();

setCmdHistory(prev=>
cmd?[cmd,...prev.slice(0,49)]:prev
);

setCmdIdx(-1);

if(lower==='netmonitor activate'){
if(activated){
setHistory(prev=>[
...prev,
{
prompt:cmd,
lines:[' >> netmonitor already running']
}
]);
return;
}

setHistory(prev=>[
...prev,
{
prompt:cmd,
lines:[
' >> authenticating...',
' >> starting packet capture...',
' >> netmonitor online.'
]
}
]);

setTimeout(()=>setActivated(true),600);
return;
}

if(lower==='clear'){
setHistory([]);
setBootLines([]);
return;
}

if(lower==='help'){
setHistory(prev=>[
...prev,
{prompt:cmd,lines:HELP_TEXT}
]);
return;
}

if(cmd!==''){
setHistory(prev=>[
...prev,
{
prompt:cmd,
lines:[
` bash: ${cmd}: command not found`,
` type "help"`
]
}
]);
}

},[activated]);

const handleKey=(e)=>{
if(e.key==='Enter'){
handleCommand(input);
setInput('');
}
};

return(
<>
<style>{CSS}</style>

<div
className="terminal"
style={{
minHeight:'100vh',
background:'#0f0f0f',
color:'#e8a320',
fontFamily:"'IBM Plex Mono', monospace",
padding:'24px 28px'
}}
onClick={()=>inputRef.current?.focus()}
>

<div style={{
position:'fixed',
inset:0,
pointerEvents:'none',
zIndex:99,
background:'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,.07) 2px,rgba(0,0,0,.07) 4px)'
}}/>

{bootLines.map((line,i)=>(
<BootLine key={i} line={line}/>
))}

{history.map((entry,i)=>(
<div key={i}>
<Prompt>{entry.prompt}</Prompt>

{entry.lines?.map((line,j)=>(
<div
key={j}
style={{
color:'#5a4a20',
fontSize:'13px',
lineHeight:1.7
}}
>
{line}
</div>
))}
</div>
))}

{activated&&(
<DashOutput
devices={devices}
alerts={alerts}
selectedDev={selectedDev}
selectedMac={selectedMac}
onSelect={setSelectedMac}
/>
)}

{bootDone&&(
<div style={{
display:'flex',
alignItems:'center',
gap:'8px',
fontSize:'13px',
lineHeight:'1.7',
marginTop:'6px'
}}>

<span style={{color:'#e8a320'}}>root</span>
<span style={{color:'#3a3020'}}>@</span>
<span style={{color:'#7ab0c0'}}>netwatch</span>
<span style={{color:'#3a3020'}}>~</span>
<span style={{color:'#4a3a15'}}>$</span>

<span style={{
position:'relative',
flex:1
}}>
<span style={{color:'#e8a320'}}>
{input}
</span>

<span style={{
animation:'blink 1s infinite',
color:'#e8a320'
}}>
█
</span>

<input
ref={inputRef}
className="term-input"
value={input}
onChange={e=>setInput(e.target.value)}
onKeyDown={handleKey}
autoFocus
spellCheck={false}
autoComplete="off"
/>

</span>

</div>
)}

<div ref={bottomRef}/>

</div>
</>
);
}