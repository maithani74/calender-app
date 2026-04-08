import { useState, useEffect, useRef } from "react";

/* ═══════════════════════ CONSTANTS ═══════════════════════ */

const THEMES = [
  { name:"January",   emoji:"❄️",  bg:["#0f2027","#203a43","#2c5364"], accent:"#64b5f6" },
  { name:"February",  emoji:"💝",  bg:["#4a0030","#6d1b4b","#9c2770"], accent:"#f48fb1" },
  { name:"March",     emoji:"🌿",  bg:["#1b2d1b","#2e4a2e","#3d6b3d"], accent:"#81c784" },
  { name:"April",     emoji:"🌷",  bg:["#3e1f47","#5c3566","#7b4f8e"], accent:"#ce93d8" },
  { name:"May",       emoji:"🌻",  bg:["#1a2f1a","#2b4a2b","#3d6b2e"], accent:"#aed581" },
  { name:"June",      emoji:"☀️",  bg:["#1a1500","#3d3200","#6b5500"], accent:"#fff176" },
  { name:"July",      emoji:"🏖️", bg:["#0d2137","#1a3a5c","#2563a8"], accent:"#4dd0e1" },
  { name:"August",    emoji:"🌊",  bg:["#2e1a00","#5c3800","#8b5e00"], accent:"#ffb74d" },
  { name:"September", emoji:"🍂",  bg:["#2d1200","#5a2800","#8b4500"], accent:"#ff8a65" },
  { name:"October",   emoji:"🎃",  bg:["#1a0a00","#3d1f00","#6b3800"], accent:"#ffa726" },
  { name:"November",  emoji:"🍁",  bg:["#0a1628","#1a2a4a","#2d3f6b"], accent:"#90caf9" },
  { name:"December",  emoji:"⛄",  bg:["#062a3f","#0d4a6b","#1565a0"], accent:"#80deea" },
];

const DAY_SHORT = ["S","M","T","W","T","F","S"];
const DAY_LONG  = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const MON_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const HOLIDAYS = {
  "0-1":"New Year's Day","0-26":"Republic Day",
  "1-14":"Valentine's Day",
  "2-8":"Women's Day","2-17":"St. Patrick's",
  "3-14":"Ambedkar Jayanti",
  "4-1":"Labour Day",
  "5-21":"Summer Solstice",
  "7-15":"Independence Day",
  "9-2":"Gandhi Jayanti","9-31":"Halloween",
  "10-11":"Veterans Day",
  "11-24":"Christmas Eve","11-25":"Christmas","11-31":"New Year's Eve",
};

/* ═══════════════════════ HELPERS ═══════════════════════ */

const getDIM  = (y,m) => new Date(y,m+1,0).getDate();
const getFDIM = (y,m) => new Date(y,m,1).getDay();
const sameDay = (a,b) => a&&b&&a.toDateString()===b.toDateString();
const inRange = (d,s,e) => {
  if(!s||!e) return false;
  const t=d.getTime(), mn=Math.min(s.getTime(),e.getTime()), mx=Math.max(s.getTime(),e.getTime());
  return t>mn&&t<mx;
};
const fmt = (d,opts={month:"short",day:"numeric"}) => d?.toLocaleDateString("en-US",opts)??"";
const nKey = (y,m,d) => `${y}-${m}-${d}`;

/* ═══════════════════════ MAIN COMPONENT ═══════════════════════ */

export default function WallCalendar() {
  const today = new Date();
  const [vy,  setVy]  = useState(today.getFullYear());
  const [vm,  setVm]  = useState(today.getMonth());
  const [anim, setAnim] = useState("");
  const [animating, setAnimating] = useState(false);

  const [startD,  setStartD]  = useState(null);
  const [endD,    setEndD]    = useState(null);
  const [picking, setPicking] = useState(false);
  const [hoverD,  setHoverD]  = useState(null);

  const [notes,    setNotes]    = useState({});
  const [noteText, setNoteText] = useState("");
  const [mobile,   setMobile]   = useState(false);
  const [showNotes,setShowNotes]= useState(false);

  const inputRef = useRef(null);
  const T = THEMES[vm];
  const grad = `linear-gradient(155deg,${T.bg[0]} 0%,${T.bg[1]} 55%,${T.bg[2]} 100%)`;

  useEffect(()=>{
    const fn=()=>setMobile(window.innerWidth<700);
    fn(); window.addEventListener("resize",fn);
    return ()=>window.removeEventListener("resize",fn);
  },[]);

  function goMonth(dir){
    if(animating) return;
    setAnim(dir>0?"R":"L"); setAnimating(true);
    setTimeout(()=>{
      setVm(m=>{ const n=m+dir; if(n<0){setVy(y=>y-1);return 11;} if(n>11){setVy(y=>y+1);return 0;} return n; });
      setAnim(""); setAnimating(false);
    },270);
  }

  function clickDay(day){
    const d=new Date(vy,vm,day);
    if(!picking||(startD&&endD)){
      setStartD(d); setEndD(null); setPicking(true); setHoverD(null);
    } else {
      const [s,e]=d<startD?[d,startD]:[startD,d];
      setStartD(s); setEndD(e); setPicking(false); setHoverD(null);
      if(mobile) setShowNotes(true);
    }
  }

  function dayState(day){
    const d=new Date(vy,vm,day);
    if(sameDay(d,startD)) return "start";
    if(sameDay(d,endD))   return "end";
    const eff=picking?hoverD:endD;
    if(inRange(d,startD,eff)) return "range";
    if(sameDay(d,today))      return "today";
    return "normal";
  }

  function addNote(){
    const txt=noteText.trim(); if(!txt) return;
    const k=startD?nKey(startD.getFullYear(),startD.getMonth(),startD.getDate()):nKey(vy,vm,"month");
    setNotes(p=>({...p,[k]:[...(p[k]??[]),{id:Date.now(),txt}]}));
    setNoteText(""); inputRef.current?.focus();
  }

  function delNote(k,id){
    setNotes(p=>({...p,[k]:(p[k]??[]).filter(n=>n.id!==id)}));
  }

  function clearRange(){ setStartD(null); setEndD(null); setPicking(false); setHoverD(null); }

  const activeKey   = startD?nKey(startD.getFullYear(),startD.getMonth(),startD.getDate()):nKey(vy,vm,"month");
  const activeNotes = notes[activeKey]??[];
  const totalNotes  = Object.values(notes).reduce((a,v)=>a+v.length,0);
  const selCount    = startD&&endD?Math.round(Math.abs(endD-startD)/86400e3)+1:startD?1:0;

  const daysInMonth = getDIM(vy,vm);
  const firstDay    = getFDIM(vy,vm);
  const cells = [...Array(firstDay).fill(null), ...Array.from({length:daysInMonth},(_,i)=>i+1)];

  function fmtRange(){
    if(!startD) return "No date selected";
    if(!endD)   return `${fmt(startD)} → pick end date`;
    return `${fmt(startD)} – ${fmt(endD)}`;
  }

  /* ──── SUB-RENDERS ──── */

  const Rings = ({count=4,gap=52}) => (
    <div style={{display:"flex",gap,justifyContent:"center",padding:"0 40px"}}>
      {Array.from({length:count}).map((_,i)=>(
        <div key={i} style={{width:20,height:28,borderRadius:"50% 50% 38% 38%",
          background:"linear-gradient(to bottom,#d4c4a8,#b8a88a)",
          border:"2px solid #a09070",
          boxShadow:"0 2px 6px rgba(0,0,0,0.22),inset 0 -2px 4px rgba(0,0,0,0.15)"}} />
      ))}
    </div>
  );

  const MonthStrip = () => (
    <div style={{display:"flex",gap:2,padding:"0.45rem 1rem",overflowX:"auto",
      borderBottom:"1px solid #e8dece",scrollbarWidth:"none"}}>
      {MON_SHORT.map((m,i)=>(
        <button key={i} onClick={()=>{setAnim(i>vm?"R":"L");setVm(i);}}
          style={{fontFamily:"'DM Mono',monospace",fontSize:"0.6rem",letterSpacing:"0.06em",
            textTransform:"uppercase",padding:"3px 9px",borderRadius:20,cursor:"pointer",
            border:"1px solid transparent",whiteSpace:"nowrap",transition:"all 0.2s",
            background:i===vm?"#3d2e1e":"transparent",
            color:i===vm?"#fdf8f0":"#a89880"}}>{m}</button>
      ))}
    </div>
  );

  const Legend = () => (
    <div style={{display:"flex",gap:"0.9rem",flexWrap:"wrap",
      padding:"0.4rem 1.25rem",borderTop:"1px solid #e8dece",alignItems:"center"}}>
      {[
        {type:"box",color:T.accent,label:"Start/End"},
        {type:"box",color:`${T.accent}28`,label:"Range",border:true},
        {type:"box",color:"rgba(160,140,110,0.18)",label:"Today",border:true},
        {type:"dot",color:"#e07a5f",label:"Has note"},
        {type:"dot",color:T.accent,label:"Holiday"},
      ].map(({type,color,label,border})=>(
        <div key={label} style={{display:"flex",alignItems:"center",gap:5}}>
          {type==="dot"
            ?<div style={{width:5,height:5,borderRadius:"50%",background:color}} />
            :<div style={{width:13,height:13,borderRadius:3,background:color,
                border:border?`1px solid ${T.accent}55`:"none"}} />}
          <span style={{fontFamily:"'DM Mono',monospace",fontSize:"0.58rem",color:"#a89880",letterSpacing:"0.04em"}}>{label}</span>
        </div>
      ))}
    </div>
  );

  const CalGrid = () => (
    <div style={{padding:mobile?"0.75rem 0.6rem 0.5rem":"1.1rem 1.25rem 0.6rem",flex:1}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2,marginBottom:"0.3rem"}}>
        {(mobile?DAY_SHORT:DAY_LONG).map((d,i)=>(
          <div key={i} style={{textAlign:"center",fontFamily:"'DM Mono',monospace",
            fontSize:mobile?"0.58rem":"0.63rem",color:"#a89880",
            letterSpacing:"0.06em",textTransform:"uppercase",padding:"2px 0"}}>{d}</div>
        ))}
      </div>
      <div key={`${vy}-${vm}`} style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2,
        animation:anim?`calSlide${anim} 0.27s ease both`:"none"}}>
        {cells.map((day,i)=>day===null?<div key={`e${i}`}/>:(()=>{
          const st=dayState(day);
          const isEdge=st==="start"||st==="end";
          const isRange=st==="range";
          const isToday=st==="today";
          const hol=HOLIDAYS[`${vm}-${day}`];
          const hasNote=(notes[nKey(vy,vm,day)]??[]).length>0;
          return (
            <div key={day}
              onClick={()=>clickDay(day)}
              onMouseEnter={()=>picking&&setHoverD(new Date(vy,vm,day))}
              onMouseLeave={()=>picking&&setHoverD(null)}
              title={hol||""}
              style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
                cursor:"pointer",borderRadius:isRange?0:5,
                minHeight:mobile?32:40,padding:"3px 1px",position:"relative",
                transition:"background 0.12s,transform 0.1s",userSelect:"none",
                background:isEdge?T.accent:isRange?`${T.accent}24`:isToday?"rgba(160,140,110,0.16)":"transparent",
                border:isToday&&!isEdge?`1px solid rgba(160,140,110,0.35)`:"1px solid transparent",
              }}
              onMouseOver={e=>{if(!isEdge)e.currentTarget.style.transform="scale(1.06)"}}
              onMouseOut={e=>{e.currentTarget.style.transform="scale(1)"}}
            >
              <span style={{fontFamily:"'DM Mono',monospace",
                fontSize:mobile?"0.68rem":"0.78rem",
                fontWeight:isEdge||isToday?600:400,
                color:isEdge?"white":"#3d3020",lineHeight:1}}>{day}</span>
              {hol&&<div style={{width:4,height:4,borderRadius:"50%",
                background:isEdge?"rgba(255,255,255,0.7)":T.accent,marginTop:2}} />}
              {hasNote&&!hol&&<div style={{width:4,height:4,borderRadius:"50%",
                background:isEdge?"rgba(255,255,255,0.7)":"#e07a5f",marginTop:2}} />}
              {isEdge&&<div style={{position:"absolute",bottom:1,fontSize:"0.38rem",
                fontFamily:"'DM Mono',monospace",color:"rgba(255,255,255,0.65)",letterSpacing:"0.04em",
                textTransform:"uppercase"}}>{st}</div>}
            </div>
          );
        })())}
      </div>
    </div>
  );

  const NotesPanel = () => (
    <div style={{display:"flex",flexDirection:"column",gap:"0.6rem",
      padding:"0.85rem 1.25rem 1.1rem"}}>
      {/* Header row */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:6}}>
        <div style={{display:"flex",alignItems:"center",gap:7}}>
          <span style={{fontFamily:"'Playfair Display',serif",fontSize:"0.88rem",
            fontWeight:600,color:"#5c4a32"}}>✏️ Notes</span>
          {activeNotes.length>0&&<span style={{background:T.accent,color:"#1a1008",
            fontSize:"0.58rem",fontFamily:"'DM Mono',monospace",borderRadius:10,padding:"1px 6px"}}>{activeNotes.length}</span>}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          {startD&&<button onClick={clearRange} style={{background:"none",border:"none",
            cursor:"pointer",fontFamily:"'DM Mono',monospace",fontSize:"0.6rem",
            color:"#a89880",textDecoration:"underline",padding:0}}>clear range</button>}
          <span style={{fontFamily:"'DM Mono',monospace",fontSize:"0.62rem",
            color:"#a89880",letterSpacing:"0.03em"}}>{fmtRange()}</span>
        </div>
      </div>

      {/* Hint when picking */}
      {picking&&(
        <div style={{fontFamily:"'DM Mono',monospace",fontSize:"0.63rem",
          color:"#b8956a",background:`${T.accent}16`,
          padding:"5px 10px",borderRadius:4,
          border:`1px solid ${T.accent}40`}}>
          👆 Now click an end date to complete your range
        </div>
      )}

      {/* Input */}
      <div style={{display:"flex",gap:7}}>
        <input ref={inputRef} value={noteText}
          onChange={e=>setNoteText(e.target.value)}
          onKeyDown={e=>e.key==="Enter"&&addNote()}
          placeholder={startD?`Note for ${fmt(startD)}…`:"Select a date first, then add a note…"}
          style={{flex:1,background:"#f9f5ee",border:"1px solid #e0d4c0",
            borderRadius:5,padding:"7px 11px",
            fontFamily:"'DM Mono',monospace",fontSize:"0.73rem",
            color:"#4a3820",outline:"none"}}
          onFocus={e=>e.target.style.borderColor=T.accent}
          onBlur={e=>e.target.style.borderColor="#e0d4c0"}
        />
        <button onClick={addNote}
          style={{background:T.accent,color:"#12090a",border:"none",borderRadius:5,
            padding:"7px 14px",cursor:"pointer",fontFamily:"'DM Mono',monospace",
            fontSize:"0.7rem",fontWeight:600,letterSpacing:"0.04em",
            whiteSpace:"nowrap",transition:"opacity 0.15s"}}
          onMouseEnter={e=>e.target.style.opacity=0.82}
          onMouseLeave={e=>e.target.style.opacity=1}
        >+ Add</button>
      </div>

      {/* Notes list */}
      <div style={{display:"flex",flexDirection:"column",gap:5,
        maxHeight:mobile?160:110,overflowY:"auto"}}>
        {activeNotes.length===0
          ?<div style={{fontFamily:"'DM Mono',monospace",fontSize:"0.65rem",
              color:"#c8b89a",textAlign:"center",padding:"6px 0",fontStyle:"italic"}}>
              {startD?"No notes for this date":"Select a date to attach notes"}
            </div>
          :activeNotes.map(n=>(
            <div key={n.id} style={{display:"flex",alignItems:"flex-start",gap:8,
              background:"#f9f5ee",borderRadius:5,
              borderLeft:`3px solid ${T.accent}`,padding:"6px 10px"}}>
              <span style={{flex:1,fontFamily:"'DM Mono',monospace",fontSize:"0.71rem",
                color:"#4a3820",lineHeight:1.45,wordBreak:"break-word"}}>{n.txt}</span>
              <button onClick={()=>delNote(activeKey,n.id)}
                style={{background:"none",border:"none",cursor:"pointer",
                  color:"#c8b89a",fontSize:"0.9rem",padding:0,lineHeight:1,
                  transition:"color 0.15s",flexShrink:0}}
                onMouseEnter={e=>e.target.style.color="#e07a5f"}
                onMouseLeave={e=>e.target.style.color="#c8b89a"}>×</button>
            </div>
          ))}
      </div>
      {totalNotes>0&&(
        <div style={{fontFamily:"'DM Mono',monospace",fontSize:"0.58rem",
          color:"#b8a888",textAlign:"right",borderTop:"1px solid #e8dece",paddingTop:"0.4rem"}}>
          {totalNotes} note{totalNotes!==1?"s":""} saved this calendar
        </div>
      )}
    </div>
  );

  /* ──── MOBILE LAYOUT ──── */
  if(mobile) return (
    <div style={{background:"#f0ebe0",minHeight:"100vh",fontFamily:"'Playfair Display',serif"}}>
      <style>{CSS}</style>
      {/* Top ring bar */}
      <div style={{height:14,background:"#e0d8c8",display:"flex",alignItems:"center",
        justifyContent:"space-around",padding:"0 36px",borderBottom:"1px solid #cec4b0"}}>
        {[0,1,2,3].map(i=><div key={i} style={{width:11,height:11,borderRadius:"50%",
          background:"#c8b89a",border:"1.5px solid #b8a88a"}} />)}
      </div>

      {/* Compact hero */}
      <div style={{background:grad,padding:"1.1rem 1rem",display:"flex",
        alignItems:"center",justifyContent:"space-between",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,opacity:0.04,
          backgroundImage:"radial-gradient(circle at 1px 1px,white 1px,transparent 0)",
          backgroundSize:"22px 22px",pointerEvents:"none"}} />
        <button onClick={()=>goMonth(-1)} style={{width:36,height:36,borderRadius:"50%",
          background:"rgba(255,255,255,0.12)",border:"1px solid rgba(255,255,255,0.2)",
          color:"white",cursor:"pointer",fontSize:"0.75rem",zIndex:1}}>◀</button>
        <div style={{textAlign:"center",zIndex:1}}>
          <div style={{fontSize:"2.6rem",lineHeight:1,marginBottom:4,
            animation:"heroFloat 4s ease-in-out infinite"}}>{T.emoji}</div>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:"1.7rem",
            fontWeight:700,color:"white",lineHeight:1}}>{T.name}</div>
          <div style={{fontFamily:"'DM Mono',monospace",fontSize:"0.65rem",
            color:"rgba(255,255,255,0.45)",letterSpacing:"0.22em",marginTop:3}}>{vy}</div>
        </div>
        <button onClick={()=>goMonth(1)} style={{width:36,height:36,borderRadius:"50%",
          background:"rgba(255,255,255,0.12)",border:"1px solid rgba(255,255,255,0.2)",
          color:"white",cursor:"pointer",fontSize:"0.75rem",zIndex:1}}>▶</button>
      </div>

      {/* Stats bar */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",background:"#3d2e1e"}}>
        {[{l:"Days",v:daysInMonth},{l:"Selected",v:selCount},{l:"Notes",v:totalNotes}].map(s=>(
          <div key={s.l} style={{textAlign:"center",padding:"8px 0",
            borderRight:"1px solid rgba(255,255,255,0.07)"}}>
            <div style={{fontFamily:"'DM Mono',monospace",fontSize:"0.5rem",
              color:"rgba(255,255,255,0.38)",letterSpacing:"0.1em",textTransform:"uppercase"}}>{s.l}</div>
            <div style={{fontFamily:"'DM Mono',monospace",fontSize:"1rem",color:T.accent}}>{s.v}</div>
          </div>
        ))}
      </div>

      {/* Month strip */}
      <div style={{background:"#fdfaf5"}}>
        <MonthStrip/>
        <CalGrid/>
        <Legend/>
      </div>

      {/* Notes toggle */}
      <div style={{padding:"0.6rem 0.75rem",background:"#fdfaf5"}}>
        <button onClick={()=>setShowNotes(v=>!v)} style={{width:"100%",
          background:"none",border:`1px solid ${T.accent}88`,borderRadius:6,
          padding:"8px 12px",cursor:"pointer",fontFamily:"'DM Mono',monospace",
          fontSize:"0.72rem",color:"#7a6040",display:"flex",alignItems:"center",
          justifyContent:"center",gap:6}}>
          ✏️ {showNotes?"Hide":"Show"} Notes
          {activeNotes.length>0&&<span style={{background:T.accent,color:"#12090a",
            borderRadius:10,padding:"1px 6px",fontSize:"0.58rem"}}>{activeNotes.length}</span>}
        </button>
      </div>
      {showNotes&&<div style={{background:"#fdfaf5",borderTop:"1px solid #e8dece"}}><NotesPanel/></div>}
    </div>
  );

  /* ──── DESKTOP LAYOUT ──── */
  return (
    <div style={{background:"#ede8dc",minHeight:"100vh",display:"flex",
      alignItems:"center",justifyContent:"center",padding:"2.5rem 1.5rem",
      fontFamily:"'Playfair Display',serif"}}>
      <style>{CSS}</style>

      <div style={{width:"100%",maxWidth:980,position:"relative"}}>
        {/* Rings */}
        <div style={{position:"absolute",top:-13,left:0,right:0,
          display:"flex",justifyContent:"center",gap:56,zIndex:30,pointerEvents:"none"}}>
          {[0,1,2,3].map(i=>(
            <div key={i} style={{width:22,height:30,borderRadius:"50% 50% 38% 38%",
              background:"linear-gradient(to bottom,#d4c4a8,#b8a88a)",
              border:"2px solid #a09070",
              boxShadow:"0 2px 6px rgba(0,0,0,0.2),inset 0 -2px 4px rgba(0,0,0,0.15)"}} />
          ))}
        </div>

        {/* Card */}
        <div style={{background:"#fdfaf5",borderRadius:5,overflow:"hidden",
          boxShadow:"0 14px 55px rgba(0,0,0,0.22),0 3px 12px rgba(0,0,0,0.10),0 0 0 1px rgba(0,0,0,0.06)",
          display:"grid",gridTemplateColumns:"285px 1fr"}}>

          {/* ── HERO PANEL ── */}
          <div style={{background:grad,display:"flex",flexDirection:"column",
            alignItems:"center",justifyContent:"space-between",
            padding:"2.25rem 1.5rem 1.5rem",position:"relative",overflow:"hidden",
            minHeight:570}}>
            {/* dot pattern */}
            <div style={{position:"absolute",inset:0,opacity:0.04,
              backgroundImage:"radial-gradient(circle at 1px 1px,white 1px,transparent 0)",
              backgroundSize:"26px 26px",pointerEvents:"none"}} />
            {/* watermark */}
            <div style={{position:"absolute",bottom:-8,left:-8,fontSize:"7rem",
              fontWeight:800,color:"rgba(255,255,255,0.04)",
              fontFamily:"'Playfair Display',serif",lineHeight:1,
              userSelect:"none",pointerEvents:"none",whiteSpace:"nowrap"}}>{T.name}</div>

            {/* Year + dots */}
            <div style={{width:"100%",textAlign:"center"}}>
              <div style={{fontFamily:"'DM Mono',monospace",fontSize:"0.68rem",
                letterSpacing:"0.28em",color:"rgba(255,255,255,0.38)",marginBottom:"0.8rem"}}>{vy}</div>
              <div style={{display:"flex",justifyContent:"center",gap:5,flexWrap:"wrap",maxWidth:160,margin:"0 auto"}}>
                {THEMES.map((_,i)=>(
                  <div key={i} onClick={()=>{setAnim(i>vm?"R":"L");setVm(i);}}
                    style={{width:i===vm?18:7,height:7,borderRadius:4,cursor:"pointer",
                      background:i===vm?T.accent:"rgba(255,255,255,0.22)",transition:"all 0.3s"}} />
                ))}
              </div>
            </div>

            {/* Emoji */}
            <div style={{fontSize:"5rem",lineHeight:1,
              filter:"drop-shadow(0 6px 20px rgba(0,0,0,0.4))",
              animation:"heroFloat 4s ease-in-out infinite",margin:"0.75rem 0"}}>
              {T.emoji}
            </div>

            {/* Month name */}
            <div style={{textAlign:"center",marginBottom:"1.1rem"}}>
              <div style={{fontFamily:"'Playfair Display',serif",
                fontSize:"clamp(1.9rem,3vw,2.7rem)",fontWeight:700,
                color:"white",letterSpacing:"-0.02em",lineHeight:1,
                textShadow:"0 2px 18px rgba(0,0,0,0.4)",
                animation:anim?`calSlide${anim} 0.28s ease both`:"none"}}>
                {T.name}
              </div>
            </div>

            {/* Nav */}
            <div style={{display:"flex",alignItems:"center",gap:"0.8rem",
              marginBottom:"1rem",width:"100%",justifyContent:"center"}}>
              {[{dir:-1,lbl:"◀"},{dir:1,lbl:"▶"}].map(({dir,lbl})=>(
                <button key={dir} onClick={()=>goMonth(dir)}
                  style={{width:34,height:34,borderRadius:"50%",
                    background:"rgba(255,255,255,0.12)",
                    border:"1px solid rgba(255,255,255,0.22)",
                    color:"white",cursor:"pointer",fontSize:"0.7rem",
                    transition:"background 0.2s,transform 0.15s"}}
                  onMouseEnter={e=>{e.target.style.background="rgba(255,255,255,0.22)";e.target.style.transform="scale(1.1)"}}
                  onMouseLeave={e=>{e.target.style.background="rgba(255,255,255,0.12)";e.target.style.transform="scale(1)"}}
                >{lbl}</button>
              ))}
            </div>

            {/* Stats */}
            <div style={{width:"100%",background:"rgba(0,0,0,0.28)",borderRadius:8,
              padding:"10px 0",display:"grid",gridTemplateColumns:"1fr 1px 1fr 1px 1fr",
              backdropFilter:"blur(10px)",border:"1px solid rgba(255,255,255,0.1)"}}>
              {[
                {l:"Days",v:daysInMonth},null,
                {l:"Selected",v:selCount},null,
                {l:"Notes",v:totalNotes}
              ].map((s,i)=>s===null
                ?<div key={i} style={{background:"rgba(255,255,255,0.12)"}} />
                :<div key={i} style={{textAlign:"center",padding:"0 8px"}}>
                  <div style={{fontFamily:"'DM Mono',monospace",fontSize:"0.53rem",
                    color:"rgba(255,255,255,0.4)",letterSpacing:"0.12em",
                    textTransform:"uppercase",marginBottom:2}}>{s.l}</div>
                  <div style={{fontFamily:"'DM Mono',monospace",fontSize:"1.15rem",
                    color:T.accent,fontWeight:400}}>{s.v}</div>
                </div>
              )}
            </div>
          </div>

          {/* ── RIGHT PANEL ── */}
          <div style={{display:"flex",flexDirection:"column"}}>
            {/* Paper top */}
            <div style={{height:16,background:"#ede6d6",borderBottom:"1px solid #ddd4be",
              display:"flex",alignItems:"center",justifyContent:"space-around",padding:"0 48px"}}>
              {[0,1,2].map(i=><div key={i} style={{width:11,height:11,borderRadius:"50%",
                background:"#c8b89a",border:"1.5px solid #b8a48a",
                boxShadow:"inset 0 1px 3px rgba(0,0,0,0.18)"}} />)}
            </div>

            <MonthStrip/>
            <CalGrid/>
            <Legend/>
            <div style={{height:1,background:"linear-gradient(to right,transparent,#e0d4c0,transparent)",margin:"0 1.25rem"}} />
            <NotesPanel/>
          </div>
        </div>

        {/* Page curl shadow */}
        <div style={{position:"absolute",bottom:-5,left:10,right:10,height:10,
          background:"rgba(0,0,0,0.1)",borderRadius:"0 0 6px 6px",filter:"blur(4px)",zIndex:-1}} />
      </div>
    </div>
  );
}

/* ═══════════════════════ GLOBAL CSS ═══════════════════════ */

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;800&family=DM+Mono:wght@300;400;500&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
@keyframes heroFloat{0%,100%{transform:translateY(0) rotate(-2deg)}50%{transform:translateY(-10px) rotate(2deg)}}
@keyframes calSlideR{from{opacity:0;transform:translateX(14px)}to{opacity:1;transform:translateX(0)}}
@keyframes calSlideL{from{opacity:0;transform:translateX(-14px)}to{opacity:1;transform:translateX(0)}}
::-webkit-scrollbar{width:4px;height:4px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:#c8b89a;border-radius:2px}
input::placeholder{color:#c8b09a}
button{outline:none}
div::-webkit-scrollbar{width:3px}
`;