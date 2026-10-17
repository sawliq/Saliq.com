// Pen Path Journey, mounted from the published artifact (https://claude.ai/artifact/2afsQ1Y7kiw8PSmwvAWL7z).
// Runs inside a shadow root so its ids and classes stay separate from the site.
export function mountPenPath(host, sroot) {
const CASE_URL=host.dataset.caseUrl||"/exzyt.html";

/* ---------- Content: replace placeholders with real stops ---------- */
const STOPS=[
 {id:"start",proj:"mono",ini:"01",name:"Where it started",meta:"2021 · Mangalore",
  head:"The first anchor point.",body:"Placeholder: the moment your path began. Degree, first job, or <strong>the first thing you designed</strong>.",
  gal:["Campus","First sketch","Team"],pin:[100,-80],side:"right",rot:-8},
 {id:"turn",proj:"mono",ini:"02",name:"The turn",meta:"20XX · City",
  head:"Where the curve changed direction.",body:"Placeholder: the switch into design. What pulled you in, and <strong>the one decision</strong> that bent the path.",
  gal:["Old work","Figma file"],pin:[-120,-40],side:"left",rot:7},
 {id:"exzyt",proj:"exzyt",ini:"EX",name:"Exzyt",meta:"20XX – 20XX · Dubai",
  head:"Placeholder: what Exzyt taught you.",body:"Your role, the problem and the lesson. Under 50 words, <strong>ending on the outcome</strong>.",
  stats:[["+00%","Metric label"],["00K","Metric label"]],pin:[120,-60],side:"right",rot:-6,link:"View case study"},
 {id:"wikit",proj:"wikit",ini:"WK",name:"WIKIT",meta:"20XX – 20XX · Dubai",
  head:"Placeholder: the WIKIT chapter.",body:"What you designed, who it was for, and <strong>what changed because of it</strong>.",
  stats:[["00","Metric label"],["0.0×","Metric label"]],pin:[120,10],side:"right",rot:9,link:"View case study"},
 {id:"viya",proj:"viya",ini:"VY",name:"Viya",meta:"20XX – now · Dubai",
  head:"Systems at partner scale.",body:"Placeholder: Viya Partner Portal. Settings modules, FRDs to Jira, and <strong>design that engineering can ship</strong>.",
  stats:[["00","Modules shipped"],["00%","Metric label"]],pin:[0,110],side:"right",rot:-10,link:"View case study"},
 {id:"now",proj:"mono",ini:"S",name:"Now",meta:"Always on · Dubai",
  head:"Design to code, end to end.",body:"Placeholder: Figma, MCP and Claude skills, turned into shipped code. <strong>Open to new roles.</strong>",
  gal:["Figma","Skill","Live site"],pin:[-120,-30],side:"left",rot:6,link:"Let's talk"}
];
const ANCH=[
 {x:1100,y:260,i:null,o:[950,140]},
 {x:560,y:330,i:[620,150],o:[500,510]},
 {x:860,y:600,i:[760,560],o:[1000,650]},
 {x:1040,y:900,i:[1120,760],o:[980,1005]},
 {x:740,y:1035,i:[860,1040],o:[620,1030]},
 {x:500,y:930,i:[540,990],o:null}
];
const N=STOPS.length, DWELL=0.5, BB={x:380,y:130,w:840,h:1010};

/* ---------- Refs ---------- */
const $=id=>sroot.getElementById(id), NS="http://www.w3.org/2000/svg";
const track=$("track"),stage=$("stage"),world=$("world"),ghost=$("ghost"),trail=$("trail"),cursor=$("cursor"),card=$("card"),hero=$("hero"),outro=$("outro");
const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
const L=ghost.getTotalLength(); trail.style.strokeDasharray=L+" "+L;

/* anchor lengths along path */
ANCH.forEach(a=>{let best=1e9;for(let s=0;s<=L;s+=2){const p=ghost.getPointAtLength(s),d=(p.x-a.x)**2+(p.y-a.y)**2;if(d<best){best=d;a.len=s;}}});
ANCH[0].len=0;ANCH[N-1].len=L;

/* ---------- Build anchors, stems, pins, dots ---------- */
/* background: faint artboards, like city blocks on the canvas */
(function(){const g=$("boards");let seed=7;const rnd=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};
  const mk=(tag,attrs)=>{const e=document.createElementNS(NS,tag);for(const k in attrs)e.setAttribute(k,attrs[k]);g.appendChild(e);return e;};
  for(let y=-160;y<1400;y+=150){for(let x=-200;x<1800;x+=170){if(rnd()<0.28)continue;
    const w=110+Math.round(rnd()*40),h=90+Math.round(rnd()*40),bx=x+Math.round(rnd()*20),by=y+Math.round(rnd()*16);
    mk("rect",{x:bx,y:by,width:w,height:h,rx:6,class:"board"});
    mk("rect",{x:bx+10,y:by+10,width:w*0.45,height:6,rx:3,class:"board-ui"});
    mk("rect",{x:bx+10,y:by+24,width:w*0.7,height:4,rx:2,class:"board-ui"});
    if(rnd()<0.6)mk("rect",{x:bx+10,y:by+38,width:w-20,height:h-50,rx:4,class:"board-ui"});}}})();

const gA=$("anchors"),pins=$("pins"),dots=$("dots");
const trailU=$("trailU");trailU.style.strokeDasharray=L+" "+L;
STOPS.forEach((s,i)=>{const a=ANCH[i];
  const r=document.createElementNS(NS,"rect");r.setAttribute("x",a.x-6);r.setAttribute("y",a.y-6);r.setAttribute("width",12);r.setAttribute("height",12);r.setAttribute("class","anchor");gA.appendChild(r);s.anc=r;
  const b=document.createElement("button");b.type="button";b.className="pin "+(s.side==="left"?"left":"");b.dataset.project=s.proj;b.style.left=a.x+"px";b.style.top=a.y+"px";
  b.setAttribute("aria-label","Go to "+s.name);b.innerHTML='<span class="tip"></span><span class="logo">'+s.ini+'</span><span class="tag">'+s.name+'</span>';b.onclick=()=>goTo(i);pins.appendChild(b);s.pinEl=b;
  const d=document.createElement("button");d.type="button";d.className="dotbtn";d.dataset.project=s.proj;d.setAttribute("aria-label",s.name);d.innerHTML="<i></i>";d.onclick=()=>goTo(i);dots.appendChild(d);s.dot=d;
});

/* ---------- Scroll geometry ---------- */
let vh=innerHeight,vw=innerWidth;
const navH=()=>parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--nav-h"))||0;
const trackTop=()=>track.getBoundingClientRect().top+scrollY-navH();
function sizeTrack(){vw=innerWidth;vh=stage.clientHeight||innerHeight-navH();track.style.height=((N+2.2)*vh)+"px";}
sizeTrack();
const I0=0.1,I1=0.9;
function progress(){const top=trackTop(),h=track.offsetHeight-vh;return Math.min(1,Math.max(0,(scrollY-top)/h));}
function scrollForStop(j){const k=j+0.02,u=k/(N-1+DWELL),p=I0+(I1-I0)*u;return trackTop()+p*(track.offsetHeight-vh);}
function goTo(j){scrollTo({top:scrollForStop(j),behavior:reduce?"auto":"smooth"});}

const ss=t=>t<=0?0:t>=1?1:t*t*(3-2*t);
const ease=t=>t<=0?0:t>=1?1:1-Math.pow(1-t,3);
function state(p){
  const u=Math.min(1,Math.max(0,(p-I0)/(I1-I0)));const k=u*(N-1+DWELL);let i=Math.floor(k),f=k-i,len,act,dwell=false;
  if(i>=N-1){i=N-1;len=L;act=N-1;dwell=true;}
  else if(f<DWELL){len=ANCH[i].len;act=i;dwell=true;}
  else{const g=ss((f-DWELL)/(1-DWELL));len=ANCH[i].len+(ANCH[i+1].len-ANCH[i].len)*g;act=g<0.5?i:i+1;}
  const zin=ease(p/I0), zout=ease((p-I1)/(1-I1));
  return {len,act,dwell,e:Math.max(0,zin-zout),zin,zout};
}

/* ---------- Camera ---------- */
let uz=1;const mobile=()=>vw<768;
function camTarget(st){
  const pt=ghost.getPointAtLength(st.len);
  const txt=(st.zout>0.5?outro:hero).getBoundingClientRect();
  const top=Math.max(txt.bottom||0, vh*0.3)+24, bot=vh-(mobile()?84:96);
  const avail=Math.max(160,bot-top);
  const os=Math.min((vw-48)/(BB.w+60),avail/(BB.h+40));
  const ox=BB.x+BB.w/2,oy=BB.y+BB.h/2,ofx=vw/2,ofy=top+avail/2;
  const fs=(mobile()?0.95:Math.min(1.35,Math.max(0.95,vw/1200)))*uz;
  const ffx=mobile()?vw/2:vw*0.64,ffy=mobile()?vh*0.3:vh*0.5;
  const e=st.e;const s=os+(fs-os)*e,cx=ox+(pt.x-ox)*e,cy=oy+(pt.y-oy)*e,fx=ofx+(ffx-ofx)*e,fy=ofy+(ffy-ofy)*e;
  return {s,tx:fx-cx*s,ty:fy-cy*s,pt};
}
let cam=null,curLen=0;

/* ---------- Card ---------- */
let shown=-1;
function renderCard(i){const s=STOPS[i];card.dataset.project=s.proj;
  const stats=s.stats?'<div class="stats">'+s.stats.map(x=>'<div><b>'+x[0]+'</b><span>'+x[1]+'</span></div>').join("")+'</div>':"";
  const gal=s.gal?'<div class="gal">'+s.gal.map((g,k)=>'<figure style="--r:'+[-3,2,-1][k%3]+'deg">'+g+'</figure>').join("")+'</div>':"";
  const href=s.id==="exzyt"?CASE_URL:s.id==="now"?"#contact":"#work";const ext=/^https?:/.test(href)?' target="_blank" rel="noopener"':"";const link=s.link?'<a class="tlink" href="'+href+'"'+ext+'>'+s.link+' <span aria-hidden="true">→</span></a>':"";
  card.innerHTML='<div class="c-head swap"><span class="logo">'+s.ini+'</span><span><span class="nm">'+s.name+'</span><br><span class="mt">'+s.meta+'</span></span><span class="ct">'+String(i+1).padStart(2,"0")+' / '+String(N).padStart(2,"0")+'</span></div>'+
   '<div class="c-body swap"><h3>'+s.head+'</h3><p>'+s.body+'</p>'+stats+gal+link+'</div>';
  $("who").parentElement.dataset.project=s.proj;
}
$("cursor").dataset.project="mono";

/* ---------- Handles ---------- */
const gH=$("handles");let hFor=-1;
function drawHandles(i,show){if(!show){if(hFor!==-1){gH.innerHTML="";hFor=-1;}return;}if(hFor===i)return;hFor=i;gH.innerHTML="";const a=ANCH[i];
  [a.i,a.o].forEach(h=>{if(!h)return;const l=document.createElementNS(NS,"line");l.setAttribute("x1",a.x);l.setAttribute("y1",a.y);l.setAttribute("x2",h[0]);l.setAttribute("y2",h[1]);l.setAttribute("class","handle-l");gH.appendChild(l);
    const c=document.createElementNS(NS,"circle");c.setAttribute("cx",h[0]);c.setAttribute("cy",h[1]);c.setAttribute("r",5);c.setAttribute("class","handle-d");gH.appendChild(c);});}

/* ---------- Frame loop ---------- */
let lastAct=-2;
const near=()=>{const r=track.getBoundingClientRect();return r.bottom>-innerHeight&&r.top<innerHeight*2;};
function frame(){
  if(!near()){requestAnimationFrame(frame);return;}
  const p=progress(),st=state(p),tg=camTarget(st);
  const k=reduce?1:0.14;
  if(!cam)cam={...tg};else{cam.s+=(tg.s-cam.s)*k;cam.tx+=(tg.tx-cam.tx)*k;cam.ty+=(tg.ty-cam.ty)*k;}
  curLen+=(st.len-curLen)*(reduce?1:0.2);
  world.style.transform="translate("+cam.tx.toFixed(2)+"px,"+cam.ty.toFixed(2)+"px) scale("+cam.s.toFixed(4)+")";
  const g=24*cam.s;stage.style.backgroundSize=g+"px "+g+"px";stage.style.backgroundPosition=cam.tx+"px "+cam.ty+"px";
  const target=(mobile()?40:46)+(mobile()?6:14)*st.e;world.style.setProperty("--pin",(target/(56*cam.s)).toFixed(3));

  const pt=ghost.getPointAtLength(curLen),q=ghost.getPointAtLength(Math.min(L,curLen+2)),q0=ghost.getPointAtLength(Math.max(0,curLen-2));
  const ang=Math.atan2(q.y-q0.y,q.x-q0.x)*180/Math.PI;
  cursor.style.transform="translate("+pt.x+"px,"+pt.y+"px) scale("+(1/cam.s).toFixed(3)+")";cursor.style.setProperty("--hd",(ang+90).toFixed(1)+"deg");
  trail.style.strokeDashoffset=(L-curLen).toFixed(1);trailU.style.strokeDashoffset=(L-curLen).toFixed(1);
  trail.style.strokeWidth=(2.5+st.zout*16).toFixed(2);
  ghost.style.opacity=(1-st.zout).toFixed(2);

  $("insX").textContent=Math.round(pt.x);$("insY").textContent=Math.round(pt.y);$("insA").textContent=Math.round(ang)+"°";$("needle").firstElementChild.style.transform="rotate("+ang+"deg)";
  $("zpct").textContent=Math.round(cam.s*100)+"%";

  const heroO=1-st.zin;hero.style.opacity=heroO.toFixed(2);hero.style.transform="translateY("+(-24*st.zin)+"px)";
  outro.style.opacity=st.zout.toFixed(2);outro.style.visibility=st.zout>0.02?"visible":"hidden";
  const cardO=Math.max(0,(st.e-0.55)/0.45);card.style.opacity=cardO.toFixed(2);card.style.visibility=cardO>0.01?"visible":"hidden";
  cursor.style.opacity=(st.zin>0.05||p>0)? (1-st.zout*0.0).toFixed(2):"0";

  const chromeO=Math.max(0,(st.e-0.4)/0.6).toFixed(2);
  $("inspector").style.opacity=chromeO;$("zoom").style.opacity=chromeO;$("zoom").style.visibility=chromeO>0.05?"visible":"hidden";
  const act=st.act;
  if(act!==shown){shown=act;renderCard(act);}
  drawHandles(act,st.dwell&&st.e>0.6&&st.zout<0.1);
  if(act!==lastAct||true){
    STOPS.forEach((s,i)=>{const passed=curLen>=ANCH[i].len-3;s.anc.setAttribute("class","anchor"+(i===act&&st.e>0.5&&st.zout<0.5?" on":passed?" passed":""));
      s.pinEl.classList.toggle("on",i===act&&st.e>0.5);s.dot.className="dotbtn"+(i===act&&st.e>0.3?" on":passed&&st.e>0.3?" passed":"");});
    lastAct=act;
  }
  $("scrubLabel").textContent=st.zout>0.5?"Path closed · "+String(N).padStart(2,"0")+" / "+String(N).padStart(2,"0"):st.e<0.3?"2021 → now":String(act+1).padStart(2,"0")+" / "+String(N).padStart(2,"0")+" · "+STOPS[act].name;
  if(playing){const max=trackTop()+track.offsetHeight-vh;if(scrollY>=max-2){setPlay(false);}else{scrollBy(0,Math.max(1.2,vh/420));}}
  requestAnimationFrame(frame);
}

/* ---------- Controls ---------- */
let playing=false;
function setPlay(v){playing=v&&!reduce;$("playBtn").setAttribute("aria-pressed",playing);$("playLabel").textContent=playing?"Playing":"Autoplay";}
$("playBtn").onclick=()=>{if(!playing&&progress()>=0.999)scrollTo({top:0});setPlay(!playing);};
["wheel","touchstart","keydown"].forEach(ev=>addEventListener(ev,e=>{if(playing&&!(e.target&&e.target.id==="playBtn"))setPlay(false);},{passive:true}));
const root=host;
function isDark(){const t=root.getAttribute("data-theme");return t?t==="dark":!matchMedia("(prefers-color-scheme: light)").matches;}
function syncTheme(){$("themeLabel").textContent=isDark()?"Day":"Night";}
$("themeBtn").onclick=()=>{root.setAttribute("data-theme",isDark()?"light":"dark");syncTheme();};
syncTheme();
$("zin").onclick=()=>{uz=Math.min(1.8,uz+0.2);};
$("zout").onclick=()=>{uz=Math.max(0.6,uz-0.2);};
$("recenter").onclick=()=>{uz=1;};
$("skip").onclick=e=>{e.preventDefault();$("workBtn").onclick();};
$("replayBtn").onclick=()=>{scrollTo({top:0,behavior:reduce?"auto":"smooth"});};
$("workBtn").onclick=()=>{const w=document.getElementById("work");if(w)scrollTo({top:w.getBoundingClientRect().top+scrollY-navH(),behavior:reduce?"auto":"smooth"});};
const live=()=>{const r=stage.getBoundingClientRect();return r.top<=navH()+2&&r.bottom>=innerHeight*0.5;};
addEventListener("keydown",e=>{if(!live()||["INPUT","TEXTAREA"].includes(document.activeElement.tagName))return;
  if(e.key==="ArrowRight"||e.key==="ArrowDown"||e.key==="j"){const p=progress();if(p<1){e.preventDefault();goTo(Math.min(N-1,progress()<I0?0:shown+1));}}
  else if(e.key==="ArrowLeft"||e.key==="ArrowUp"||e.key==="k"){if(progress()>0){e.preventDefault();shown<=0?scrollTo({top:0,behavior:reduce?"auto":"smooth"}):goTo(shown-1);}}});
addEventListener("resize",()=>{sizeTrack();});

/* deep link: #exzyt etc. */
const h=location.hash.slice(1);const hi=STOPS.findIndex(s=>s.id===h);if(hi>=0)setTimeout(()=>scrollTo({top:scrollForStop(hi)}),50);

requestAnimationFrame(frame);

}
