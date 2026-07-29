# Deal Radar Pro

Mevcut tasarımı değiştirmeden çalışan fırsat arama uygulaması.

## Canlı veri entegrasyonu

Bu sürümde `/api/search` sunucusuz uç noktası eBay Browse API üzerinden Fransa, Almanya, İtalya, İspanya ve Hollanda için canlı ürün araması yapar.

Gerekli Vercel ortam değişkenleri:

- `EBAY_CLIENT_ID`
- `EBAY_CLIENT_SECRET`

GitHub Pages ön yüzü kullanılacaksa `config.js` içindeki `apiBaseUrl` alanına Vercel adresi yazılır. Tüm depo Vercel'de yayınlanırsa alan boş kalabilir.

Türkiye verileri, Türkiye mağazası için izinli API/affiliate erişimi bağlanana kadar mevcut örnek veriyle çalışır.
