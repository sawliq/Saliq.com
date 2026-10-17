// Project Drawer, mounted from the published artifact (https://claude.ai/artifact/Ri6xRV3gXrwCij3S41Aj8X).
// Runs inside a shadow root so its ids and classes stay separate from the site.
export function mountProjectDrawer(host, sroot) {

/* ---------- Content: replace placeholders ---------- */
const PROJECTS=[
 {kind:"Workshop",proj:"exzyt",ini:"W1",name:"Workshop 01",meta:"[Month, year] · Dubai",
  head:"[Workshop title 01]",teaser:"Placeholder: what the group made or learned.",
  body:"Placeholder: what the group was stuck on, how you ran the session and <strong>what they left with</strong>.",
  stats:[["[00]","Participants"],["[0h]","Duration"]],gal:["Session","Board","Output"],r:-3},
 {kind:"Initiative",proj:"wikit",ini:"I1",name:"Initiative 01",meta:"20XX · [Team]",
  head:"[Initiative title 01]",teaser:"Placeholder: the initiative in one sentence.",
  body:"Placeholder: the problem it set out to solve, who you worked with, and <strong>what changed because of it</strong>.",
  stats:[["[00%]","Metric label"],["[00]","Metric label"]],gal:["Before","After"],r:1.5},
 {kind:"Workshop",proj:"viya",ini:"W2",name:"Workshop 02",meta:"[Month, year] · Online",
  head:"[Workshop title 02]",teaser:"Placeholder: what the group made or learned.",
  body:"Placeholder: what the group was stuck on, how you ran the session and <strong>what they left with</strong>.",
  stats:[["[00]","Participants"],["[0h]","Duration"]],gal:["Session","Prototype"],r:-1},
 {kind:"Initiative",proj:"mono",ini:"I2",name:"Initiative 02",meta:"20XX · [Team]",
  head:"[Initiative title 02]",teaser:"Placeholder: the initiative in one sentence.",
  body:"Placeholder: the problem it set out to solve, who you worked with, and <strong>what changed because of it</strong>.",
  stats:[["[0.0×]","Metric label"],["[00]","Metric label"]],gal:["Kickoff","Community","Result"],r:2.5},
 {empty:true,kind:"Next",proj:"mono",ini:"+",name:"Next",meta:"Being planned",head:"Coming soon",teaser:"The next project is being planned.",r:3.5}
];

const $=id=>sroot.getElementById(id);
const row=$("row"),drawer=$("drawer"),sheet=$("sheet"),panel=$("panel"),front=$("front");
const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
const pad2=n=>String(n).padStart(2,"0");

/* ---------- Theme: same Day / Night pill as Pen Path ---------- */
const root=host;
function isDark(){const t=root.getAttribute("data-theme");return t?t==="dark":!matchMedia("(prefers-color-scheme: light)").matches;}
function syncTheme(){$("themeLabel").textContent=isDark()?"◑ Day":"◐ Night";}
try{const s=localStorage.getItem("pd-theme");if(s)root.setAttribute("data-theme",s);}catch(e){}
$("themeBtn").onclick=()=>{const t=isDark()?"light":"dark";root.setAttribute("data-theme",t);try{localStorage.setItem("pd-theme",t);}catch(e){}syncTheme();};
syncTheme();

/* ---------- Build cards and dots ---------- */
const S=[];
PROJECTS.forEach((p,i)=>{
  const el=document.createElement("button");el.type="button";el.className="card"+(p.empty?" empty":"");el.dataset.project=p.proj;
  el.setAttribute("aria-label",p.empty?"Next project, being planned":"Open "+p.kind+": "+p.head);
  if(p.empty)el.setAttribute("aria-disabled","true");
  el.innerHTML='<span class="c-head"><span class="logo">'+p.ini+'</span><span><span class="nm">'+p.kind+'</span><br><span class="mt">'+p.meta+'</span></span></span>'+
    '<span class="c-body"><span class="ttl">'+p.head+'</span><span class="tsr">'+p.teaser+'</span>'+(p.empty?'':'<span class="tlink">Open <span aria-hidden="true">→</span></span>')+'</span>';
  el.addEventListener("click",()=>{if(!p.empty)openSheet(i,el);});
  el.addEventListener("focus",()=>select(i));
  row.appendChild(el);
  S.push({el,p,base:0,x:0,vx:0,lift:0,vl:0,show:true});
});
function visible(){return S.map((s,i)=>s.show&&!s.p.empty?i:-1).filter(i=>i>=0);}
function buildDots(){
  const d=$("dots");d.innerHTML="";
  visible().forEach(i=>{const b=document.createElement("button");b.type="button";b.className="dotbtn";b.dataset.project=PROJECTS[i].proj;b.dataset.i=i;
    b.setAttribute("aria-label",PROJECTS[i].head);b.innerHTML="<i></i>";b.onclick=()=>select(i);d.appendChild(b);});
}
sroot.querySelector('[data-count="all"]').textContent=visible().length;
["Workshop","Initiative"].forEach(k=>sroot.querySelector('[data-count="'+k+'"]').textContent=PROJECTS.filter(p=>p.kind===k).length);

/* ---------- Selection: one card is raised at a time ---------- */
let filter="all",sel=-1,hoverIdx=-1,pointerX=null,cw=0,ch=0;
const active=()=>hoverIdx>=0?hoverIdx:sel;
function readout(){
  const i=active(),txt=$("rTxt");
  const vis=visible();
  if(i<0){front.dataset.project="mono";txt.innerHTML=filter==="all"?vis.length+' projects <span>· move across the drawer, or use the arrows</span>':vis.length+' '+filter.toLowerCase()+'s <span>· the rest sank into the drawer</span>';}
  else{const p=PROJECTS[i];front.dataset.project=p.proj;txt.innerHTML=p.empty?'Next <span>· being planned</span>':p.kind+' · '+p.head+(p.empty?'':' <span>· click to open</span>');}
  const k=vis.indexOf(sel);
  $("count").innerHTML=pad2(k<0?0:k+1)+' <span>/ '+pad2(vis.length)+'</span>';
  [...$("dots").children].forEach(b=>b.classList.toggle("on",Number(b.dataset.i)===sel));
  S.forEach((s,j)=>s.el.classList.toggle("on",j===i));
}
function select(i){sel=i;readout();}
function stepSel(d){
  const vis=visible();if(!vis.length)return;
  const k=vis.indexOf(sel);
  select(vis[k<0?(d>0?0:vis.length-1):(k+d+vis.length)%vis.length]);
}
$("navPrev").onclick=()=>stepSel(-1);
$("navNext").onclick=()=>stepSel(1);

/* ---------- Layout ---------- */
function layout(){
  const W=row.clientWidth,narrow=W<600;
  const shown=S.filter(s=>s.show);
  cw=Math.round(narrow?Math.max(130,W*0.42):Math.min(232,Math.max(150,W*0.17)));
  ch=narrow?Math.round(150+44):Math.round(cw*0.6+150+44); // content + foot hidden behind the front panel
  drawer.style.setProperty("--cw",cw+"px");drawer.style.setProperty("--ch",ch+"px");
  const pad=Math.max(16,W*0.04),span=W-pad*2-cw;
  const step=shown.length>1?Math.min(cw+24,span/(shown.length-1)):0;
  const start=(W-(step*(shown.length-1)+cw))/2;
  shown.forEach((s,k)=>{s.base=start+k*step;});
}

/* ---------- Pointer: cards part left and right around it ---------- */
function nearest(px){let best=-1,bd=1e9;S.forEach((s,i)=>{if(!s.show)return;const d=Math.abs(px-(s.base+cw/2));if(d<bd){bd=d;best=i;}});return bd<cw*0.6?best:-1;}
function onMove(e){const r=row.getBoundingClientRect(),pt=e.touches?e.touches[0]:e;pointerX=pt.clientX-r.left;
  const n=pt.clientY<r.bottom?nearest(pointerX):-1; if(n!==hoverIdx){hoverIdx=n;readout();}}
function onLeave(){pointerX=null;if(hoverIdx!==-1){hoverIdx=-1;readout();}}
row.addEventListener("mousemove",onMove);row.addEventListener("mouseleave",onLeave);
row.addEventListener("touchstart",onMove,{passive:true});row.addEventListener("touchmove",onMove,{passive:true});
row.addEventListener("touchend",()=>setTimeout(onLeave,600));

function frame(){
  const W=row.clientWidth,edge=Math.max(8,W*0.015),a=active();
  S.forEach((s,i)=>{
    let tx=s.base,tl=0;
    if(a>=0||pointerX!==null){
      const ref=pointerX!==null?pointerX:S[a].base+cw/2;
      const d=s.base+cw/2-ref,sigma=cw*1.1,amp=Math.min(70,cw*0.38);
      if(i!==a)tx+=Math.sign(d||1)*amp*Math.exp(-(d*d)/(2*sigma*sigma));
      else if(pointerX!==null)tx+=Math.max(-cw*.12,Math.min(cw*.12,-d*.15));
    }
    tx=Math.max(edge,Math.min(W-cw-edge,tx));
    if(i===a)tl=s.p.empty?-12:-Math.min(64,ch*0.22);
    if(!s.show)tl=ch;
    if(reduce){s.x=tx;s.lift=tl;s.vx=0;}
    else{s.vx=(s.vx+(tx-s.x)*0.09)*0.78;s.x+=s.vx;s.vl=(s.vl+(tl-s.lift)*0.12)*0.74;s.lift+=s.vl;}
    const on=i===a,tilt=reduce?0:Math.max(-8,Math.min(8,s.vx*0.9));
    s.el.style.transform="translate("+s.x.toFixed(1)+"px,"+s.lift.toFixed(1)+"px) rotate("+((on?0:s.p.r)+tilt).toFixed(2)+"deg) scale("+(on&&!s.p.empty?1.04:1)+")";
    s.el.style.zIndex=on?10:1+i;
  });
  requestAnimationFrame(frame);
}

/* ---------- Filters ---------- */
sroot.querySelectorAll("[data-filter]").forEach(btn=>btn.addEventListener("click",()=>{
  const k=btn.dataset.filter;filter=k;
  sroot.querySelectorAll("[data-filter]").forEach(b=>b.setAttribute("aria-pressed",String(b===btn)));
  S.forEach(s=>{s.show=k==="all"||s.p.kind===k;s.el.classList.toggle("out",!s.show);s.el.tabIndex=s.show?0:-1;});
  if(sel>=0&&!S[sel].show)sel=-1;
  hoverIdx=-1;layout();buildDots();readout();
}));

/* ---------- Detail sheet ---------- */
let current=-1,opener=null;
function renderSheet(i){
  const p=PROJECTS[i],vis=visible(),k=vis.indexOf(i);
  panel.dataset.project=p.proj;
  const stats='<div class="stats">'+p.stats.map(x=>'<div><b>'+x[0]+'</b><span>'+x[1]+'</span></div>').join("")+'</div>';
  const gal='<div class="gal">'+p.gal.map((g,j)=>'<figure style="--r:'+[-3,2,-1][j%3]+'deg">'+g+'</figure>').join("")+'</div>';
  panel.innerHTML='<div class="c-head"><span class="logo">'+p.ini+'</span><span><span class="nm">'+p.kind+'</span><br><span class="mt">'+p.meta+'</span></span><span class="ct">'+pad2(k+1)+' / '+pad2(vis.length)+'</span></div>'+
    '<div class="p-body"><h3 id="pTitle">'+p.head+'</h3><p>'+p.body+'</p>'+stats+gal+
    '<div class="p-foot"><button class="btn pri" type="button">View case study <span aria-hidden="true">→</span></button>'+
    '<div class="navs"><button class="ib" type="button" data-go="-1" aria-label="Previous project">←</button><button class="ib" type="button" data-go="1" aria-label="Next project">→</button><button class="ib" type="button" data-close aria-label="Close">×</button></div></div></div>';
  panel.querySelectorAll("[data-go]").forEach(b=>b.onclick=()=>go(Number(b.dataset.go)));
  panel.querySelector("[data-close]").onclick=closeSheet;
}
function openSheet(i,from){
  const was=sheet.classList.contains("open");current=i;select(i);if(!was)opener=from;
  renderSheet(i);sheet.classList.add("open");sheet.setAttribute("aria-hidden","false");host.setAttribute("data-open","");
  if(!reduce&&panel.animate){
    if(!was&&from){const a=from.getBoundingClientRect(),b=panel.getBoundingClientRect();
      const dx=(a.left+a.width/2)-(b.left+b.width/2),dy=(a.top+a.height/2)-(b.top+b.height/2);
      panel.animate([{transform:"translate(calc(-50% + "+dx+"px), calc(-50% + "+dy+"px)) scale("+(a.width/b.width).toFixed(3)+")",opacity:.4},{transform:"translate(-50%,-50%) scale(1)",opacity:1}],{duration:420,easing:"cubic-bezier(.2,.8,.2,1)"});}
    else panel.animate([{opacity:.5},{opacity:1}],{duration:180});
  }
  panel.querySelector("[data-close]").focus();
}
function closeSheet(){sheet.classList.remove("open");sheet.setAttribute("aria-hidden","true");host.removeAttribute("data-open");if(opener)opener.focus();}
function go(d){const vis=visible(),k=vis.indexOf(current);const n=vis[(k+d+vis.length)%vis.length];openSheet(n,S[n].el);}
sheet.addEventListener("click",e=>{if(e.target===sheet)closeSheet();});

/* ---------- Keyboard: arrows browse, Enter opens, Escape closes ---------- */
addEventListener("keydown",e=>{
  const open=sheet.classList.contains("open");
  if(open){if(e.key==="Escape")closeSheet();else if(e.key==="ArrowRight")go(1);else if(e.key==="ArrowLeft")go(-1);return;}
  if(!drawer.contains(sroot.activeElement))return;
  if(e.key==="ArrowRight"){e.preventDefault();stepSel(1);}
  else if(e.key==="ArrowLeft"){e.preventDefault();stepSel(-1);}
  else if(e.key==="Enter"&&sel>=0&&(sroot.activeElement&&sroot.activeElement.closest(".nav"))){e.preventDefault();openSheet(sel,S[sel].el);}
});

layout();S.forEach(s=>{s.x=s.base;});buildDots();readout();
addEventListener("resize",layout);
requestAnimationFrame(frame);

}
