const demoDeals = [
  {id:1,name:"SYSTEMTREFF Gaming PC – Ryzen 7, RTX 5070, 32 GB, 1 TB",store:"Amazon Marketplace",country:"DE",condition:"new",price:1399,reference:1699,shipping:29,trust:88,errorRisk:18,url:"https://www.amazon.de/",reason:"Piyasa ortalamasının belirgin altında; ekran kartı seviyesi ve 32 GB RAM bu fiyatı güçlü kılıyor."},
  {id:2,name:"VIST Gaming PC – Ryzen 7 5700X, RTX 5060 Ti, 32 GB, 1 TB",store:"Cdiscount",country:"FR",condition:"new",price:1235,reference:1499,shipping:0,trust:82,errorRisk:12,url:"https://www.cdiscount.com/",reason:"Fransa içi ücretsiz kargo ve dengeli donanım. AM4 platformu nedeniyle yükseltme payı daha sınırlı."},
  {id:3,name:"Lenovo Legion 5 – RTX 5070, 16 GB, 1 TB",store:"MediaMarkt",country:"ES",condition:"new",price:1449,reference:1799,shipping:24,trust:91,errorRisk:10,url:"https://www.mediamarkt.es/",reason:"Taşınabilir sistem isteyenler için güçlü seçenek. RAM yükseltilebilirliği kontrol edilmeli."},
  {id:4,name:"RTX 4070 Super masaüstü – Ryzen 7, 32 GB, 2 TB",store:"Kleinanzeigen",country:"DE",condition:"used",price:980,reference:1450,shipping:55,trust:68,errorRisk:44,url:"https://www.kleinanzeigen.de/",reason:"İkinci elde çok güçlü fiyat. Fatura, garanti, seri numarası ve yerinde test şart."},
  {id:5,name:"HP Omen 35L – RTX 5060 Ti 16 GB, Ryzen 7, 32 GB",store:"Bol.com",country:"NL",condition:"new",price:1299,reference:1549,shipping:18,trust:90,errorRisk:8,url:"https://www.bol.com/",reason:"16 GB VRAM yapay zekâ ve uzun vadeli kullanım için avantajlı."},
  {id:6,name:"MSI Katana 17 – RTX 5070, Core Ultra 7, 32 GB",store:"MediaWorld",country:"IT",condition:"new",price:1499,reference:1899,shipping:34,trust:89,errorRisk:15,url:"https://www.mediaworld.it/",reason:"Büyük ekran ve güçlü GPU. Kasa kalitesi ile fan sesi incelemeleri kontrol edilmeli."},
  {id:7,name:"RTX 4080 oyuncu bilgisayarı – 32 GB, 2 TB",store:"Leboncoin",country:"FR",condition:"used",price:1150,reference:1900,shipping:0,trust:62,errorRisk:58,url:"https://www.leboncoin.fr/",reason:"Olağan dışı ucuz. Elden teslim, donanım testi ve ödeme güvenliği olmadan alınmamalı."},
  {id:8,name:"Custom Gaming PC – RX 7900 XT, Ryzen 7 7800X3D, 32 GB",store:"Wallapop",country:"ES",condition:"used",price:1320,reference:1780,shipping:40,trust:70,errorRisk:35,url:"https://www.wallapop.com/",reason:"Oyun performansı çok yüksek; NVIDIA gerektiren AI işlerinde aynı avantajı sağlamaz."},
  {id:9,name:"Gaming PC – Ryzen 7 7700, RTX 5070, 32 GB, 1 TB",store:"İtopya",country:"TR",condition:"new",price:1440,reference:1715,shipping:0,trust:89,errorRisk:11,url:"https://www.itopya.com/",reason:"Türkiye mağazalarındaki örnek fırsat. Karttaki € değerleri ülkeler arası karşılaştırmayı kolaylaştırmak için normalize edilmiştir."},
  {id:10,name:"Lenovo Legion 5 – RTX 5060 Ti, 32 GB, 1 TB",store:"Hepsiburada",country:"TR",condition:"new",price:1310,reference:1575,shipping:0,trust:86,errorRisk:14,url:"https://www.hepsiburada.com/",reason:"Türkiye içi kargo avantajı olan örnek liste. Gerçek mağaza bağlantısı sonraki veri entegrasyonunda ürün sayfasına yönlendirilecektir."},
  {id:11,name:"RTX 4070 Super oyuncu bilgisayarı – 32 GB, 1 TB",store:"Sahibinden",country:"TR",condition:"used",price:1080,reference:1480,shipping:25,trust:65,errorRisk:46,url:"https://www.sahibinden.com/",reason:"İkinci el örnek ilan. Fatura, seri numarası, yerinde test ve güvenli ödeme kontrolü yapılmalı."},
];

const STORAGE = { favorites:"drp-favorites-v2", recents:"drp-recents", filters:"drp-filters", alerts:"drp-alerts" };
let activeDeals = [...demoDeals];
let liveRequestId = 0;
let currentAlertDeal = null;
const countryNames = {FR:"Fransa",DE:"Almanya",IT:"İtalya",ES:"İspanya",NL:"Hollanda",TR:"Türkiye"};
const euro = new Intl.NumberFormat("tr-FR",{style:"currency",currency:"EUR",maximumFractionDigits:0});
const $ = s => document.querySelector(s);
const els = {
  query:$("#query"), country:$("#country"), condition:$("#condition"), maxPrice:$("#maxPrice"), minDrop:$("#minDrop"), sortBy:$("#sortBy"), errorOnly:$("#errorOnly"),
  results:$("#results"), resultCount:$("#resultCount"), activeFilterText:$("#activeFilterText"), bestDrop:$("#bestDrop"), bestScore:$("#bestScore"), applyBtn:$("#applyBtn"), shareBtn:$("#shareBtn"), installBtn:$("#installBtn"),
  favoritesBtn:$("#favoritesBtn"), favoritesCount:$("#favoritesCount"), favoritesDrawer:$("#favoritesDrawer"), favoritesList:$("#favoritesList"), closeFavorites:$("#closeFavorites"), drawerBackdrop:$("#drawerBackdrop"),
  recentSearches:$("#recentSearches"), alertModal:$("#alertModal"), closeAlert:$("#closeAlert"), alertProductName:$("#alertProductName"), targetPrice:$("#targetPrice"), saveAlert:$("#saveAlert")
};
const read = (k,fallback=[]) => { try{return JSON.parse(localStorage.getItem(k)) ?? fallback}catch{return fallback} };
const write = (k,v) => localStorage.setItem(k,JSON.stringify(v));
const dealKey = d => String(d.id ?? d.url ?? `${d.store}-${d.name}`);
function calcDrop(d){ return d.reference > 0 ? Math.round((1-d.price/d.reference)*100) : 0; }
function calcScore(d){ const drop=calcDrop(d), riskPenalty=d.errorRisk>50?8:d.errorRisk>35?3:0, shippingPenalty=Math.min(d.shipping/10,5); return Math.max(1,Math.min(100,Math.round(Math.min(drop*1.25,48)+d.trust*.25+28-riskPenalty-shippingPenalty))); }
function total(d){ return Number(d.price||0)+Number(d.shipping||0); }
function formatterFor(d){ return d.currency&&d.currency!=="EUR" ? new Intl.NumberFormat("tr-FR",{style:"currency",currency:d.currency,maximumFractionDigits:0}) : euro; }

function restoreFilters(){
  const p=new URLSearchParams(location.search), saved=read(STORAGE.filters,{});
  const get=(urlKey,saveKey,def)=>p.has(urlKey)?p.get(urlKey):(saved[saveKey]??def);
  els.query.value=get("q","query",""); els.country.value=get("country","country","all"); els.condition.value=get("condition","condition","all"); els.maxPrice.value=get("max","maxPrice","1500"); els.minDrop.value=get("drop","minDrop","0"); els.sortBy.value=get("sort","sortBy","score"); els.errorOnly.checked=(p.get("errors")==="1")||(saved.errorOnly===true&&!p.has("errors"));
}
function persistFilters(){ write(STORAGE.filters,{query:els.query.value,country:els.country.value,condition:els.condition.value,maxPrice:els.maxPrice.value,minDrop:els.minDrop.value,sortBy:els.sortBy.value,errorOnly:els.errorOnly.checked}); }
function currentParams(){ const p=new URLSearchParams(); if(els.query.value.trim())p.set("q",els.query.value.trim()); if(els.country.value!=="all")p.set("country",els.country.value); if(els.condition.value!=="all")p.set("condition",els.condition.value); p.set("max",els.maxPrice.value||"1500"); p.set("drop",els.minDrop.value||"0"); p.set("sort",els.sortBy.value); if(els.errorOnly.checked)p.set("errors","1"); return p; }
function apiUrl(path){ const base=String(window.DEAL_RADAR_CONFIG?.apiBaseUrl||"").replace(/\/$/,""); return `${base}${path}`; }
function setLoading(message="Canlı fırsatlar aranıyor…"){ els.results.innerHTML=`<div class="empty">${message}</div>`; els.resultCount.textContent="Aranıyor"; els.bestDrop.textContent="—"; els.bestScore.textContent="—"; }

function addRecent(query){ query=query.trim(); if(query.length<2)return; const list=read(STORAGE.recents,[]).filter(x=>x.toLowerCase()!==query.toLowerCase()); write(STORAGE.recents,[query,...list].slice(0,10)); renderRecents(); }
function renderRecents(){ const list=read(STORAGE.recents,[]); if(!list.length){els.recentSearches.classList.add("hidden");return;} els.recentSearches.innerHTML=list.map(q=>`<button type="button" data-query="${q.replace(/"/g,'&quot;')}"><span>${q}</span><small>Tekrar ara</small></button>`).join(""); }
function showRecents(){ renderRecents(); if(read(STORAGE.recents,[]).length)els.recentSearches.classList.remove("hidden"); }

async function searchLiveDeals(){
  const query=els.query.value.trim(), country=els.country.value; addRecent(query); persistFilters();
  if(query.length<2||country==="all"||country==="TR"){ activeDeals=[...demoDeals]; applyFilters(); return; }
  const requestId=++liveRequestId; setLoading();
  try{ const response=await fetch(apiUrl(`/api/search?q=${encodeURIComponent(query)}&country=${encodeURIComponent(country)}&limit=24`)); const payload=await response.json().catch(()=>({})); if(requestId!==liveRequestId)return; if(!response.ok)throw new Error(payload.error||`HTTP_${response.status}`); activeDeals=Array.isArray(payload.items)?payload.items:[]; applyFilters(); }
  catch(error){ if(requestId!==liveRequestId)return; activeDeals=[...demoDeals]; applyFilters(); els.activeFilterText.textContent+=" • Canlı bağlantı kurulamadı, örnek veriler gösteriliyor"; console.warn(error); }
}
function applyFilters(){
  persistFilters(); const q=els.query.value.trim().toLowerCase(), max=Number(els.maxPrice.value||Infinity), minDrop=Number(els.minDrop.value||0);
  let filtered=activeDeals.filter(d=>{ const haystack=`${d.name} ${d.store} ${countryNames[d.country]||d.country}`.toLowerCase(); return(!q||haystack.includes(q))&&(els.country.value==="all"||d.country===els.country.value)&&(els.condition.value==="all"||d.condition===els.condition.value)&&total(d)<=max&&calcDrop(d)>=minDrop&&(!els.errorOnly.checked||d.errorRisk>=40); });
  filtered.sort((a,b)=>els.sortBy.value==="drop"?calcDrop(b)-calcDrop(a):els.sortBy.value==="price"?total(a)-total(b):calcScore(b)-calcScore(a)); render(filtered); history.replaceState(null,"",`${location.pathname}?${currentParams()}`);
}
function favoriteMap(){ return read(STORAGE.favorites,{}); }
function isFavorite(d){ return Boolean(favoriteMap()[dealKey(d)]); }
function toggleFavorite(d){ const map=favoriteMap(), k=dealKey(d); if(map[k])delete map[k]; else map[k]={...d,savedAt:Date.now()}; write(STORAGE.favorites,map); updateFavoriteUI(); applyFilters(); }
function updateFavoriteUI(){ const count=Object.keys(favoriteMap()).length; els.favoritesCount.textContent=count; renderFavorites(); }
function renderFavorites(){ const items=Object.values(favoriteMap()); els.favoritesList.innerHTML=items.length?items.map(d=>`<div class="favorite-item"><h4>${d.name}</h4><p>${d.store} • ${formatterFor(d).format(total(d))}</p><div class="favorite-item-actions"><button class="secondary remove-favorite" data-key="${dealKey(d)}">Çıkar</button><a class="primary" href="${d.url}" target="_blank" rel="noopener noreferrer">Ürüne git</a></div></div>`).join(""):`<div class="empty">Henüz favori eklenmedi.</div>`; }
function openFavorites(){ updateFavoriteUI(); els.favoritesDrawer.classList.add("open"); els.favoritesDrawer.setAttribute("aria-hidden","false"); els.drawerBackdrop.classList.remove("hidden"); }
function closeFavorites(){ els.favoritesDrawer.classList.remove("open"); els.favoritesDrawer.setAttribute("aria-hidden","true"); els.drawerBackdrop.classList.add("hidden"); }
function openAlert(d){ currentAlertDeal=d; const existing=read(STORAGE.alerts,{}); els.alertProductName.textContent=d.name; els.targetPrice.value=existing[dealKey(d)]?.targetPrice??Math.floor(d.price*.9); els.alertModal.classList.remove("hidden"); }
function closeAlert(){ els.alertModal.classList.add("hidden"); currentAlertDeal=null; }
function saveAlert(){ if(!currentAlertDeal)return; const targetPrice=Number(els.targetPrice.value); if(!(targetPrice>0))return; const alerts=read(STORAGE.alerts,{}); alerts[dealKey(currentAlertDeal)]={deal:currentAlertDeal,targetPrice,createdAt:Date.now()}; write(STORAGE.alerts,alerts); els.saveAlert.textContent="Kaydedildi"; setTimeout(()=>{els.saveAlert.textContent="Alarmı kaydet";closeAlert();},700); }

function render(items){
  els.results.innerHTML=""; els.resultCount.textContent=`${items.length} fırsat`; els.activeFilterText.textContent=`En fazla ${euro.format(Number(els.maxPrice.value||0))} • En az %${els.minDrop.value||0} düşüş`;
  if(!items.length){els.results.innerHTML='<div class="empty">Bu filtrelerle eşleşen fırsat bulunamadı.</div>';els.bestDrop.textContent="—";els.bestScore.textContent="—";return;}
  els.bestDrop.textContent=`%${Math.max(...items.map(calcDrop))}`; els.bestScore.textContent=`${Math.max(...items.map(calcScore))}/100`; const t=$("#cardTemplate");
  items.forEach(d=>{ const node=t.content.cloneNode(true), f=formatterFor(d); node.querySelector(".country-badge").textContent=countryNames[d.country]||d.country; node.querySelector(".condition-badge").textContent=d.condition==="new"?"Sıfır":"İkinci el"; node.querySelector(".score").textContent=`${calcScore(d)}/100`; node.querySelector(".product-name").textContent=d.name; node.querySelector(".store-name").textContent=d.store; node.querySelector(".old-price").textContent=f.format(d.reference); node.querySelector(".current-price").textContent=f.format(d.price); node.querySelector(".drop-badge").textContent=`-%${calcDrop(d)}`; node.querySelector(".shipping").textContent=d.shipping?f.format(d.shipping):"Ücretsiz"; node.querySelector(".total").textContent=f.format(total(d)); node.querySelector(".trust").textContent=`${d.trust}/100`; const signal=node.querySelector(".signal"); signal.textContent=d.errorRisk>=50?"Yüksek risk":d.errorRisk>=35?"Kontrol et":"Normal"; signal.classList.add(d.errorRisk>=50?"signal-high":"signal-good"); node.querySelector(".reason").textContent=d.reason; node.querySelector(".go-btn").href=d.url;
    const saveBtn=node.querySelector(".save-btn"); saveBtn.textContent=isFavorite(d)?"Favoriden çıkar":"Favoriye ekle"; saveBtn.addEventListener("click",()=>toggleFavorite(d)); node.querySelector(".alert-btn").addEventListener("click",()=>openAlert(d)); els.results.appendChild(node); });
}

els.applyBtn.addEventListener("click",searchLiveDeals); els.query.addEventListener("focus",showRecents); els.query.addEventListener("input",()=>{applyFilters();showRecents();}); els.query.addEventListener("keydown",e=>{if(e.key==="Enter"){els.recentSearches.classList.add("hidden");searchLiveDeals();}}); els.country.addEventListener("change",()=>els.query.value.trim().length>=2?searchLiveDeals():applyFilters()); [els.condition,els.maxPrice,els.minDrop,els.sortBy,els.errorOnly].forEach(el=>el.addEventListener("change",applyFilters));
els.recentSearches.addEventListener("click",e=>{const b=e.target.closest("button[data-query]");if(!b)return;els.query.value=b.dataset.query;els.recentSearches.classList.add("hidden");searchLiveDeals();}); document.addEventListener("click",e=>{if(!e.target.closest(".search-wrap"))els.recentSearches.classList.add("hidden");});
els.favoritesBtn.addEventListener("click",openFavorites); els.closeFavorites.addEventListener("click",closeFavorites); els.drawerBackdrop.addEventListener("click",closeFavorites); els.favoritesList.addEventListener("click",e=>{const b=e.target.closest(".remove-favorite");if(!b)return;const map=favoriteMap();delete map[b.dataset.key];write(STORAGE.favorites,map);updateFavoriteUI();applyFilters();});
els.closeAlert.addEventListener("click",closeAlert); els.alertModal.addEventListener("click",e=>{if(e.target===els.alertModal)closeAlert();}); els.saveAlert.addEventListener("click",saveAlert);
els.shareBtn.addEventListener("click",async()=>{applyFilters();try{if(navigator.share)await navigator.share({title:"Deal Radar Pro filtrem",url:location.href});else{await navigator.clipboard.writeText(location.href);els.shareBtn.textContent="Kopyalandı";setTimeout(()=>els.shareBtn.textContent="Bağlantıyı kopyala",1400);}}catch{}});
let deferredPrompt; window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferredPrompt=e;els.installBtn.classList.remove("hidden");}); els.installBtn.addEventListener("click",async()=>{if(!deferredPrompt)return;deferredPrompt.prompt();await deferredPrompt.userChoice;deferredPrompt=null;els.installBtn.classList.add("hidden");}); if("serviceWorker" in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("./service-worker.js"));
restoreFilters(); renderRecents(); updateFavoriteUI(); applyFilters();
