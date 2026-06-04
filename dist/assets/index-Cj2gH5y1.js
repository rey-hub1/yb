import{g as me,r as l,j as e,G as ue,R as pe,D as ve,P as se}from"./pdf-vendor-MPKudnV3.js";import{r as ke}from"./react-vendor-C32Xm_nT.js";import{H as we}from"./flipbook-vendor-D8A3Rv33.js";(function(){const o=document.createElement("link").relList;if(o&&o.supports&&o.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))t(r);new MutationObserver(r=>{for(const d of r)if(d.type==="childList")for(const c of d.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&t(c)}).observe(document,{childList:!0,subtree:!0});function s(r){const d={};return r.integrity&&(d.integrity=r.integrity),r.referrerPolicy&&(d.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?d.credentials="include":r.crossOrigin==="anonymous"?d.credentials="omit":d.credentials="same-origin",d}function t(r){if(r.ep)return;r.ep=!0;const d=s(r);fetch(r.href,d)}})();var Q={},ie=ke;Q.createRoot=ie.createRoot,Q.hydrateRoot=ie.hydrateRoot;const B=[{id:1,name:"RPL 1",pdf:"/yearbook/RPL-1.pdf",cover:"/yearbook/covers/RPL-1.jpg",hue:"#2B4C7E",palette:{primary:"#473911",secondary:"#7a5d53",accent:"#615532",left:"#3f3210",right:"#7a5d53"}},{id:2,name:"RPL 2",pdf:"/yearbook/RPL-2.pdf",cover:"/yearbook/covers/RPL-2.jpg",hue:"#1A365D",palette:{primary:"#405289",secondary:"#c0c9e4",accent:"#5b6a9a",left:"#42558d",right:"#c0c9e4"}},{id:3,name:"TKJ 1",pdf:"/yearbook/TKJ-1.pdf",cover:"/yearbook/covers/TKJ-1.jpg",hue:"#276749",palette:{primary:"#8699ac",secondary:"#2b3745",accent:"#97a7b8",left:"#a78773",right:"#2c3947"}},{id:4,name:"TKJ 2",pdf:"/yearbook/TKJ-2.pdf",cover:"/yearbook/covers/TKJ-2.jpg",hue:"#22543D",palette:{primary:"#2e3418",secondary:"#737a52",accent:"#4b5038",left:"#303719",right:"#737a52"}},{id:5,name:"MP 1",pdf:"/yearbook/MP-1.pdf",cover:"/yearbook/covers/MP-1.jpg",hue:"#C05621",palette:{primary:"#896441",secondary:"#422f1d",accent:"#9a7a5c",left:"#836953",right:"#422f1d"}},{id:6,name:"MP 2",pdf:"/yearbook/MP-2.pdf",cover:"/yearbook/covers/MP-2.jpg",hue:"#9B2C2C",palette:{primary:"#786451",secondary:"#251d1b",accent:"#8b7a69",left:"#786553",right:"#251d1b"}},{id:7,name:"DPB 1",pdf:"/yearbook/DPB-1.pdf",cover:"/yearbook/covers/DPB-1.jpg",hue:"#553C9A",palette:{primary:"#d3b205",secondary:"#8697af",accent:"#d5b50f",left:"#d3b205",right:"#4493d0"}},{id:8,name:"DPB 2",pdf:"/yearbook/DPB-2.pdf",cover:"/yearbook/covers/DPB-2.jpg",hue:"#44337A",palette:{primary:"#2c2e40",secondary:"#835d4e",accent:"#4a4b5b",left:"#825c4d",right:"#121e2b"}},{id:9,name:"DPB 3",pdf:"/yearbook/DPB-3.pdf",cover:"/yearbook/covers/DPB-3.jpg",hue:"#702459",palette:{primary:"#560a0a",secondary:"#6b6767",accent:"#6e2c2c",left:"#451c1d",right:"#6b6767"}},{id:10,name:"AK 1",pdf:"/yearbook/AK-1.pdf",cover:"/yearbook/covers/AK-1.jpg",hue:"#744210",palette:{primary:"#af938a",secondary:"#cccccc",accent:"#baa29a",left:"#af9289",right:"#cccccc"}},{id:11,name:"AK 2",pdf:"/yearbook/AK-2.pdf",cover:"/yearbook/covers/AK-2.jpg",hue:"#C05A00",palette:{primary:"#cfbcb7",secondary:"#9e9491",accent:"#d1bfba",left:"#d0bfba",right:"#9e9491"}},{id:12,name:"AK 3",pdf:"/yearbook/AK-3.pdf",cover:"/yearbook/covers/AK-3.jpg",hue:"#7B341E",palette:{primary:"#886340",secondary:"#989898",accent:"#99795b",left:"#77604b",right:"#989898"}},{id:13,name:"BR 1",pdf:"/yearbook/BR-1.pdf",cover:"/yearbook/covers/BR-1.jpg",hue:"#234E52",palette:{primary:"#7b6b53",secondary:"#aa9885",accent:"#8d806b",left:"#826f54",right:"#ac9985"}},{id:14,name:"BR 2",pdf:"/yearbook/BR-2.pdf",cover:"/yearbook/covers/BR-2.jpg",hue:"#1D4044",palette:{primary:"#ad8b81",secondary:"#3b372e",accent:"#b89b93",left:"#ac8a7f",right:"#3b372e"}},{id:15,name:"BD 1",pdf:"/yearbook/BD-1.pdf",cover:"/yearbook/covers/BD-1.jpg",hue:"#C53030",palette:{primary:"#7b6553",secondary:"#aa9580",accent:"#8d7b6b",left:"#7a6554",right:"#ad9985"}},{id:16,name:"BD 2",pdf:"/yearbook/BD-2.pdf",cover:"/yearbook/covers/BD-2.jpg",hue:"#9B1C1C",palette:{primary:"#46372c",secondary:"#617754",accent:"#60534a",left:"#6d7c56",right:"#94a67a"}}],U=new Map;function be(a,o,s){return`#${[a,o,s].map(t=>Math.max(0,Math.min(255,t)).toString(16).padStart(2,"0")).join("")}`}function O(a){const o=a.replace("#",""),s=o.length===3?o.split("").map(r=>r+r).join(""):o,t=Number.parseInt(s,16);return{r:t>>16&255,g:t>>8&255,b:t&255}}function q(a){const{r:o,g:s,b:t}=O(a);return(.2126*o+.7152*s+.0722*t)/255>.66}function L(a,o,s){const t=O(a),r=O(o),d=Math.max(0,Math.min(1,s));return be(Math.round(t.r+(r.r-t.r)*d),Math.round(t.g+(r.g-t.g)*d),Math.round(t.b+(r.b-t.b)*d))}function G(a,o){const{r:s,g:t,b:r}=O(a);return`rgba(${s},${t},${r},${o})`}function ee(a,o){const s=O(a),t=O(o);return Math.sqrt((s.r-t.r)**2+(s.g-t.g)**2+(s.b-t.b)**2)}function le(a,o,s){const t=a/255,r=o/255,d=s/255,c=Math.max(t,r,d),k=Math.min(t,r,d),u=c-k,v=(c+k)/2;if(u===0)return{h:0,s:0,l:v};const P=u/(1-Math.abs(2*v-1));let S;return c===t?S=(r-d)/u%6:c===r?S=(d-t)/u+2:S=(t-r)/u+4,{h:Math.round(S*60<0?S*60+360:S*60),s:P,l:v}}function D(a,o,s={}){const t=o??(q(a)?L(a,"#102033",.4):L(a,"#ffffff",.26)),r=s.accent??L(a,"#ffffff",q(a)?.04:.14);return{primary:a,secondary:t,accent:r,left:s.left??a,right:s.right??t}}function je(a,o){return o?D(L(a.primary,o.primary,.42),L(a.secondary,o.secondary,.58),{accent:L(a.accent,o.accent,.5),left:a.primary,right:o.primary}):D(a.primary,a.secondary,{accent:a.accent,left:a.primary,right:a.primary})}function Ne(a,o){if(!o)return{left:1,right:null};if(a<=0)return{left:1,right:null};const s=Math.min(o,a+1),t=a+2<=o?a+2:null;return{left:s,right:t}}function Z(a,o={xStart:0,xEnd:1,yStart:0,yEnd:1}){const s=new Map,{data:t,width:r,height:d}=a,c=Math.max(0,Math.floor(r*o.xStart)),k=Math.min(r,Math.ceil(r*o.xEnd)),u=Math.max(0,Math.floor(d*o.yStart)),v=Math.min(d,Math.ceil(d*o.yEnd)),P=Math.max(1,k-c),S=Math.max(1,v-u);for(let g=u;g<v;g+=2)for(let h=c;h<k;h+=2){const M=(g*r+h)*4,C=t[M],b=t[M+1],w=t[M+2];if(t[M+3]<180)continue;const{h:F,s:n,l:i}=le(C,b,w),p=(C+b+w)/765;if(p>.97&&n<.08||p<.08||n<.08&&i>.84)continue;const y=(h-c)/P,x=(g-u)/S,R=1-Math.min(1,Math.abs(y-.5)*2),A=1-Math.min(1,Math.abs(x-.28)*2.4),j=1+R*.8+Math.max(0,A)*1.15,Y=.9+n*3.6+(1-Math.abs(i-.5))*.7,J=j*Y,V=`${Math.round(F/14)*14}-${Math.round(n*5)}-${Math.round(i*5)}`,K=s.get(V)??{score:0,totalR:0,totalG:0,totalB:0,totalS:0,count:0};K.score+=J,K.totalR+=C,K.totalG+=b,K.totalB+=w,K.totalS+=n,K.count+=1,s.set(V,K)}const E=Array.from(s.values()).filter(g=>g.count>=12).map(g=>{const h=Math.round(g.totalR/g.count),M=Math.round(g.totalG/g.count),C=Math.round(g.totalB/g.count),b=be(h,M,C),w=le(h,M,C);return{...g,hex:b,hsl:w,avgS:g.totalS/g.count}}).sort((g,h)=>h.score-g.score),z=E.find(g=>g.hsl.s>.18)??E[0];if(!z)return null;const m=E.find(g=>g!==z&&g.score>z.score*.2&&ee(g.hex,z.hex)>72);return D(z.hex,m==null?void 0:m.hex)}async function ae(a,o,s){const t=D(s),r=`${a}::${o}`;if(U.has(r))return U.get(r);const c=me(a).promise.then(async k=>{try{const u=Math.min(Math.max(1,o),k.numPages),v=await k.getPage(u),P=v.getViewport({scale:1}),S=Math.min(1.35,Math.max(.34,220/P.width)),E=v.getViewport({scale:S}),z=document.createElement("canvas"),m=z.getContext("2d",{willReadFrequently:!0});if(!m)return t;z.width=Math.max(1,Math.floor(E.width)),z.height=Math.max(1,Math.floor(E.height)),await v.render({canvasContext:m,viewport:E}).promise;const g=m.getImageData(0,0,z.width,z.height),h=Z(g);if(!h)return t;const M=Z(g,{xStart:.03,xEnd:.47,yStart:.08,yEnd:.92}),C=Z(g,{xStart:.53,xEnd:.97,yStart:.08,yEnd:.92}),b=(M==null?void 0:M.primary)??h.primary;let w=(C==null?void 0:C.primary)??h.secondary;return ee(b,w)<44&&(w=ee(b,h.secondary)>44?h.secondary:L(b,q(b)?"#13233b":"#ffffff",q(b)?.3:.2)),D(h.primary,h.secondary,{left:b,right:w})}finally{await k.destroy()}}).catch(()=>t);return U.set(r,c),c}function Ce(a,o,s,t){return{"--hue":(t[a.pdf]??a.palette??D(a.hue)).primary,"--delay":`${o*40}ms`}}function te(a,o){if(a!=="editorial"||!o)return;const s=o.primary,t=o.secondary,r=o.accent,d=o.left??s,c=o.right??t,k=L(d,"#05070b",.42),u=L(s,t,.38),v=L(c,"#04060a",.46);return{"--yb-overlay-bg":L(L(d,c,.5),"#000000",.72),"--yb-overlay-bg-start":k,"--yb-overlay-bg-mid":u,"--yb-overlay-bg-end":v,"--yb-overlay-glow-a":G(L(d,"#ffffff",.06),.34),"--yb-overlay-glow-b":G(L(c,"#ffffff",.05),.28),"--yb-overlay-book-glow":G(L(s,r,.35),.22),"--yb-overlay-hdr":G(r,.28),"--yb-overlay-accent":r,"--yb-overlay-accent-soft":G(r,.16),"--yb-overlay-txt":"#ffffff","--yb-overlay-dim":"rgba(255,255,255,0.72)"}}function _({color:a,onChange:o,label:s}){const[t,r]=l.useState(a);l.useEffect(()=>{r(a)},[a]);const d=c=>{r(c),/^#[0-9A-F]{6}$/i.test(c)&&o(c)};return e.jsxs("div",{className:"flex flex-col items-center gap-1.5 bg-slate-950 p-2 rounded-lg border border-slate-800/80 hover:border-slate-700/80 transition-all duration-300",children:[e.jsx("span",{className:"text-[10px] text-slate-400 font-semibold tracking-wide",children:s}),e.jsxs("div",{className:"relative w-8 h-8 rounded-full border border-slate-700 overflow-hidden cursor-pointer hover:scale-105 active:scale-95 transition-transform",style:{background:"conic-gradient(from 0deg, red, yellow, lime, aqua, blue, magenta, red)"},title:"Pilih Warna (Color Wheel)",children:[e.jsx("div",{className:"absolute inset-[3px] rounded-full border border-slate-900 shadow-inner",style:{backgroundColor:a}}),e.jsx("input",{type:"color",value:a,onChange:c=>d(c.target.value),className:"absolute inset-0 opacity-0 cursor-pointer w-full h-full"})]}),e.jsx("input",{type:"text",value:t,onChange:c=>d(c.target.value),className:"w-16 text-center text-[10px] font-mono bg-slate-900 border border-slate-800 rounded py-0.5 text-slate-200 focus:outline-none focus:border-indigo-500 transition-all",placeholder:"#Hex"})]})}function ze({onBack:a}){const[o,s]=l.useState(()=>{var n;return((n=B[0])==null?void 0:n.id)||null}),[t,r]=l.useState(()=>{const n={};return B.forEach(i=>{n[i.id]=i.hue}),n}),[d,c]=l.useState(()=>{const n={};return B.forEach(i=>{i.palette&&(n[i.pdf]=i.palette)}),n}),[k,u]=l.useState({}),[v,P]=l.useState({}),[S,E]=l.useState({}),[z,m]=l.useState(!1);l.useEffect(()=>{B.forEach(async n=>{P(i=>({...i,[n.pdf]:"checking"}));try{(await fetch(n.pdf,{method:"HEAD"})).ok?P(p=>({...p,[n.pdf]:"exists"})):P(p=>({...p,[n.pdf]:"missing"}))}catch{P(p=>({...p,[n.pdf]:"missing"}))}})},[]);const g=l.useCallback((n,i)=>{r(p=>({...p,[n]:i}))},[]),h=l.useCallback((n,i,p)=>{c(y=>{const x=B.find(Y=>Y.pdf===n),R=x?t[x.id]||x.hue:"#ffffff",A=y[n]||D(R),j={...A,[i]:p};return i==="primary"&&A.left===A.primary&&(j.left=p),i==="secondary"&&A.right===A.secondary&&(j.right=p),{...y,[n]:j}})},[t]),M=l.useCallback(n=>{const i=t[n.id]||n.hue,p=D(i);c(y=>({...y,[n.pdf]:p}))},[t]),C=l.useCallback(n=>{c(i=>{const p={...i};return delete p[n.pdf],p})},[]),b=l.useCallback(async n=>{u(i=>({...i,[n.pdf]:!0})),E(i=>({...i,[n.pdf]:null}));try{const i=await ae(n.pdf,2,t[n.id]||n.hue);if(i)c(p=>({...p,[n.pdf]:i}));else throw new Error("Gagal mengekstrak warna dominan")}catch(i){console.error("Gagal mengekstrak warna untuk",n.name,i),E(p=>({...p,[n.pdf]:i.message||"Gagal membaca PDF"}))}finally{u(i=>({...i,[n.pdf]:!1}))}},[t]),w=l.useCallback(async()=>{const n=B.filter(i=>v[i.pdf]==="exists");for(const i of n)d[i.pdf]||await b(i)},[v,d,b]),T=l.useCallback(()=>`export const CLASSES = [
${B.map(i=>{const p=t[i.id]||i.hue,y=d[i.pdf],x=y?`, palette: ${JSON.stringify(y)}`:"";return`  { id: ${i.id}, name: "${i.name}", pdf: "${i.pdf}", hue: "${p}"${x} },`}).join(`
`)}
];

export const THEMES = [
  { id: "paper",     label: "Kertas"    },
  { id: "modern",    label: "Modern"    },
  { id: "editorial", label: "Editorial" },
];
`,[t,d]),F=l.useCallback(()=>{const n=T();navigator.clipboard.writeText(n).then(()=>{m(!0),setTimeout(()=>m(!1),2e3)})},[T]);return e.jsxs("div",{className:"min-height-screen bg-slate-950 text-slate-100 font-sans p-6 sm:p-10 selection:bg-indigo-500 selection:text-white",children:[e.jsxs("div",{className:"max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-6 border-b border-slate-800 pb-8 mb-8",children:[e.jsxs("div",{children:[e.jsxs("div",{className:"flex items-center gap-3 mb-2",children:[e.jsx("span",{className:"bg-indigo-600/20 text-indigo-400 text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded-md border border-indigo-500/30",children:"Admin Mode"}),e.jsx("h1",{className:"text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-400 bg-clip-text text-transparent",children:"Yearbook Color Palettes"})]}),e.jsx("p",{className:"text-slate-400 text-sm",children:"Ekstrak warna langsung dari halaman PDF untuk menghilangkan kendala performa loading halaman utama."})]}),e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("button",{onClick:a,className:"flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-300 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg transition-all duration-200 hover:text-white",children:"← Kembali ke Web"}),e.jsx("button",{onClick:w,className:"px-4 py-2 text-sm font-semibold text-indigo-300 bg-indigo-950/40 border border-indigo-900 hover:border-indigo-800 hover:bg-indigo-950/60 rounded-lg transition-all duration-200",children:"Ekstrak Semua PDF Ready"}),e.jsx("button",{onClick:F,className:`flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-lg transition-all duration-200 shadow-lg ${z?"bg-emerald-600 text-white shadow-emerald-900/30 border border-emerald-500":"bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-900/20 border border-indigo-500"}`,children:z?e.jsxs(e.Fragment,{children:[e.jsx("svg",{className:"w-4 h-4",fill:"none",stroke:"currentColor",strokeWidth:"2",viewBox:"0 0 24 24",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M5 13l4 4L19 7"})}),"Tersalin!"]}):e.jsxs(e.Fragment,{children:[e.jsx("svg",{className:"w-4 h-4",fill:"none",stroke:"currentColor",strokeWidth:"2",viewBox:"0 0 24 24",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"})}),"Copy classes.js Config"]})})]})]}),e.jsxs("div",{className:"max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8",children:[e.jsxs("div",{className:"lg:col-span-2 space-y-4",children:[e.jsxs("div",{className:"flex items-center justify-between px-2 mb-2",children:[e.jsxs("h2",{className:"text-lg font-bold text-slate-300",children:["Daftar Kelas (",B.length,")"]}),e.jsx("span",{className:"text-xs text-slate-500",children:"Ekstraksi dijalankan pada halaman ke-2 PDF"})]}),e.jsx("div",{className:"grid grid-cols-1 sm:grid-cols-2 gap-4",children:B.map(n=>{const i=v[n.pdf]||"checking",p=d[n.pdf],y=k[n.pdf]||!1,x=S[n.pdf],R=p?p.primary:t[n.id]||n.hue,A=o===n.id;return e.jsxs("div",{className:`border rounded-xl p-5 transition-all duration-350 flex flex-col justify-between gap-4 cursor-pointer relative overflow-hidden ${A?"border-indigo-500 bg-slate-900/90 ring-1 ring-indigo-500/20 shadow-lg shadow-indigo-950/40":"bg-slate-900/60 border-slate-800/80 hover:border-slate-700/80 hover:bg-slate-900/80"}`,onClick:()=>s(n.id),children:[e.jsxs("div",{className:"flex items-start justify-between gap-2",onClick:j=>j.stopPropagation(),children:[e.jsxs("div",{children:[e.jsxs("h3",{className:"font-bold text-lg text-slate-100 flex items-center gap-2",children:[e.jsxs("span",{className:"text-indigo-400 font-mono text-sm",children:["#",String(n.id).padStart(2,"0")]}),n.name]}),e.jsx("p",{className:"text-slate-500 font-mono text-[11px] truncate max-w-[200px]",title:n.pdf,children:n.pdf})]}),i==="checking"&&e.jsx("span",{className:"text-[10px] font-semibold text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700",children:"Checking..."}),i==="exists"&&e.jsx("span",{className:"text-[10px] font-bold text-emerald-400 bg-emerald-950/30 px-2 py-0.5 rounded border border-emerald-900/50",children:"PDF OK"}),i==="missing"&&e.jsx("span",{className:"text-[10px] font-bold text-rose-400 bg-rose-950/30 px-2 py-0.5 rounded border border-rose-900/50",children:"HILANG"})]}),e.jsxs("div",{className:"relative w-full h-16 bg-[#fcfbfa] border border-black/5 text-[#231c15] rounded shadow-sm overflow-hidden p-3 flex flex-col justify-between transition-all duration-300",style:{fontFamily:"'Lora', Georgia, serif"},children:[e.jsx("div",{className:"absolute top-0 left-0 right-0 h-1 transition-all duration-300",style:{backgroundColor:R}}),e.jsx("div",{className:"absolute left-2.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#e6dec8] shadow-inner"}),e.jsx("div",{className:"absolute top-2 right-2.5 text-[9px] font-bold opacity-30 font-mono",children:String(n.id).padStart(2,"0")}),e.jsxs("div",{className:"pl-5 pr-2",children:[e.jsx("span",{className:"text-[7px] uppercase tracking-wider text-[#a38c74] font-bold font-sans",children:"Kelas"}),e.jsx("h4",{className:"font-serif text-[13px] font-bold truncate transition-all duration-350",style:{color:R},children:n.name})]})]}),e.jsxs("div",{onClick:j=>j.stopPropagation(),children:[p?e.jsxs("div",{className:"space-y-2.5",children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx("span",{className:"text-[10px] text-slate-500 font-semibold tracking-wider uppercase",children:"Palet Warna (Edit via Roda):"}),e.jsx("button",{onClick:()=>C(n),className:"text-[9px] text-rose-400 hover:text-rose-300 font-semibold transition-colors",children:"Hapus Palet"})]}),e.jsxs("div",{className:"grid grid-cols-3 gap-2",children:[e.jsx(_,{label:"Primary",color:p.primary,onChange:j=>h(n.pdf,"primary",j)}),e.jsx(_,{label:"Secondary",color:p.secondary,onChange:j=>h(n.pdf,"secondary",j)}),e.jsx(_,{label:"Accent",color:p.accent,onChange:j=>h(n.pdf,"accent",j)})]})]}):e.jsxs("div",{className:"space-y-2.5",children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx("span",{className:"text-[10px] text-slate-500 font-semibold tracking-wider uppercase",children:"Warna Asal (Hue):"}),e.jsx("button",{onClick:()=>M(n),className:"text-[9px] text-indigo-400 hover:text-indigo-300 font-semibold transition-colors",children:"Buat Palet ✦"})]}),e.jsx("div",{className:"flex justify-start",children:e.jsx(_,{label:"Base Hue",color:t[n.id]||n.hue,onChange:j=>g(n.id,j)})})]}),x&&e.jsxs("p",{className:"text-xs text-rose-400 mt-2 bg-rose-950/20 p-2 rounded border border-rose-900/30",children:["⚠ ",x]})]}),e.jsxs("div",{className:"flex items-center justify-between border-t border-slate-800/60 pt-3 mt-1",onClick:j=>j.stopPropagation(),children:[e.jsx("span",{className:"text-[11px] text-slate-400",children:p?"✓ Terkomputasi":"Belum diekstrak"}),e.jsx("button",{onClick:()=>b(n),disabled:i!=="exists"||y,className:`px-3 py-1.5 text-xs font-semibold rounded transition-all duration-200 ${i!=="exists"?"bg-slate-950 text-slate-600 border border-slate-850 cursor-not-allowed":y?"bg-indigo-900/40 text-indigo-300 border border-indigo-800 cursor-wait animate-pulse":p?"bg-slate-950 text-indigo-400 border border-indigo-900/50 hover:bg-indigo-950/30 hover:border-indigo-800":"bg-indigo-600 text-white hover:bg-indigo-500"}`,children:y?e.jsxs("span",{className:"flex items-center gap-1",children:[e.jsxs("svg",{className:"animate-spin h-3.5 w-3.5 text-indigo-400",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("circle",{className:"opacity-25",cx:"12",cy:"12",r:"10",stroke:"currentColor",strokeWidth:"4"}),e.jsx("path",{className:"opacity-75",fill:"currentColor",d:"M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"})]}),"Memproses..."]}):p?"Ekstrak Ulang":"Ekstrak Warna"})]})]},n.id)})})]}),e.jsxs("div",{className:"space-y-6",children:[e.jsx("div",{className:"bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-4",children:(()=>{const n=B.find(R=>R.id===o)||B[0],i=d[n.pdf]||null,p=i?i.primary:t[n.id]||n.hue,y=i||D(p),x=te("editorial",y);return e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"border-b border-slate-800 pb-3",children:[e.jsxs("h2",{className:"text-lg font-bold text-slate-200 flex items-center gap-2",children:[e.jsx("span",{className:"text-emerald-400",children:"✦"}),"Pratinjau Kelas: ",n.name]}),e.jsx("p",{className:"text-slate-400 text-xs mt-1",children:"Simulasi tampilan warna kelas secara langsung pada kartu utama dan background flipbook."})]}),e.jsxs("div",{className:"flex flex-col items-center p-6 bg-slate-950 rounded-lg border border-slate-850 gap-3",children:[e.jsxs("div",{className:"relative w-full max-w-[220px] aspect-[4/3] overflow-hidden bg-[#fcfbfa] border border-black/5 text-[#231c15] text-left rounded shadow-md transition-all duration-300 hover:-translate-y-1 hover:scale-102 hover:shadow-lg",style:{fontFamily:"'Lora', Georgia, serif"},children:[e.jsx("div",{className:"absolute top-0 left-0 right-0 h-1.5 transition-all duration-300",style:{backgroundColor:p}}),e.jsx("div",{className:"absolute bottom-0 right-0 w-6 h-6 bg-black/5",style:{clipPath:"polygon(100% 0, 0 100%, 100% 100%)"}}),e.jsx("div",{className:"absolute left-3.5 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-[#e6dec8] shadow-inner"}),e.jsx("div",{className:"absolute top-3 right-3 text-[11px] font-serif opacity-40 font-bold",children:String(n.id).padStart(2,"0")}),e.jsxs("div",{className:"pl-9 pr-5 py-6 flex flex-col gap-1",children:[e.jsx("span",{className:"text-[9px] font-sans font-bold tracking-widest text-[#a38c74] uppercase",children:"Kelas"}),e.jsx("span",{className:"font-serif text-xl font-normal transition-all",style:{color:p},children:n.name}),e.jsx("div",{className:"w-full h-[1px] bg-gradient-to-r from-black/10 to-transparent my-2"}),e.jsx("span",{className:"text-[11px] italic text-[#a38c74] flex items-center gap-1",children:"Buka ↗"})]})]}),e.jsx("span",{className:"text-[11px] text-slate-500 font-mono",children:"Simulasi Kartu Kelas (Paper Theme)"})]}),e.jsxs("div",{className:"flex flex-col items-center p-4 bg-slate-950 rounded-lg border border-slate-850 gap-3",children:[e.jsxs("div",{className:"w-full aspect-[16/10] rounded-lg border border-slate-800 relative overflow-hidden flex items-center justify-center p-4 transition-all duration-500",style:{backgroundColor:(x==null?void 0:x["--yb-overlay-bg"])||"#05070b",boxShadow:"inset 0 0 30px rgba(0,0,0,0.8)"},children:[e.jsx("div",{className:"absolute inset-0 opacity-90 transition-all duration-500",style:{background:`linear-gradient(135deg, ${(x==null?void 0:x["--yb-overlay-bg-start"])||"#111"} 0%, ${(x==null?void 0:x["--yb-overlay-bg-mid"])||"#000"} 50%, ${(x==null?void 0:x["--yb-overlay-bg-end"])||"#0a0a0a"} 100%)`}}),e.jsx("div",{className:"absolute inset-0 transition-all duration-500",style:{background:`radial-gradient(circle at 50% 50%, ${(x==null?void 0:x["--yb-overlay-book-glow"])||"rgba(255,255,255,0.03)"} 0%, transparent 60%)`}}),e.jsx("div",{className:"absolute top-0 left-0 w-1/2 h-full pointer-events-none mix-blend-screen opacity-40 transition-all duration-500",style:{background:`radial-gradient(circle at 0% 0%, ${(x==null?void 0:x["--yb-overlay-glow-a"])||"transparent"} 0%, transparent 70%)`}}),e.jsx("div",{className:"absolute bottom-0 right-0 w-1/2 h-full pointer-events-none mix-blend-screen opacity-40 transition-all duration-500",style:{background:`radial-gradient(circle at 100% 100%, ${(x==null?void 0:x["--yb-overlay-glow-b"])||"transparent"} 0%, transparent 70%)`}}),e.jsxs("div",{className:"relative flex gap-0.5 w-[85%] aspect-[1.4] shadow-2xl z-10 transition-all duration-300",children:[e.jsxs("div",{className:"flex-1 bg-white rounded-l p-2.5 flex flex-col justify-between border-r border-slate-200/50 shadow-[inset_-6px_0_12px_rgba(0,0,0,0.05)]",style:{fontFamily:"'Lora', Georgia, serif"},children:[e.jsx("span",{className:"text-[8px] font-bold tracking-wider",style:{color:y.primary},children:n.name}),e.jsxs("div",{className:"space-y-1 my-auto",children:[e.jsx("div",{className:"w-5/6 h-1 bg-slate-100 rounded"}),e.jsx("div",{className:"w-full h-1 bg-slate-100 rounded"}),e.jsx("div",{className:"w-4/6 h-1 bg-slate-100 rounded"})]}),e.jsx("span",{className:"text-[6px] text-slate-400 font-mono",children:"2"})]}),e.jsxs("div",{className:"flex-1 bg-white rounded-r p-2.5 flex flex-col justify-between shadow-[inset_6px_0_12px_rgba(0,0,0,0.05)]",style:{fontFamily:"'Lora', Georgia, serif"},children:[e.jsx("span",{className:"text-[8px] font-bold tracking-wider text-right",style:{color:y.secondary||y.primary},children:"MEMORIES"}),e.jsxs("div",{className:"space-y-1 my-auto",children:[e.jsx("div",{className:"w-full h-1 bg-slate-100 rounded"}),e.jsx("div",{className:"w-5/6 h-1 bg-slate-100 rounded"}),e.jsx("div",{className:"w-3/4 h-1 bg-slate-100 rounded"})]}),e.jsx("span",{className:"text-[6px] text-slate-400 font-mono text-right",children:"3"})]}),e.jsx("div",{className:"absolute left-1/2 top-0 bottom-0 w-1.5 -translate-x-1/2 bg-gradient-to-r from-black/10 via-black/20 to-black/10"})]})]}),e.jsx("span",{className:"text-[11px] text-slate-500 font-mono",children:"Simulasi Gradient Background (Editorial Theme)"})]})]})})()}),e.jsxs("div",{className:"bg-indigo-950/20 border border-indigo-900/40 rounded-xl p-6 space-y-4",children:[e.jsxs("h2",{className:"text-base font-bold text-indigo-400 flex items-center gap-2",children:[e.jsx("svg",{className:"w-5 h-5 text-indigo-400",fill:"none",stroke:"currentColor",strokeWidth:"2",viewBox:"0 0 24 24",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"})}),"Cara Menggunakan"]}),e.jsxs("ol",{className:"list-decimal list-inside text-xs text-slate-400 space-y-2.5 leading-relaxed",children:[e.jsxs("li",{children:["Pastikan file PDF kelas Anda sudah ditaruh di folder ",e.jsx("code",{className:"bg-slate-900 text-indigo-300 font-mono px-1 py-0.5 rounded",children:"public/yearbook/"})," dengan nama yang tepat."]}),e.jsxs("li",{children:["Klik tombol ",e.jsx("strong",{className:"text-slate-300",children:'"Ekstrak Warna"'})," di masing-masing kartu kelas untuk memproses PDF."]}),e.jsxs("li",{children:["Setelah semua warna yang Anda inginkan terekstrak dengan benar, klik tombol ",e.jsx("strong",{className:"text-slate-300",children:'"Copy classes.js Config"'})," di kanan atas."]}),e.jsxs("li",{children:["Tempel/Paste kode baru tersebut ke dalam file proyek Anda di ",e.jsx("code",{className:"bg-slate-900 text-indigo-300 font-mono px-1 py-0.5 rounded",children:"[classes.js](file:///Users/reynonawfal/Documents/WEB/project/yb/src/data/classes.js)"})," secara menyeluruh."]}),e.jsx("li",{children:"Halaman utama Yearbook sekarang akan langsung termuat secara instan dengan warna tema yang memukau tanpa hambatan performa!"})]})]})]})]}),e.jsx("div",{className:"max-w-7xl mx-auto mt-10",children:e.jsxs("div",{className:"bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl",children:[e.jsxs("div",{className:"flex items-center justify-between bg-slate-950/80 border-b border-slate-850 px-5 py-3.5",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsxs("div",{className:"flex gap-1.5",children:[e.jsx("span",{className:"w-3 h-3 rounded-full bg-rose-500/80"}),e.jsx("span",{className:"w-3 h-3 rounded-full bg-amber-500/80"}),e.jsx("span",{className:"w-3 h-3 rounded-full bg-emerald-500/80"})]}),e.jsx("span",{className:"text-xs font-mono text-slate-400 ml-2",children:"src/data/classes.js (Pratinjau Hasil)"})]}),e.jsx("button",{onClick:F,className:"text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5",children:z?"✓ Tersalin":"Salin Kode"})]}),e.jsx("div",{className:"p-5 max-h-[300px] overflow-y-auto font-mono text-xs text-indigo-300/80 bg-slate-950/40 select-all leading-normal",children:e.jsx("pre",{children:T()})})]})})]})}ue.workerSrc=new URL("/assets/pdf.worker.min-qwK7q_zL.mjs",import.meta.url).toString();const W=520,H=740;function Me(){const a=()=>{const t=window.innerWidth,r=window.innerHeight,d=t<768?24:96,c=t<768?150:180,k=(t-d)/(W*2),u=(r-c)/H,v=Math.min(k,u);return Math.max(.3,Math.min(v,1.45))},[o,s]=l.useState(a);return l.useEffect(()=>{const t=()=>s(a());return window.addEventListener("resize",t),()=>window.removeEventListener("resize",t)},[]),o}const Se=pe.forwardRef(function({children:o,theme:s},t){const r=s==="editorial"||s==="modern"?"#ffffff":"#faf3e4";return e.jsx("div",{ref:t,style:{width:W,height:H,background:r,overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center"},children:o})}),xe=100,Ee=W/xe;function Pe({pageNumber:a,isFirst:o,onFirstRender:s}){const[t,r]=l.useState(!1),[d,c]=l.useState(!1),k=l.useCallback(()=>{r(!0),o&&(s==null||s())},[o,s]);return e.jsxs("div",{style:{width:W,height:H,position:"relative",overflow:"hidden"},children:[e.jsx("div",{style:{position:"absolute",top:0,left:0,transform:`scale(${Ee})`,transformOrigin:"top left",opacity:d?0:1,transition:"opacity 0.4s ease"},children:e.jsx(se,{pageNumber:a,width:xe,renderTextLayer:!1,renderAnnotationLayer:!1,onRenderSuccess:k})}),t&&e.jsx("div",{style:{position:"absolute",top:0,left:0,opacity:d?1:0,transition:"opacity 0.4s ease"},children:e.jsx(se,{pageNumber:a,width:W,renderTextLayer:!1,renderAnnotationLayer:!1,onRenderSuccess:()=>c(!0)})})]})}function Be({cover:a,hue:o}){const[s,t]=l.useState(!1);return e.jsxs("div",{className:"yb-book-cover-wrap",children:[e.jsx("div",{className:"yb-book-cover-placeholder",style:{background:o,opacity:s?0:1}}),a&&e.jsx("img",{src:a,alt:"",loading:"lazy",decoding:"async",className:"yb-book-cover-img",onLoad:()=>t(!0),onError:()=>t(!1)})]})}function Le({classData:a,theme:o,onClose:s,viewerThemeStyle:t}){const[r,d]=l.useState(null),[c,k]=l.useState(!1),[u,v]=l.useState(!1),[P,S]=l.useState(0),[E,z]=l.useState(!1),[m,g]=l.useState(0),[h,M]=l.useState(t),[C,b]=l.useState(t),[w,T]=l.useState(null),[F,n]=l.useState(!1),i=l.useRef(null),p=l.useRef(null),y=l.useRef(null),x=Me(),R=l.useCallback(()=>{var f;return(f=i.current)==null?void 0:f.pageFlip().flipPrev()},[]),A=l.useCallback(()=>{var f;return(f=i.current)==null?void 0:f.pageFlip().flipNext()},[]),j=l.useCallback(f=>{var N;return(N=i.current)==null?void 0:N.pageFlip().turnToPage(f)},[]),Y=l.useCallback(()=>{var N,I;const f=p.current;f&&(document.fullscreenElement?(I=document.exitFullscreen)==null||I.call(document).catch(()=>{}):(N=f.requestFullscreen)==null||N.call(f).catch(()=>{}))},[]);l.useEffect(()=>{const f=()=>n(!!document.fullscreenElement);return document.addEventListener("fullscreenchange",f),()=>document.removeEventListener("fullscreenchange",f)},[]);const J=l.useCallback(({loaded:f=0,total:N=0})=>{N&&S(Math.min(100,Math.round(f/N*100)))},[]),V=l.useCallback(({numPages:f})=>{d(f),k(!0),S(100)},[]),K=l.useCallback(f=>{z(f.message),k(!1),v(!1)},[]),ge=l.useCallback(()=>{v(!0)},[]);l.useEffect(()=>{d(null),k(!1),v(!1),S(0),z(!1),g(0),M(t),b(t),T(null)},[a.pdf]),l.useEffect(()=>{M(t)},[t]),l.useEffect(()=>()=>{y.current&&clearTimeout(y.current)},[]),l.useEffect(()=>{const f=N=>{N.key==="Escape"&&!document.fullscreenElement?s():N.key==="ArrowLeft"?R():N.key==="ArrowRight"&&A()};return window.addEventListener("keydown",f),()=>window.removeEventListener("keydown",f)},[s,R,A]),l.useEffect(()=>(document.body.style.overflow="hidden",()=>{document.body.style.overflow=""}),[]),l.useEffect(()=>{if(o!=="editorial"||!r)return;const{left:f,right:N}=Ne(m,r);let I=!1;return Promise.all([ae(a.pdf,f,a.hue),N?ae(a.pdf,N,a.hue):Promise.resolve(null)]).then(([oe,ye])=>{I||!oe||M(te(o,je(oe,ye)))}),()=>{I=!0}},[a.hue,a.pdf,m,r,o]),l.useEffect(()=>{if(!h)return;const f=JSON.stringify(C),N=JSON.stringify(h);if(!C||f===N){C||b(h);return}y.current&&clearTimeout(y.current),T(C),b(h),y.current=setTimeout(()=>{T(null)},400)},[C,h]);const $=r?Math.ceil(r/2):0,re=r?m+2>=r:!1,X=re?Math.max(0,$-1):Math.floor(m/2),fe=$?re?100:(X+1)/$*100:0,ne=!c||!u,he=4;return e.jsxs("div",{ref:p,className:`yb-overlay yb-overlay--${o}`,style:C,children:[e.jsxs("div",{className:"yb-overlay-bg-stack","aria-hidden":"true",children:[e.jsx("div",{className:"yb-overlay-bg-layer yb-overlay-bg-layer--current"}),w&&e.jsx("div",{className:"yb-overlay-bg-layer yb-overlay-bg-layer--fade",style:w}),e.jsx("div",{className:"yb-overlay-vignette"})]}),e.jsxs("div",{className:"yb-viewer-header",children:[e.jsxs("div",{className:"yb-viewer-meta",children:[e.jsx("span",{className:"yb-viewer-eyebrow",children:"Yearbook 2023–2026"}),e.jsxs("h2",{className:"yb-viewer-title",children:["Kelas ",a.name]})]}),e.jsxs("div",{className:"yb-viewer-actions",children:[r&&e.jsxs("span",{className:"yb-viewer-count",children:[e.jsx("strong",{children:String(m+1).padStart(2,"0")}),e.jsxs("span",{children:["–",Math.min(m+2,r)]}),e.jsxs("em",{children:["/ ",r]})]}),e.jsx("span",{className:"yb-action-divider","aria-hidden":"true"}),e.jsxs("button",{onClick:Y,className:"yb-action-btn","aria-label":"Layar Penuh",children:[F?e.jsx("svg",{width:"18",height:"18",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:e.jsx("path",{d:"M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3M3 16h3a2 2 0 0 1 2 2v3m13-5h-3a2 2 0 0 0-2 2v3"})}):e.jsx("svg",{width:"18",height:"18",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:e.jsx("path",{d:"M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3m13-5v3a2 2 0 0 1-2 2h-3"})}),e.jsx("span",{className:"yb-action-tooltip",children:F?"Keluar":"Layar Penuh"})]}),e.jsxs("a",{href:a.pdf,download:!0,className:"yb-action-btn","aria-label":"Unduh PDF",children:[e.jsxs("svg",{width:"18",height:"18",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:[e.jsx("path",{d:"M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"}),e.jsx("polyline",{points:"7 10 12 15 17 10"}),e.jsx("line",{x1:"12",y1:"15",x2:"12",y2:"3"})]}),e.jsx("span",{className:"yb-action-tooltip",children:"Unduh"})]}),e.jsxs("button",{onClick:s,className:"yb-action-btn yb-close-btn","aria-label":"Tutup Viewer",children:[e.jsxs("svg",{width:"22",height:"22",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.5",children:[e.jsx("line",{x1:"18",y1:"6",x2:"6",y2:"18"}),e.jsx("line",{x1:"6",y1:"6",x2:"18",y2:"18"})]}),e.jsx("span",{className:"yb-action-tooltip",children:"Tutup"})]})]})]}),e.jsxs("div",{className:"yb-book-area",children:[ne&&!E&&e.jsxs("div",{className:"yb-loading-state",children:[e.jsx("div",{className:"yb-spinner"}),e.jsx("p",{className:"yb-loading-label",children:"ini milik kita untuk selamanya"}),e.jsx("div",{className:"yb-loading-bar","aria-hidden":"true",children:e.jsx("span",{style:{width:`${Math.max(P,c?100:6)}%`}})})]}),E&&e.jsxs("div",{className:"yb-error-state",children:[e.jsx("span",{children:"✦"}),e.jsx("p",{children:"Gagal memuat PDF:"}),e.jsx("code",{children:E})]}),e.jsx(ve,{file:a.pdf,onLoadSuccess:V,onLoadProgress:J,onLoadError:K,loading:null,children:c&&!E&&r&&e.jsx("div",{className:"yb-book-shell",style:{transform:`scale(${x})`},children:e.jsx(we,{ref:i,width:W,height:H,size:"fixed",minWidth:W,maxWidth:W,minHeight:H,maxHeight:H,showCover:!0,flippingTime:780,drawShadow:!0,maxShadowOpacity:.55,showPageCorners:!0,disableFlipByClick:!1,usePortrait:!1,mobileScrollSupport:!0,onFlip:f=>g(f.data),className:"yb-flipbook",children:Array.from({length:r},(f,N)=>e.jsx(Se,{theme:o,children:Math.abs(N-m)<=he?e.jsx(Pe,{pageNumber:N+1,isFirst:N===0,onFirstRender:ge}):e.jsx("div",{style:{width:W,height:H}})},N))})})})]}),!ne&&!E&&r&&e.jsxs(e.Fragment,{children:[e.jsx("button",{onClick:R,className:"yb-nav-arrow yb-nav-prev",disabled:m<=0,"aria-label":"Halaman sebelumnya",children:e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:e.jsx("path",{d:"M15 18l-6-6 6-6"})})}),e.jsx("button",{onClick:A,className:"yb-nav-arrow yb-nav-next",disabled:m+2>=r,"aria-label":"Halaman berikutnya",children:e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:e.jsx("path",{d:"M9 18l6-6-6-6"})})}),e.jsxs("div",{className:"yb-pagination",children:[e.jsx("button",{className:"yb-page-jump",onClick:()=>j(0),disabled:X<=0,"aria-label":"Ke awal",children:e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:e.jsx("path",{d:"M11 18l-6-6 6-6M18 18l-6-6 6-6"})})}),e.jsx("span",{className:"yb-page-num",children:String(X+1).padStart(2,"0")}),e.jsx("div",{className:"yb-page-track",children:e.jsx("div",{className:"yb-page-progress",style:{width:`${fe}%`}})}),e.jsx("span",{className:"yb-page-num yb-page-num--total",children:String($).padStart(2,"0")}),e.jsx("button",{className:"yb-page-jump",onClick:()=>j(($-1)*2),disabled:X>=$-1,"aria-label":"Ke akhir",children:e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:e.jsx("path",{d:"M13 6l6 6-6 6M6 6l6 6-6 6"})})})]})]})]})}const de=[e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.5",children:e.jsx("polygon",{points:"12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"})}),e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.5",children:e.jsx("path",{d:"M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"})}),e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.5",children:[e.jsx("path",{d:"M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"}),e.jsx("line",{x1:"16",y1:"8",x2:"2",y2:"22"}),e.jsx("line",{x1:"17.5",y1:"15",x2:"9",y2:"6.5"})]}),e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.5",children:[e.jsx("path",{d:"M9 18V5l12-2v13"}),e.jsx("circle",{cx:"6",cy:"18",r:"3"}),e.jsx("circle",{cx:"18",cy:"16",r:"3"})]}),e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.5",children:e.jsx("path",{d:"M12 3v18m9-9H3m15.364-6.364l-12.728 12.728m0-12.728l12.728 12.728"})})];function Re(){const[a,o]=l.useState([]);return l.useEffect(()=>{const s=Array.from({length:25}).map((t,r)=>({id:r,iconIndex:Math.floor(Math.random()*de.length),left:Math.random()*100,size:16+Math.random()*16,duration:15+Math.random()*20,delay:Math.random()*-30,sway:(Math.random()-.5)*200,rot:(Math.random()>.5?1:-1)*(180+Math.random()*360),opacity:.15+Math.random()*.3}));o(s)},[]),e.jsx("div",{className:"yb-particles","aria-hidden":"true",children:a.map(s=>e.jsx("div",{className:"yb-particle yb-particle--icon",style:{left:`${s.left}vw`,width:`${s.size}px`,height:`${s.size}px`,"--duration":`${s.duration}s`,"--delay":`${s.delay}s`,"--sway":`${s.sway}px`,"--rot":`${s.rot}deg`,"--base-opacity":s.opacity},children:de[s.iconIndex]},s.id))})}function Ae({onEnter:a}){const[o,s]=l.useState(!1),t=()=>{s(!0),setTimeout(a,600)};return e.jsxs("div",{className:`yb-splash${o?" yb-splash--exit":""}`,children:[e.jsx("div",{className:"yb-splash-mosaic",children:B.map((r,d)=>e.jsxs("div",{className:"yb-splash-mosaic-item",style:{"--i":d},children:[e.jsx("div",{className:"yb-splash-book-spine",style:{background:r.hue}}),e.jsx("div",{className:"yb-splash-book-face",style:{background:r.hue},children:r.cover&&e.jsx("img",{src:r.cover,alt:"",loading:"lazy",decoding:"async",style:{width:"100%",height:"100%",objectFit:"cover",display:"block"},onError:c=>{c.target.style.display="none"}})})]},r.id))}),e.jsx("div",{className:"yb-splash-overlay"}),e.jsx("div",{className:"yb-splash-grain","aria-hidden":"true"}),e.jsx("div",{className:"yb-splash-frame","aria-hidden":"true"}),e.jsxs("div",{className:"yb-splash-inner",children:[e.jsx("img",{src:"/logo.png",alt:"Logo",className:"yb-splash-logo",style:{"--d":"0.1s"},onError:r=>r.target.style.display="none"}),e.jsxs("p",{className:"yb-splash-eyebrow",style:{"--d":"0.22s"},children:[e.jsx("span",{className:"yb-splash-eyebrow-rule"}),"2023 — 2026",e.jsx("span",{className:"yb-splash-eyebrow-rule"})]}),e.jsxs("h1",{className:"yb-splash-title",style:{"--d":"0.34s"},children:["Year",e.jsx("em",{children:"book"})]}),e.jsx("p",{className:"yb-splash-sub",style:{"--d":"0.5s"},children:"ini milik kita untuk selamanya"}),e.jsxs("button",{className:"yb-splash-btn yb-splash-btn--ready",style:{"--d":"0.64s"},onClick:t,children:[e.jsx("span",{children:"Buka Yearbook"}),e.jsx("span",{className:"yb-splash-btn-arrow",children:"→"})]})]})]})}function Fe(){const[a,o]=l.useState(null),[s,t]=l.useState(()=>{const b={};return B.forEach(w=>{w.palette&&(b[w.pdf]=w.palette)}),b}),[r,d]=l.useState(()=>window.location.hash==="#admin"),[c,k]=l.useState(!1),[u,v]=l.useState(!1),[P,S]=l.useState(()=>localStorage.getItem("yb-video-dismissed-v2")!=="1"),[E,z]=l.useState(()=>window.location.hash==="#admin"?"admin":"user"),m=l.useRef(null),g=()=>{m.current&&(u?m.current.pause():m.current.play().catch(b=>console.log("Audio play blocked",b)),v(!u))},h=b=>{const{clientX:w,clientY:T,currentTarget:F}=b,{left:n,top:i,width:p,height:y}=F.getBoundingClientRect(),x=(w-n)/p-.5,R=(T-i)/y-.5;F.style.setProperty("--px",x),F.style.setProperty("--py",R)};l.useEffect(()=>{const b=()=>{z(window.location.hash==="#admin"?"admin":"user")};return window.addEventListener("hashchange",b),()=>window.removeEventListener("hashchange",b)},[]);const M=()=>{window.location.hash="admin",window.location.reload()},C=()=>{window.location.hash=""};return E==="admin"?e.jsx(ze,{onBack:C}):r?e.jsxs(e.Fragment,{children:[e.jsx("style",{children:ce}),e.jsx("audio",{ref:m,src:"https://cdn.pixabay.com/download/audio/2022/01/26/audio_d0c6ff1cb8.mp3",loop:!0}),e.jsxs("div",{className:`yb-page ${c?"dark":""}`,children:[e.jsx(Re,{}),P&&e.jsx("div",{className:"yb-video-banner-overlay",children:e.jsxs("div",{className:"yb-video-banner",children:[e.jsx("button",{className:"yb-video-banner-close",onClick:()=>{S(!1),localStorage.setItem("yb-video-dismissed-v2","1")},children:"✕"}),e.jsx("div",{className:"yb-video-wrapper",children:e.jsx("iframe",{src:"https://www.youtube.com/embed/uOMjhAj8aBI?autoplay=1&mute=1&start=31",title:"YouTube video player",frameBorder:"0",allow:"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",allowFullScreen:!0})})]})}),e.jsx("div",{className:"yb-grain","aria-hidden":"true"}),e.jsx("div",{className:"yb-ruled","aria-hidden":"true"}),e.jsx("div",{className:"yb-editorial-stripe","aria-hidden":"true"}),e.jsx("nav",{className:"yb-navbar",children:e.jsxs("div",{className:"yb-navbar-inner",children:[e.jsxs("span",{className:"yb-navbar-brand",children:[e.jsx("img",{src:"/logo.png",alt:"Logo",className:"yb-navbar-logo"}),e.jsxs("span",{className:"yb-navbar-brand-text",children:["Yearbook",e.jsx("em",{children:"SMKN 2 Purwakarta · 2023"})]})]}),e.jsxs("div",{className:"yb-nav-actions",children:[e.jsxs("button",{onClick:g,className:"yb-nav-btn",title:"Putar / jeda musik","aria-label":"Putar atau jeda musik",children:[e.jsx("span",{className:"yb-nav-ico",children:u?"⏸":"▶"}),e.jsx("span",{className:"yb-nav-lbl",children:"BGM"})]}),e.jsxs("button",{onClick:()=>k(!c),className:"yb-nav-btn",title:"Ganti tema","aria-label":"Ganti tema terang / gelap",children:[e.jsx("span",{className:"yb-nav-ico",children:c?"☀️":"🌙"}),e.jsx("span",{className:"yb-nav-lbl",children:c?"Light":"Dark"})]}),e.jsx("button",{onClick:M,className:"yb-nav-btn yb-nav-btn--admin",children:"Admin"})]})]})}),e.jsxs("header",{className:"yb-hero",onMouseMove:h,children:[e.jsx("span",{className:"yb-hero-ghost","aria-hidden":"true",style:{transform:"translate(calc(-50% + var(--px, 0) * 14px), calc(-50% + var(--py, 0) * 14px))"},children:"2023"}),e.jsxs("div",{className:"yb-hero-inner",style:{transform:"translate(calc(var(--px, 0) * -20px), calc(var(--py, 0) * -20px))",transition:"transform 0.1s ease-out"},children:[e.jsx("div",{className:"yb-tape yb-tape--left","aria-hidden":"true",style:{transform:"rotate(-3deg) translate(calc(var(--px, 0) * -30px), calc(var(--py, 0) * -30px))"}}),e.jsx("div",{className:"yb-tape yb-tape--right","aria-hidden":"true",style:{transform:"rotate(4deg) translate(calc(var(--px, 0) * 30px), calc(var(--py, 0) * 30px))"}}),e.jsx("img",{src:"/logo.png",alt:"Logo 2023",className:"yb-hero-logo"}),e.jsxs("p",{className:"yb-hero-meta",children:[e.jsx("span",{children:"Vol. 01"}),e.jsx("span",{className:"yb-hero-meta-dot"}),e.jsx("span",{children:"Angkatan 2023"}),e.jsx("span",{className:"yb-hero-meta-dot"}),e.jsx("span",{children:"SMKN 2 Purwakarta"})]}),e.jsxs("h1",{className:"yb-hero-title",style:{transform:"translate(calc(var(--px, 0) * 40px), calc(var(--py, 0) * 40px))"},children:["Year",e.jsx("em",{children:"book"})]}),e.jsxs("div",{className:"yb-hero-rule","aria-hidden":"true",children:[e.jsx("span",{}),e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.4",children:e.jsx("polygon",{points:"12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"})}),e.jsx("span",{})]}),e.jsx("p",{className:"yb-hero-sub",children:"ini milik kita untuk selamanya"}),e.jsxs("a",{href:"#kelas",className:"yb-hero-scroll","aria-label":"Gulir ke daftar kelas",children:[e.jsx("span",{children:"Lihat Kelas"}),e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.6",children:e.jsx("path",{d:"M12 5v14M19 12l-7 7-7-7"})})]})]})]}),e.jsxs("section",{className:"yb-foreword",children:[e.jsx("span",{className:"yb-foreword-mark","aria-hidden":"true",children:"“"}),e.jsx("p",{className:"yb-foreword-quote",children:"Empat tahun, ribuan tawa, dan satu cerita yang kita tulis bersama. Halaman boleh menua, tapi kenangan ini milik kita untuk selamanya."}),e.jsxs("div",{className:"yb-foreword-sign",children:[e.jsx("span",{className:"yb-foreword-rule"}),e.jsx("span",{className:"yb-foreword-author",children:"Keluarga Besar Angkatan 2023"})]})]}),e.jsxs("main",{className:"yb-main",id:"kelas",children:[e.jsxs("div",{className:"yb-section-header",children:[e.jsx("span",{className:"yb-section-index",children:"01"}),e.jsxs("div",{className:"yb-section-titles",children:[e.jsx("p",{className:"yb-section-label",children:"Pilih Kelas"}),e.jsxs("p",{className:"yb-section-desc",children:[B.length," kelas · ketuk untuk membuka buku"]})]}),e.jsx("span",{className:"yb-section-line"})]}),e.jsx("div",{className:"yb-grid",children:B.map((b,w)=>e.jsx("button",{onClick:()=>o(b),onMouseEnter:()=>fetch(b.pdf,{priority:"low"}).catch(()=>{}),className:"yb-card",style:{...Ce(b,w,"paper",s),"--i":w},children:e.jsxs("div",{className:"yb-book-3d",children:[e.jsx("div",{className:"yb-book-back"}),e.jsx("div",{className:"yb-book-pages"}),e.jsxs("div",{className:"yb-book-front",children:[e.jsx(Be,{cover:b.cover,hue:b.hue}),e.jsx("div",{className:"yb-spine-shadow"}),e.jsx("div",{className:"yb-spine-highlight"}),e.jsx("div",{className:"yb-spine-crease"}),e.jsx("div",{className:"yb-spine-band"}),e.jsx("div",{className:"yb-gloss"}),e.jsxs("div",{className:"yb-book-label",children:[e.jsx("span",{className:"yb-card-name",children:b.name}),e.jsx("span",{className:"yb-card-cta",children:"↗"})]})]})]})},b.id))})]}),e.jsxs("footer",{className:"yb-footer",children:[e.jsxs("div",{className:"yb-footer-divider","aria-hidden":"true",children:[e.jsx("span",{}),e.jsx("em",{children:"fin"}),e.jsx("span",{})]}),e.jsx("img",{src:"/logo.png",alt:"",className:"yb-footer-logo",onError:b=>b.target.style.display="none"}),e.jsx("p",{className:"yb-footer-motto",children:"ini milik kita untuk selamanya"}),e.jsxs("p",{className:"yb-footer-meta",children:[e.jsx("span",{children:"SMKN 2 Purwakarta"}),e.jsx("span",{className:"yb-footer-dot"}),e.jsx("span",{children:"Yearbook Vol. 01"}),e.jsx("span",{className:"yb-footer-dot"}),e.jsx("span",{children:"2023"})]}),e.jsx("button",{onClick:M,className:"yb-footer-admin",children:"Kelola Palet Warna (Admin)"}),e.jsx("p",{className:"yb-footer-copy",children:"© 2023 · Kenangan tak pernah pudar"})]})]}),a&&e.jsx(Le,{classData:a,theme:"editorial",onClose:()=>o(null),viewerThemeStyle:te("editorial",s[a.pdf]??a.palette??D(a.hue))})]}):e.jsxs(e.Fragment,{children:[e.jsx("style",{children:ce}),e.jsx(Ae,{onEnter:()=>d(!0)})]})}const ce=`
:root {
  --yb-bg:          #f4eee1;
  --yb-bg-dk:       #e6dec8;
  --yb-bg-lt:       #fcfbfa;
  --yb-ink:         #231c15;
  --yb-ink-mid:     #5e4c3a;
  --yb-ink-faint:   #a38c74;
  --yb-accent:      #b85e45;
  --yb-accent-gold: linear-gradient(135deg, #c79a55 0%, #d8b672 30%, #a2722b 70%, #875c1c 100%);
  --yb-border:      rgba(190, 168, 140, 0.4);
  --yb-navbar-bg:   rgba(244, 238, 225, 0.85);
  --yb-page-font:   'Lora', Georgia, serif;
  --yb-title-font:  'DM Serif Display', serif;
  --yb-hand-font:   'Caveat', cursive;
  --yb-card-bg:     #fcfbfa;
  --yb-card-radius: 4px;
  --yb-card-shadow: 
    0 1px 1px rgba(0,0,0,0.02),
    0 4px 8px rgba(44,27,14,0.04),
    0 12px 24px rgba(44,27,14,0.04),
    inset 0 0 0 1px rgba(255,255,255,0.6),
    inset 0 2px 4px rgba(255,255,255,0.9);
  --yb-card-hover-shadow: 
    0 4px 12px rgba(44,27,14,0.06),
    0 24px 48px rgba(44,27,14,0.12),
    0 40px 80px rgba(44,27,14,0.1),
    inset 0 0 0 1px rgba(255,255,255,0.8),
    inset 0 2px 4px rgba(255,255,255,1);
  --yb-card-hover-rot: -1.5deg;
}

.yb-page.dark {
  --yb-bg:          #161311;
  --yb-bg-dk:       #0e0c0b;
  --yb-bg-lt:       #211c19;
  --yb-ink:         #e8e4db;
  --yb-ink-mid:     #a39b8b;
  --yb-ink-faint:   #6b6355;
  --yb-border:      rgba(255, 255, 255, 0.08);
  --yb-navbar-bg:   rgba(22, 19, 17, 0.85);
  --yb-card-bg:     #1e1a17;
  --yb-card-shadow: 
    0 4px 12px rgba(0,0,0,0.4),
    inset 0 0 0 1px rgba(255,255,255,0.05),
    inset 0 2px 4px rgba(255,255,255,0.02);
}

@keyframes fadeUpStagger {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ════════════════════════════════════════
   VIDEO BANNER
   ════════════════════════════════════════ */
.yb-video-banner-overlay {
  position: fixed; inset: 0; z-index: 99999;
  background: rgba(0,0,0,0.8);
  backdrop-filter: blur(8px);
  display: flex; align-items: center; justify-content: center;
  padding: 24px;
  animation: overlayIn 0.5s ease;
}

.yb-video-banner {
  position: relative;
  background: var(--yb-bg);
  padding: 8px;
  border-radius: 8px;
  width: 100%; max-width: 800px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.5);
  animation: fadeUpStagger 0.5s ease backwards;
}

.yb-video-banner-close {
  position: absolute; top: -16px; right: -16px;
  width: 32px; height: 32px;
  background: var(--yb-accent); color: #fff;
  border-radius: 50%; display: flex; align-items: center; justify-content: center;
  font-size: 16px; font-weight: bold; cursor: pointer;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  transition: transform 0.2s;
  z-index: 2;
}
.yb-video-banner-close:hover { transform: scale(1.1); background: #ff3333; }

.yb-video-wrapper {
  position: relative; width: 100%; padding-bottom: 56.25%;
  border-radius: 4px; overflow: hidden;
}
.yb-video-wrapper iframe {
  position: absolute; top: 0; left: 0; width: 100%; height: 100%;
}

/* ════════════════════════════════════════
   PARTICLES
   ════════════════════════════════════════ */
@keyframes fallingLeaves {
  0% { transform: translate(0, -10vh) rotate(0deg); opacity: 0; }
  10% { opacity: var(--base-opacity, 0.5); }
  90% { opacity: var(--base-opacity, 0.5); }
  100% { transform: translate(var(--sway), 110vh) rotate(var(--rot)); opacity: 0; }
}

.yb-particles {
  position: absolute; inset: 0;
  pointer-events: none; z-index: 0; overflow: hidden;
}

.yb-particle {
  position: absolute; top: -10vh;
  animation: fallingLeaves var(--duration) linear infinite;
  animation-delay: var(--delay);
  pointer-events: none;
}

.yb-particle--icon {
  background: transparent;
  color: var(--yb-ink-faint);
  display: flex; align-items: center; justify-content: center;
}
.yb-page.dark .yb-particle--icon {
  color: rgba(255,255,255,0.2);
}
.yb-particle--icon svg {
  width: 100%; height: 100%;
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
button { border: none; background: none; cursor: pointer; outline: none; }

.yb-page {
  min-height: 100vh;
  background: var(--yb-bg);
  background-image: radial-gradient(circle at 50% 0%, var(--yb-bg-lt) 0%, transparent 70%);
  color: var(--yb-ink);
  font-family: var(--yb-page-font);
  position: relative;
  overflow-x: hidden;
  transition: background 0.35s ease, color 0.35s ease;
}

.yb-navbar {
  position: sticky; top: 0; z-index: 100;
  display: flex; align-items: center; justify-content: center;
  padding: 0 32px;
  height: 68px;
  background: var(--yb-navbar-bg);
  backdrop-filter: blur(16px) saturate(140%);
  border-bottom: 1px solid var(--yb-border);
}

.yb-navbar-inner {
  display: flex; align-items: center; justify-content: space-between;
  width: 100%; max-width: 1140px; margin: 0 auto;
  gap: 12px;
}
.yb-nav-actions { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }

.yb-nav-btn {
  display: inline-flex; align-items: center; gap: 6px;
  font-family: var(--yb-page-font);
  font-size: 12.5px;
  color: var(--yb-ink-mid);
  padding: 7px 14px;
  border-radius: 20px;
  border: 1px solid var(--yb-border);
  background: rgba(255,255,255,0.25);
  transition: all 0.25s ease;
  white-space: nowrap;
}
.yb-nav-ico { font-size: 13px; line-height: 1; }
.yb-page.dark .yb-nav-btn { background: rgba(255,255,255,0.04); }
.yb-nav-btn:hover {
  background: var(--yb-ink); color: var(--yb-bg);
  border-color: var(--yb-ink);
  transform: translateY(-1px);
}

.yb-nav-btn--admin {
  background: var(--yb-accent-gold);
  color: #fff; border-color: transparent;
  box-shadow: 0 2px 10px rgba(135,92,28,0.28);
}
.yb-nav-btn--admin:hover { color: #fff; filter: brightness(1.08); }

.yb-navbar-brand {
  display: flex; align-items: center; gap: 12px;
  color: var(--yb-ink);
}
.yb-navbar-brand-text {
  display: flex; flex-direction: column; line-height: 1;
  font-family: var(--yb-title-font);
  font-size: 19px; letter-spacing: 0.01em;
}
.yb-navbar-brand-text em {
  font-family: var(--yb-page-font);
  font-style: normal; font-size: 9.5px;
  letter-spacing: 0.22em; text-transform: uppercase;
  color: var(--yb-ink-faint); margin-top: 3px;
}

.yb-navbar-logo {
  width: 36px; height: 36px;
  object-fit: contain;
  border-radius: 6px;
}
@media (max-width: 600px) {
  .yb-navbar { padding: 0 16px; height: 60px; }
  .yb-navbar-brand-text em { display: none; }
  .yb-navbar-brand { gap: 9px; }
  .yb-navbar-logo { width: 30px; height: 30px; }
  .yb-nav-actions { gap: 7px; }
  .yb-nav-btn { padding: 7px 11px; font-size: 11.5px; }
}
@media (max-width: 430px) {
  .yb-nav-lbl { display: none; } /* BGM/tema jadi icon-only */
  .yb-nav-btn { padding: 8px 9px; }
  .yb-nav-ico { font-size: 14px; }
  .yb-nav-btn--admin { padding: 7px 13px; }
  .yb-navbar-brand-text { font-size: 16px; }
}

.yb-hero-logo {
  width: 96px;
  height: 96px;
  object-fit: contain;
  margin: 0 auto 22px;
  display: block;
  animation: heroRise 0.9s cubic-bezier(0.16,1,0.3,1) 0.05s backwards;
}

.yb-hero {
  position: relative; z-index: 1;
  text-align: center;
  padding: 64px 24px 40px;
  border-bottom: 1px solid var(--yb-border);
  background: linear-gradient(180deg, rgba(255,255,255,0.45) 0%, transparent 100%);
  overflow: hidden;
}

.yb-hero-inner {
  max-width: 820px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

@keyframes heroRise {
  from { opacity: 0; transform: translateY(26px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* giant ghost year behind */
.yb-hero-ghost {
  position: absolute; top: 50%; left: 50%;
  font-family: var(--yb-title-font);
  font-size: clamp(220px, 42vw, 560px);
  font-weight: 400; line-height: 1;
  color: var(--yb-ink);
  opacity: 0.04; pointer-events: none; user-select: none;
  white-space: nowrap; z-index: 0;
  letter-spacing: -0.03em;
}
.yb-page.dark .yb-hero-ghost { opacity: 0.05; }

.yb-hero-meta {
  display: flex; align-items: center; justify-content: center;
  flex-wrap: wrap; gap: 12px;
  font-family: var(--yb-page-font);
  font-size: 11px; letter-spacing: 0.26em; text-transform: uppercase;
  color: var(--yb-ink-faint);
  margin-bottom: 18px;
  animation: heroRise 0.9s cubic-bezier(0.16,1,0.3,1) 0.18s backwards;
}
.yb-hero-meta-dot {
  width: 4px; height: 4px; border-radius: 50%;
  background: var(--yb-accent); opacity: 0.55;
}

.yb-hero::after {
  content: ''; position: absolute;
  top: 50%; left: 50%; transform: translate(-50%, -50%);
  width: 600px; height: 600px;
  background: radial-gradient(circle, rgba(255,255,255,0.8) 0%, transparent 70%);
  pointer-events: none; z-index: -1;
  opacity: 0.6;
}

.yb-tape {
  position: absolute; top: 10px;
  width: 60px; height: 24px;
  background: rgba(220,205,180,0.6);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255,255,255,0.4);
  box-shadow: 1px 2px 4px rgba(0,0,0,0.06);
}
.yb-tape--left  { left: 80px;  transform: rotate(-3deg); }
.yb-tape--right { right: 80px; transform: rotate(4deg); }

.yb-stamp-ring {
  display: inline-flex; align-items: center; justify-content: center;
  width: 76px; height: 76px; border-radius: 50%;
  border: 1.5px solid rgba(184, 94, 69, 0.4);
  box-shadow: inset 0 0 0 4px rgba(184, 94, 69, 0.05);
  margin-bottom: 24px;
  position: relative;
}
.yb-stamp-ring::before {
  content: ''; position: absolute; inset: 4px; border-radius: 50%;
  border: 1px dashed rgba(184, 94, 69, 0.3);
}
.yb-stamp-ring span {
  font-family: 'Caveat', cursive;
  font-size: 13px; letter-spacing: 0.3em;
  text-transform: uppercase;
  color: var(--yb-accent);
  transform: rotate(-12deg);
  opacity: 0.8;
}

.yb-eyebrow {
  display: flex; align-items: center; justify-content: center; gap: 16px;
  font-family: var(--yb-page-font);
  font-size: 12px; font-weight: 500;
  color: var(--yb-ink-faint);
  letter-spacing: 0.3em;
  text-transform: uppercase;
  margin-bottom: 12px;
}

.yb-eyebrow-rule {
  display: inline-block; width: 48px; height: 1px;
  background: linear-gradient(90deg, transparent, var(--yb-ink-faint), transparent);
  opacity: 0.5;
}

.yb-hero-title {
  font-family: var(--yb-title-font);
  font-size: clamp(64px, 12vw, 124px);
  font-weight: 400;
  line-height: 0.9;
  color: var(--yb-ink);
  letter-spacing: -0.01em;
  margin-bottom: 18px;
  text-shadow: 2px 4px 12px rgba(44,27,14,0.06);
  animation: heroRise 1s cubic-bezier(0.16,1,0.3,1) 0.3s backwards;
}

.yb-hero-title em {
  font-style: italic;
  background: linear-gradient(110deg, #a2722b 0%, #d8b672 30%, #fff0c8 48%, #c79a55 65%, #875c1c 100%);
  background-size: 220% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  padding-right: 0.1em;
  animation: heroFoil 6s linear infinite;
}
@keyframes heroFoil { to { background-position: 220% center; } }

.yb-hero-rule {
  display: flex; align-items: center; justify-content: center; gap: 16px;
  color: var(--yb-accent);
  margin-bottom: 18px;
  animation: heroRise 1s cubic-bezier(0.16,1,0.3,1) 0.42s backwards;
}
.yb-hero-rule span {
  width: 64px; height: 1px;
  background: linear-gradient(90deg, transparent, var(--yb-ink-faint));
  opacity: 0.6;
}
.yb-hero-rule span:last-child { transform: scaleX(-1); }
.yb-hero-rule svg { width: 16px; height: 16px; opacity: 0.7; }

.yb-hero-sub {
  font-family: var(--yb-hand-font);
  font-size: 26px;
  color: var(--yb-ink-mid);
  letter-spacing: 0.01em;
  margin-bottom: 36px;
  animation: heroRise 1s cubic-bezier(0.16,1,0.3,1) 0.54s backwards;
}

.yb-hero-scroll {
  display: inline-flex; flex-direction: column; align-items: center; gap: 8px;
  font-family: var(--yb-page-font);
  font-size: 10px; letter-spacing: 0.28em; text-transform: uppercase;
  color: var(--yb-ink-faint);
  text-decoration: none;
  transition: color 0.25s ease;
  animation: heroRise 1s cubic-bezier(0.16,1,0.3,1) 0.66s backwards;
}
.yb-hero-scroll svg {
  width: 18px; height: 18px;
  animation: scrollBob 1.8s ease-in-out infinite;
}
.yb-hero-scroll:hover { color: var(--yb-accent); }
@keyframes scrollBob {
  0%, 100% { transform: translateY(0); opacity: 0.6; }
  50%      { transform: translateY(5px); opacity: 1; }
}

/* ════════════════════════════════════════
   MAIN & SECTION LABEL
   ════════════════════════════════════════ */
.yb-foreword {
  max-width: 680px;
  margin: 0 auto;
  padding: 64px 24px 24px;
  text-align: center;
  position: relative;
}
.yb-foreword-mark {
  display: block;
  font-family: var(--yb-title-font);
  font-size: 96px; line-height: 0.4;
  color: var(--yb-accent);
  opacity: 0.25;
  margin-bottom: 8px;
}
.yb-foreword-quote {
  font-family: var(--yb-title-font);
  font-size: clamp(20px, 3vw, 28px);
  color: var(--yb-ink);
  line-height: 1.5;
  font-style: italic;
  margin-bottom: 24px;
}
.yb-foreword-sign {
  display: flex; align-items: center; justify-content: center; gap: 14px;
}
.yb-foreword-rule {
  width: 40px; height: 1px; background: var(--yb-accent); opacity: 0.5;
}
.yb-foreword-author {
  font-family: var(--yb-page-font);
  font-size: 12px; letter-spacing: 0.18em; text-transform: uppercase;
  color: var(--yb-ink-faint);
}

.yb-main {
  position: relative; z-index: 1;
  max-width: 1140px; margin: 0 auto;
  padding: 48px 32px 100px;
  scroll-margin-top: 80px;
}

.yb-section-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 44px;
}
.yb-section-index {
  font-family: var(--yb-title-font);
  font-size: 40px; line-height: 1;
  color: var(--yb-accent);
  flex-shrink: 0;
  position: relative; top: -2px;
}
.yb-section-titles { flex-shrink: 0; }
.yb-section-label {
  font-family: var(--yb-title-font);
  font-size: 28px; line-height: 1.1;
  color: var(--yb-ink);
  letter-spacing: 0.01em;
}
.yb-section-desc {
  font-family: var(--yb-page-font);
  font-size: 12.5px; letter-spacing: 0.08em;
  color: var(--yb-ink-faint);
  margin-top: 3px;
}
.yb-section-line {
  flex: 1; height: 1px;
  background: linear-gradient(90deg, var(--yb-border), transparent);
}
@media (max-width: 560px) {
  .yb-section-index { font-size: 32px; }
  .yb-section-label { font-size: 23px; }
  .yb-section-line { display: none; }
}


/* ════════════════════════════════════════
   GRID
   ════════════════════════════════════════ */
.yb-grid {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px;
}

@media (max-width: 960px) { .yb-grid { grid-template-columns: repeat(3, 1fr); } }
@media (max-width: 640px) { .yb-grid { grid-template-columns: repeat(2, 1fr); } }

/* ════════════════════════════════════════
   CARD — BOOK
   ════════════════════════════════════════ */
/* ── Card = perspective wrapper ─────────────────── */
.yb-card {
  position: relative;
  width: 100%; aspect-ratio: 3/4;
  perspective: 1000px;
  cursor: pointer;
  border: none;
  padding: 0;
  background: none;
  animation: fadeUpStagger 0.6s cubic-bezier(0.16, 1, 0.3, 1) backwards;
  animation-delay: calc(var(--i) * 0.05s);
  box-shadow:
    3px 6px 16px rgba(0,0,0,0.32),
    1px 2px 5px rgba(0,0,0,0.16);
  transition: box-shadow 0.25s ease;
}

/* ── 3D book transform ───────────────────────────── */
.yb-book-3d {
  width: 100%; height: 100%;
  position: relative;
  transform-style: preserve-3d;
  transform-origin: left center;
  transform: rotateY(-2deg);
  transition: transform 0.25s ease-out;
}

.yb-card:hover .yb-book-3d {
  transform: rotateY(-8deg) scale(1.02) translateX(-2px);
}

.yb-card:hover {
  box-shadow:
    5px 10px 28px rgba(0,0,0,0.44),
    2px 4px 8px rgba(0,0,0,0.22);
}

/* ── Book back cover ─────────────────────────────── */
.yb-book-back {
  position: absolute; inset: 0;
  background: #f0ebe0;
  border-radius: 2px 10px 10px 2px;
  transform: translateZ(-8px);
  transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
  z-index: -2;
}
.yb-page.dark .yb-book-back { background: #221e19; }
.yb-card:hover .yb-book-back { transform: translateZ(-8px) translateX(9px); }

/* ── Book page stack ─────────────────────────────── */
.yb-book-pages {
  position: absolute;
  inset: 4px 2px 4px 0;
  background: #f9f5ee;
  border: 1px solid rgba(0,0,0,0.08);
  border-radius: 2px 8px 8px 2px;
  transform: translateZ(-5px);
  box-shadow: inset 4px 0 10px rgba(0,0,0,0.05);
  transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
  z-index: -1;
  overflow: hidden;
}
.yb-book-pages::before {
  content: '';
  position: absolute; top: 0; right: 2px; bottom: 0; left: 0;
  background: repeating-linear-gradient(to right, transparent, transparent 1px, rgba(0,0,0,0.04) 2px, transparent 3px);
}
.yb-page.dark .yb-book-pages { background: #2a2520; border-color: rgba(255,255,255,0.05); }
.yb-card:hover .yb-book-pages { transform: translateZ(-5px) translateX(5px); }

/* ── Book front face ─────────────────────────────── */
.yb-book-front {
  position: absolute; inset: 0;
  border-radius: 3px 8px 8px 3px;
  overflow: hidden;
  z-index: 10;
  background: var(--hue, #5a7a9a);
}

/* ── Cover image ─────────────────────────────────── */
.yb-book-cover-wrap {
  position: absolute; inset: 0;
  overflow: hidden; z-index: 1;
}
.yb-book-cover-placeholder {
  position: absolute; inset: 0;
  z-index: 0; transition: opacity 0.4s ease;
}
.yb-book-cover-img {
  position: absolute; inset: 0;
  width: 100%; height: 100%;
  object-fit: cover; z-index: 1;
}

/* ── Spine overlays ──────────────────────────────── */
.yb-spine-shadow {
  position: absolute; top: 0; bottom: 0; left: 0; width: 22px;
  background: linear-gradient(to right, rgba(0,0,0,0.5), rgba(0,0,0,0.15), transparent);
  pointer-events: none; z-index: 2;
}
.yb-spine-highlight {
  position: absolute; top: 0; bottom: 0; left: 0; width: 2px;
  background: linear-gradient(to bottom, rgba(255,255,255,0.5), rgba(255,255,255,0.3), rgba(255,255,255,0.1));
  pointer-events: none; z-index: 3;
}
.yb-spine-crease {
  position: absolute; top: 0; bottom: 0; left: 3px; width: 1.5px;
  background: rgba(0,0,0,0.2);
  pointer-events: none; z-index: 3;
}
.yb-spine-band {
  position: absolute; top: 0; bottom: 0; left: 5px; width: 6px;
  background: linear-gradient(to right, rgba(0,0,0,0.1), transparent);
  pointer-events: none; z-index: 2;
}
.yb-gloss {
  position: absolute; inset: 0;
  background: linear-gradient(130deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05) 40%, transparent);
  pointer-events: none; z-index: 4;
}

/* ── Bottom label ────────────────────────────────── */
.yb-book-label {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  padding: 28px 12px 12px;
  background: linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.1) 70%, transparent 100%);
  z-index: 5;
  display: flex; flex-direction: row;
  align-items: flex-end; justify-content: space-between;
  transition: background 0.3s ease;
}
.yb-card:hover .yb-book-label {
  background: linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.15) 70%, transparent 100%);
}

.yb-card-name {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 15px; font-weight: 700;
  color: #ffffff; line-height: 1.2;
  letter-spacing: 0.01em;
  text-shadow: 0 1px 4px rgba(0,0,0,0.5);
}
.yb-card-cta {
  font-size: 18px;
  color: rgba(255,255,255,0.5);
  transition: color 0.3s ease, transform 0.3s ease;
  line-height: 1;
}
.yb-card:hover .yb-card-cta {
  color: rgba(255,255,255,0.95);
  transform: translateX(3px);
}

/* ════════════════════════════════════════
   FOOTER
   ════════════════════════════════════════ */
.yb-footer {
  position: relative; z-index: 1;
  display: flex; flex-direction: column; align-items: center;
  gap: 14px; padding: 56px 32px 64px;
  text-align: center;
  border-top: 1px solid var(--yb-border);
  background: linear-gradient(0deg, rgba(255,255,255,0.35) 0%, transparent 100%);
}
.yb-page.dark .yb-footer { background: linear-gradient(0deg, rgba(255,255,255,0.02) 0%, transparent 100%); }

.yb-footer-divider {
  display: flex; align-items: center; justify-content: center; gap: 14px;
  width: 100%; max-width: 220px; margin-bottom: 6px;
}
.yb-footer-divider span {
  flex: 1; height: 1px;
  background: linear-gradient(90deg, transparent, var(--yb-border));
}
.yb-footer-divider span:last-child { transform: scaleX(-1); }
.yb-footer-divider em {
  font-family: var(--yb-hand-font);
  font-style: normal; font-size: 18px;
  color: var(--yb-ink-faint); letter-spacing: 0.05em;
}

.yb-footer-logo {
  width: 48px; height: 48px; object-fit: contain;
  opacity: 0.85; margin-bottom: 2px;
}
.yb-footer-motto {
  font-family: var(--yb-title-font);
  font-size: 22px; font-style: italic;
  color: var(--yb-ink);
}
.yb-footer-meta {
  display: flex; align-items: center; justify-content: center;
  flex-wrap: wrap; gap: 12px;
  font-family: var(--yb-page-font);
  font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase;
  color: var(--yb-ink-faint);
}
.yb-footer-dot {
  width: 3px; height: 3px; border-radius: 50%;
  background: var(--yb-accent); opacity: 0.5;
}
.yb-footer-admin {
  font-family: var(--yb-page-font);
  font-size: 11px; letter-spacing: 0.05em;
  color: var(--yb-ink-faint);
  text-decoration: underline; text-underline-offset: 3px;
  opacity: 0.7; margin-top: 8px;
  transition: color 0.2s ease, opacity 0.2s ease;
}
.yb-footer-admin:hover { color: var(--yb-accent); opacity: 1; }
.yb-footer-copy {
  font-family: var(--yb-page-font);
  font-size: 11px; font-style: italic;
  color: var(--yb-ink-faint); opacity: 0.7;
  margin-top: 6px;
}

/* ════════════════════════════════════════
   EDITORIAL VIEWER OVERLAY
   ════════════════════════════════════════ */
.yb-overlay {
  position: fixed; inset: 0; z-index: 9999;
  display: flex; flex-direction: column; align-items: center;
  animation: overlayIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  overflow: hidden;
  --yb-overlay-bg: #050505;
  --yb-overlay-txt: #ffffff;
  --yb-overlay-dim: rgba(255,255,255,0.4);
  --yb-overlay-accent: #FFF001;
}

.yb-overlay::before {
  content: ''; position: absolute;
  top: 0; left: 0; right: 0; height: 5px;
  background: var(--yb-overlay-accent);
  z-index: 100;
  box-shadow: 0 0 20px var(--yb-overlay-accent);
}

.yb-overlay > *:not(.yb-overlay-bg-stack):not(.yb-viewer-header):not(.yb-nav-arrow):not(.yb-pagination) { position: relative; z-index: 1; }

.yb-overlay-bg-stack {
  position: absolute; inset: 0; z-index: 0; pointer-events: none;
  background: var(--yb-overlay-bg);
}

.yb-overlay-bg-layer {
  position: absolute; inset: 0; transition: opacity 0.4s ease;
  background: linear-gradient(135deg, var(--yb-overlay-bg-start, #111) 0%, var(--yb-overlay-bg-mid, #000) 50%, var(--yb-overlay-bg-end, #0a0a0a) 100%);
}

.yb-overlay-bg-layer::after {
  content: ''; position: absolute; inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 300 300' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E");
  opacity: 0.03; mix-blend-mode: screen;
}

.yb-overlay-bg-layer::before {
  content: ''; position: absolute; inset: 0;
  background: radial-gradient(circle at 50% 50%, var(--yb-overlay-book-glow, rgba(255,255,255,0.03)) 0%, transparent 60%);
}

.yb-overlay-bg-layer--fade { animation: overlayBgFadeOut 0.5s ease-out forwards; }

/* ── Viewer Header ───────────────────────── */
.yb-viewer-header {
  position: absolute; top: 5px; left: 0; right: 0; /* 5px = tebal garis accent overlay */
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 28px;
  z-index: 100;
  background: rgba(12, 12, 12, 0.55);
  backdrop-filter: blur(16px) saturate(140%);
  border-bottom: 1px solid rgba(255,255,255,0.1);
  box-shadow: 0 4px 24px rgba(0,0,0,0.3);
}
.yb-viewer-meta, .yb-viewer-actions { pointer-events: auto; }

.yb-viewer-meta { display: flex; flex-direction: column; gap: 2px; }

.yb-viewer-eyebrow {
  font-family: 'Archivo', sans-serif;
  font-size: 10px; font-weight: 700; letter-spacing: 0.32em;
  text-transform: uppercase;
  color: var(--yb-overlay-accent);
  opacity: 0.85;
}

.yb-viewer-title {
  font-family: var(--yb-title-font);
  font-size: 26px; font-weight: 400;
  color: #fff; letter-spacing: 0.02em;
  line-height: 1.1;
  text-shadow: 0 2px 12px rgba(0,0,0,0.5);
}

.yb-viewer-count {
  display: flex; align-items: baseline; gap: 3px;
  font-family: 'Archivo', sans-serif;
  font-size: 13px;
  color: rgba(255,255,255,0.45);
  padding: 6px 14px;
  border-radius: 20px;
  background: rgba(0,0,0,0.25);
  border: 1px solid rgba(255,255,255,0.08);
  backdrop-filter: blur(8px);
}
.yb-viewer-count strong { color: #fff; font-weight: 700; }
.yb-viewer-count em { font-style: normal; opacity: 0.7; margin-left: 2px; }

.yb-action-divider {
  width: 1px; height: 24px;
  background: rgba(255,255,255,0.12);
  margin: 0 2px;
}

.yb-viewer-actions { display: flex; align-items: center; gap: 10px; }

.yb-action-btn {
  width: 40px; height: 40px;
  display: flex; align-items: center; justify-content: center;
  border: 1px solid transparent;
  background: rgba(255,255,255,0.06);
  color: rgba(255,255,255,0.85); border-radius: 10px;
  transition: all 0.25s ease;
  position: relative;
  text-decoration: none;
}
.yb-action-btn:hover {
  background: var(--yb-overlay-accent);
  color: #000;
  transform: translateY(-1px);
}
.yb-close-btn { color: #fff; }
.yb-close-btn:hover { background: #ff4444; color: #fff; }
.yb-close-btn svg { width: 22px; height: 22px; }

.yb-action-tooltip {
  position: absolute; right: 100%; margin-right: 12px;
  background: rgba(0,0,0,0.8); color: #fff;
  padding: 6px 12px; border-radius: 4px;
  font-family: 'Archivo', sans-serif; font-size: 11px; font-weight: 600;
  letter-spacing: 0.1em; text-transform: uppercase;
  opacity: 0; pointer-events: none; transform: translateX(10px);
  transition: all 0.3s ease; white-space: nowrap;
}
.yb-action-btn:hover .yb-action-tooltip {
  opacity: 1; transform: translateX(0);
}

/* ── Book Area ───────────────────────────── */
.yb-book-area {
  flex: 1; display: flex; align-items: center; justify-content: center;
  width: 100%; position: relative; overflow: hidden;
  padding: 88px 0 92px; /* napas buat header bar + pagination */
}

.yb-book-shell {
  position: relative; display: inline-block;
  transform-origin: center center;
  will-change: transform;
  filter: drop-shadow(0 18px 36px rgba(0,0,0,0.45));
}
/* contact shadow — elips lembut di bawah buku, bikin kesan "nempel permukaan" */
.yb-book-shell::before {
  content: '';
  position: absolute; left: 50%; bottom: -34px;
  transform: translateX(-50%);
  width: 86%; height: 60px;
  background: radial-gradient(ellipse at center, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.28) 40%, transparent 72%);
  filter: blur(14px);
  pointer-events: none; z-index: -1;
}
/* center gutter seam */
.yb-book-shell::after {
  content: '';
  position: absolute; top: 0; left: 50%;
  transform: translateX(-50%);
  width: 40px; height: 100%;
  background: linear-gradient(to right,
    transparent 0%,
    rgba(0,0,0,0.14) 32%,
    rgba(0,0,0,0.3) 50%,
    rgba(0,0,0,0.14) 68%,
    transparent 100%
  );
  pointer-events: none; z-index: 10;
}

/* ── Loading ─────────────────────────────── */
.yb-loading-state {
  display: flex; flex-direction: column; align-items: center;
  gap: 20px; position: absolute; inset: 0; justify-content: center; z-index: 20;
  backdrop-filter: blur(8px);
}

.yb-spinner {
  width: 48px; height: 48px;
  border: 2px solid rgba(255,255,255,0.05);
  border-top-color: var(--yb-overlay-accent);
  border-radius: 50%;
  animation: spin 0.8s cubic-bezier(0.6, 0.2, 0.4, 0.8) infinite;
}

.yb-loading-label {
  font-family: 'Archivo', sans-serif;
  font-size: 12px; font-weight: 700; letter-spacing: 0.3em;
  text-transform: uppercase; color: rgba(255,255,255,0.6);
}

.yb-loading-bar {
  width: 240px; height: 2px;
  background: rgba(255,255,255,0.1); overflow: hidden;
}
.yb-loading-bar span {
  display: block; height: 100%;
  background: var(--yb-overlay-accent);
  box-shadow: 0 0 10px var(--yb-overlay-accent);
  transition: width 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

/* ── Error ───────────────────────────────── */
.yb-error-state {
  display: flex; flex-direction: column; align-items: center;
  gap: 16px; text-align: center; padding: 48px;
  background: rgba(20,0,0,0.4); border: 1px solid rgba(255,50,50,0.2);
  border-radius: 8px; backdrop-filter: blur(10px);
}
.yb-error-state span { font-size: 32px; color: #ff4444; }
.yb-error-state p { color: #fff; font-family: 'Archivo', sans-serif; font-size: 14px; font-weight: 600; letter-spacing: 0.05em; }
.yb-error-state code {
  background: rgba(0,0,0,0.6); color: #ff8888;
  padding: 8px 12px; border-radius: 4px;
  font-family: 'Courier New', monospace; font-size: 13px;
}

/* ── Floating Nav & Pagination ───────────── */
.yb-nav-arrow {
  position: absolute; top: 50%; transform: translateY(-50%);
  width: 56px; height: 56px; border-radius: 50%;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.12);
  color: #fff;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  z-index: 50;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.35);
}
.yb-nav-arrow svg { width: 26px; height: 26px; }
.yb-nav-arrow:hover:not(:disabled) {
  background: var(--yb-overlay-accent);
  color: #000;
  border-color: var(--yb-overlay-accent);
  transform: translateY(-50%) scale(1.1);
  box-shadow: 0 8px 30px var(--yb-overlay-accent);
}
.yb-nav-arrow:disabled {
  opacity: 0.25; cursor: default;
  pointer-events: none;
}
.yb-nav-prev { left: 40px; }
.yb-nav-next { right: 40px; }

/* ── Vignette ────────────────────────────── */
.yb-overlay-vignette {
  position: absolute; inset: 0; pointer-events: none;
  background:
    radial-gradient(ellipse 80% 70% at 50% 45%, transparent 40%, rgba(0,0,0,0.5) 100%);
  mix-blend-mode: multiply;
}

.yb-pagination {
  position: absolute; bottom: 24px; left: 50%; transform: translateX(-50%);
  display: flex; align-items: center; justify-content: center; gap: 14px;
  padding: 8px 14px; flex-shrink: 0; z-index: 50;
  width: calc(100% - 48px); max-width: 440px;
  background: rgba(0,0,0,0.3);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 30px;
  backdrop-filter: blur(12px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.3);
}
.yb-page-jump {
  width: 32px; height: 32px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  color: rgba(255,255,255,0.6);
  transition: all 0.25s ease; flex-shrink: 0;
}
.yb-page-jump svg { width: 16px; height: 16px; }
.yb-page-jump:hover:not(:disabled) { background: rgba(255,255,255,0.12); color: #fff; }
.yb-page-jump:disabled { opacity: 0.2; cursor: default; }
.yb-page-num {
  font-family: 'Archivo', sans-serif; font-size: 13px; font-weight: 700;
  color: #fff; letter-spacing: 0.1em; min-width: 22px; text-align: center;
}
.yb-page-num--total { color: rgba(255,255,255,0.45); }
.yb-page-track {
  flex: 1; height: 3px; border-radius: 3px;
  background: rgba(255,255,255,0.1);
  position: relative; overflow: hidden;
}
.yb-page-progress {
  position: absolute; top: 0; left: 0; height: 100%; border-radius: 3px;
  background: var(--yb-overlay-accent);
  box-shadow: 0 0 10px var(--yb-overlay-accent);
  transition: width 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

/* ════════════════════════════════════════
   ANIMATIONS
   ════════════════════════════════════════ */
@keyframes cardIn {
  from { opacity: 0; transform: translateY(30px) scale(0.95); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes overlayIn {
  from { opacity: 0; backdrop-filter: blur(0px); }
  to   { opacity: 1; backdrop-filter: blur(20px); }
}
@keyframes overlayBgFadeOut {
  from { opacity: 1; }
  to   { opacity: 0; }
}
@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ════════════════════════════════════════
   RESPONSIVE
   ════════════════════════════════════════ */
@media (max-width: 768px) {
  /* hero */
  .yb-hero { padding: 44px 20px 32px; }
  .yb-hero-logo { width: 76px; height: 76px; margin-bottom: 16px; }
  .yb-hero-title { font-size: clamp(48px, 13vw, 80px); }
  .yb-hero-meta { gap: 8px; font-size: 10px; letter-spacing: 0.18em; }
  .yb-hero-sub { font-size: 22px; margin-bottom: 28px; }
  .yb-hero-rule span { width: 44px; }
  /* foreword */
  .yb-foreword { padding: 44px 22px 16px; }
  .yb-foreword-quote { font-size: 19px; }
  /* main */
  .yb-main { padding: 36px 20px 72px; }
  .yb-section-header { gap: 14px; margin-bottom: 32px; }
  /* viewer */
  .yb-viewer-header { padding: 14px 16px; }
  .yb-viewer-title { font-size: 20px; }
  .yb-viewer-eyebrow { font-size: 9px; letter-spacing: 0.24em; }
  .yb-viewer-count, .yb-action-divider { display: none; }
  .yb-viewer-actions { gap: 8px; }
  .yb-action-btn { width: 38px; height: 38px; }
  .yb-close-btn { width: 44px; height: 44px; }
  .yb-nav-arrow { width: 42px; height: 42px; }
  .yb-nav-arrow svg { width: 20px; height: 20px; }
  .yb-nav-prev { left: 12px; }
  .yb-nav-next { right: 12px; }
  .yb-pagination { max-width: 320px; gap: 10px; }
  /* footer */
  .yb-footer { padding: 44px 22px 52px; }
  /* video banner */
  .yb-video-banner-overlay { padding: 16px; }
}
@media (max-width: 480px) {
  .yb-nav-arrow { display: none; }
  .yb-grid { grid-template-columns: repeat(2, 1fr); gap: 14px; }
  .yb-hero { padding: 36px 16px 28px; }
  .yb-hero-sub { font-size: 20px; }
  .yb-hero-meta { row-gap: 6px; }
  .yb-foreword-mark { font-size: 72px; }
  .yb-foreword-quote { font-size: 17px; }
  .yb-section-index { font-size: 30px; }
  .yb-section-label { font-size: 21px; }
  .yb-footer-motto { font-size: 19px; }
  .yb-footer-meta { gap: 8px; font-size: 10px; letter-spacing: 0.14em; }
  .yb-tape { display: none; }
  .yb-stamp-ring { width: 60px; height: 60px; }
  .yb-video-banner-close { top: -12px; right: -12px; width: 30px; height: 30px; }
}
@media (max-width: 360px) {
  .yb-grid { gap: 12px; }
  .yb-hero-title { font-size: 44px; }
  .yb-main { padding: 32px 14px 64px; }
}

/* ════════════════════════════════════════
   SPLASH SCREEN
   ════════════════════════════════════════ */
.yb-splash {
  position: fixed; inset: 0; z-index: 9999;
  background: #0d0a06;
  display: flex; align-items: center; justify-content: center;
  overflow: hidden;
  transition: opacity 0.7s ease, transform 0.7s cubic-bezier(0.7, 0, 0.3, 1), filter 0.7s ease;
}
.yb-splash--exit {
  opacity: 0; transform: scale(1.06); filter: blur(8px);
  pointer-events: none;
}

/* ── Cover mosaic bg — slow drift + warm desaturation ── */
.yb-splash-mosaic {
  position: absolute; inset: -2%;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(4, 1fr);
  gap: 4px;
  filter: saturate(0.85) brightness(0.9);
  animation: mosaicDrift 32s ease-in-out infinite alternate;
}
.yb-splash-mosaic-item {
  position: relative; display: flex; overflow: hidden;
  opacity: 0;
  animation: mosaicIn 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  animation-delay: calc(var(--i) * 0.045s);
}
.yb-splash-mosaic-item::after {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(135deg, rgba(200,150,70,0.12), transparent 60%);
  mix-blend-mode: overlay;
}
@keyframes mosaicIn {
  from { opacity: 0; transform: scale(1.12); filter: blur(6px); }
  to   { opacity: 1; transform: scale(1); filter: blur(0); }
}
@keyframes mosaicDrift {
  from { transform: scale(1.04) translate(-1%, -1%); }
  to   { transform: scale(1.1) translate(1%, 1%); }
}
.yb-splash-book-spine {
  width: 12%; height: 100%; flex-shrink: 0;
  filter: brightness(0.4);
}
.yb-splash-book-face {
  flex: 1; position: relative; overflow: hidden;
}

.yb-splash-overlay {
  position: absolute; inset: 0; z-index: 1; pointer-events: none;
  background:
    linear-gradient(to bottom, rgba(13,10,6,0.7) 0%, rgba(13,10,6,0.2) 32%, rgba(13,10,6,0.35) 62%, rgba(13,10,6,0.9) 100%),
    radial-gradient(ellipse 70% 65% at 50% 48%, rgba(13,10,6,0) 0%, rgba(13,10,6,0.45) 60%, rgba(13,10,6,0.92) 100%);
}

/* grain */
.yb-splash-grain {
  position: absolute; inset: 0; z-index: 1; pointer-events: none;
  opacity: 0.5; mix-blend-mode: overlay;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E");
}

/* thin gold frame inset */
.yb-splash-frame {
  position: absolute; inset: 18px; z-index: 2; pointer-events: none;
  border: 1px solid rgba(200,169,110,0.22);
  opacity: 0; animation: splashRise 1s ease 0.85s forwards;
}
.yb-splash-frame::before, .yb-splash-frame::after {
  content: ''; position: absolute; width: 14px; height: 14px;
  border: 1px solid rgba(200,169,110,0.55);
}
.yb-splash-frame::before { top: -1px; left: -1px; border-right: none; border-bottom: none; }
.yb-splash-frame::after  { bottom: -1px; right: -1px; border-left: none; border-top: none; }

.yb-splash-inner {
  position: relative; z-index: 3;
  display: flex; flex-direction: column; align-items: center;
  gap: 0; text-align: center; padding: 40px 24px;
}
.yb-splash-inner > * {
  opacity: 0;
  animation: splashRise 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  animation-delay: var(--d, 0s);
}
@keyframes splashRise {
  from { opacity: 0; transform: translateY(22px); }
  to   { opacity: 1; transform: translateY(0); }
}

.yb-splash-logo {
  width: 76px; height: 76px; object-fit: contain;
  margin-bottom: 22px;
  filter: drop-shadow(0 4px 20px rgba(0,0,0,0.7));
}
.yb-splash-eyebrow {
  display: flex; align-items: center; justify-content: center; gap: 14px;
  font-family: var(--yb-page-font);
  font-size: 11px; letter-spacing: 0.34em; text-transform: uppercase;
  color: rgba(244,238,225,0.65); margin-bottom: 14px;
  text-shadow: 0 1px 8px rgba(0,0,0,0.9);
}
.yb-splash-eyebrow-rule {
  width: 36px; height: 1px;
  background: linear-gradient(90deg, transparent, rgba(200,169,110,0.7), transparent);
}
.yb-splash-title {
  font-family: var(--yb-title-font);
  font-size: clamp(58px, 13vw, 104px);
  color: #f4eee1; line-height: 0.92; margin-bottom: 14px;
  letter-spacing: -0.01em;
  text-shadow: 0 6px 40px rgba(0,0,0,0.8);
}
.yb-splash-title em {
  font-style: italic;
  background: linear-gradient(110deg, #9a7434 0%, #e8c987 28%, #fff3d4 45%, #d4af6a 60%, #8a6526 100%);
  background-size: 220% auto;
  -webkit-background-clip: text; background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: splashFoil 5s linear infinite;
}
@keyframes splashFoil {
  to { background-position: 220% center; }
}
.yb-splash-sub {
  font-family: var(--yb-page-font);
  font-size: 14px; font-style: italic;
  color: rgba(244,238,225,0.6); margin-bottom: 42px;
  letter-spacing: 0.04em;
  text-shadow: 0 1px 8px rgba(0,0,0,0.9);
}
.yb-splash-btn {
  display: inline-flex; align-items: center; gap: 12px;
  padding: 15px 44px;
  border: 1px solid rgba(200,169,110,0.55);
  border-radius: 2px;
  background: rgba(13,10,6,0.35);
  color: #e8c987;
  font-family: var(--yb-page-font);
  font-size: 13px; letter-spacing: 0.2em; text-transform: uppercase;
  cursor: pointer;
  transition: background 0.4s ease, color 0.4s ease, border-color 0.4s ease, transform 0.4s ease, box-shadow 0.4s ease;
  backdrop-filter: blur(6px);
  position: relative; overflow: hidden;
}
.yb-splash-btn::before {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(120deg, transparent 30%, rgba(255,243,212,0.4) 50%, transparent 70%);
  transform: translateX(-120%);
  animation: splashSheen 4.5s ease-in-out 1.6s infinite;
}
@keyframes splashSheen {
  0%, 55% { transform: translateX(-120%); }
  75%, 100% { transform: translateX(120%); }
}
.yb-splash-btn-arrow { transition: transform 0.4s cubic-bezier(0.16,1,0.3,1); }
.yb-splash-btn:hover {
  background: linear-gradient(135deg, #e8c987, #c8a96e);
  color: #1a1207;
  border-color: #e8c987;
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(200,169,110,0.35);
}
.yb-splash-btn:hover .yb-splash-btn-arrow { transform: translateX(5px); }

@media (max-width: 600px) {
  .yb-splash-mosaic { grid-template-columns: repeat(3, 1fr); grid-template-rows: repeat(6, 1fr); }
  .yb-splash-frame { inset: 12px; }
}
@media (prefers-reduced-motion: reduce) {
  .yb-splash-mosaic, .yb-splash-title em, .yb-splash-btn::before { animation: none; }
}
`;Q.createRoot(document.getElementById("root")).render(e.jsx(pe.StrictMode,{children:e.jsx(Fe,{})}));
