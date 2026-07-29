
const deals = [
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

const countryNames = {FR:"Fransa",DE:"Almanya",IT:"İtalya",ES:"İspanya",NL:"Hollanda",TR:"Türkiye"};
const euro = new Intl.NumberFormat("tr-FR",{style:"currency",currency:"EUR",maximumFractionDigits:0});

const els = {
  query: document.querySelector("#query"),
  country: document.querySelector("#country"),
  condition: document.querySelector("#condition"),
  maxPrice: document.querySelector("#maxPrice"),
  minDrop: document.querySelector("#minDrop"),
  sortBy: document.querySelector("#sortBy"),
  errorOnly: document.querySelector("#errorOnly"),
  results: document.querySelector("#results"),
  resultCount: document.querySelector("#resultCount"),
  activeFilterText: document.querySelector("#activeFilterText"),
  bestDrop: document.querySelector("#bestDrop"),
  bestScore: document.querySelector("#bestScore"),
  applyBtn: document.querySelector("#applyBtn"),
  shareBtn: document.querySelector("#shareBtn"),
  installBtn: document.querySelector("#installBtn")
};

function calcDrop(d){ return Math.round((1 - d.price/d.reference) * 100); }
function calcScore(d){
  const drop = calcDrop(d);
  const priceComponent = Math.min(drop * 1.25, 48);
  const trustComponent = d.trust * .25;
  const riskPenalty = d.errorRisk > 50 ? 8 : d.errorRisk > 35 ? 3 : 0;
  const shippingPenalty = Math.min(d.shipping / 10, 5);
  return Math.max(1, Math.min(100, Math.round(priceComponent + trustComponent + 28 - riskPenalty - shippingPenalty)));
}
function total(d){ return d.price + d.shipping; }

function syncFromUrl(){
  const p = new URLSearchParams(location.search);
  if(p.has("q")) els.query.value = p.get("q");
  if(p.has("country")) els.country.value = p.get("country");
  if(p.has("condition")) els.condition.value = p.get("condition");
  if(p.has("max")) els.maxPrice.value = p.get("max");
  if(p.has("drop")) els.minDrop.value = p.get("drop");
  if(p.has("sort")) els.sortBy.value = p.get("sort");
  if(p.get("errors")==="1") els.errorOnly.checked = true;
}

function currentParams(){
  const p = new URLSearchParams();
  if(els.query.value.trim()) p.set("q",els.query.value.trim());
  if(els.country.value !== "all") p.set("country",els.country.value);
  if(els.condition.value !== "all") p.set("condition",els.condition.value);
  p.set("max",els.maxPrice.value || "1500");
  p.set("drop",els.minDrop.value || "0");
  p.set("sort",els.sortBy.value);
  if(els.errorOnly.checked) p.set("errors","1");
  return p;
}

function applyFilters(){
  const q = els.query.value.trim().toLowerCase();
  const max = Number(els.maxPrice.value || Infinity);
  const minDrop = Number(els.minDrop.value || 0);

  let filtered = deals.filter(d => {
    const haystack = `${d.name} ${d.store} ${countryNames[d.country]}`.toLowerCase();
    return (!q || haystack.includes(q))
      && (els.country.value==="all" || d.country===els.country.value)
      && (els.condition.value==="all" || d.condition===els.condition.value)
      && total(d) <= max
      && calcDrop(d) >= minDrop
      && (!els.errorOnly.checked || d.errorRisk >= 40);
  });

  filtered.sort((a,b)=>{
    if(els.sortBy.value==="drop") return calcDrop(b)-calcDrop(a);
    if(els.sortBy.value==="price") return total(a)-total(b);
    return calcScore(b)-calcScore(a);
  });

  render(filtered);
  history.replaceState(null,"",`${location.pathname}?${currentParams().toString()}`);
}

function render(items){
  els.results.innerHTML = "";
  els.resultCount.textContent = `${items.length} fırsat`;
  els.activeFilterText.textContent = `En fazla ${euro.format(Number(els.maxPrice.value || 0))} • En az %${els.minDrop.value || 0} düşüş`;

  if(!items.length){
    els.results.innerHTML = `<div class="empty">Bu filtrelerle eşleşen fırsat bulunamadı.</div>`;
    els.bestDrop.textContent = "—";
    els.bestScore.textContent = "—";
    return;
  }

  els.bestDrop.textContent = `%${Math.max(...items.map(calcDrop))}`;
  els.bestScore.textContent = `${Math.max(...items.map(calcScore))}/100`;

  const t = document.querySelector("#cardTemplate");
  items.forEach(d=>{
    const node = t.content.cloneNode(true);
    node.querySelector(".country-badge").textContent = countryNames[d.country];
    node.querySelector(".condition-badge").textContent = d.condition==="new" ? "Sıfır" : "İkinci el";
    node.querySelector(".score").textContent = `${calcScore(d)}/100`;
    node.querySelector(".product-name").textContent = d.name;
    node.querySelector(".store-name").textContent = d.store;
    node.querySelector(".old-price").textContent = euro.format(d.reference);
    node.querySelector(".current-price").textContent = euro.format(d.price);
    node.querySelector(".drop-badge").textContent = `-%${calcDrop(d)}`;
    node.querySelector(".shipping").textContent = d.shipping ? euro.format(d.shipping) : "Ücretsiz";
    node.querySelector(".total").textContent = euro.format(total(d));
    node.querySelector(".trust").textContent = `${d.trust}/100`;
    const signal = node.querySelector(".signal");
    signal.textContent = d.errorRisk >= 50 ? "Yüksek risk" : d.errorRisk >= 35 ? "Kontrol et" : "Normal";
    signal.classList.add(d.errorRisk >= 50 ? "signal-high" : "signal-good");
    node.querySelector(".reason").textContent = d.reason;
    node.querySelector(".go-btn").href = d.url;

    const saveBtn = node.querySelector(".save-btn");
    const saved = JSON.parse(localStorage.getItem("drp-saved") || "[]");
    if(saved.includes(d.id)) saveBtn.textContent = "Kaydedildi";
    saveBtn.addEventListener("click", ()=>{
      const arr = JSON.parse(localStorage.getItem("drp-saved") || "[]");
      const next = arr.includes(d.id) ? arr.filter(x=>x!==d.id) : [...arr,d.id];
      localStorage.setItem("drp-saved",JSON.stringify(next));
      saveBtn.textContent = next.includes(d.id) ? "Kaydedildi" : "Kaydet";
    });

    els.results.appendChild(node);
  });
}

els.applyBtn.addEventListener("click", applyFilters);
[els.query,els.country,els.condition,els.maxPrice,els.minDrop,els.sortBy,els.errorOnly]
  .forEach(el=>el.addEventListener(el.tagName==="INPUT" && el.type==="search" ? "input":"change", applyFilters));

els.shareBtn.addEventListener("click", async ()=>{
  applyFilters();
  const url = location.href;
  try{
    if(navigator.share) await navigator.share({title:"Deal Radar Pro filtrem",url});
    else{
      await navigator.clipboard.writeText(url);
      els.shareBtn.textContent = "Kopyalandı";
      setTimeout(()=>els.shareBtn.textContent="Bağlantıyı kopyala",1400);
    }
  }catch{}
});

let deferredPrompt;
window.addEventListener("beforeinstallprompt",e=>{
  e.preventDefault();
  deferredPrompt = e;
  els.installBtn.classList.remove("hidden");
});
els.installBtn.addEventListener("click",async()=>{
  if(!deferredPrompt) return;
  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  deferredPrompt = null;
  els.installBtn.classList.add("hidden");
});

if("serviceWorker" in navigator){
  window.addEventListener("load",()=>navigator.serviceWorker.register("./service-worker.js"));
}

syncFromUrl();
applyFilters();
