# DENLIFE

Denizli için siyah + yeşil temalı şehir yaşam rehberi. Marka birleşik yazılır: **DEN** beyaz + **LIFE** yeşil.

## Hazır özellikler
- Bugün / Yarın / Hafta Sonu / Bu Hafta etkinlik filtreleri
- Etkinlik kategorileri ve detay sayfaları
- PAÜ ve Denizli Büyükşehir etkinlik importer'ları
- Mekan rehberi: restoran, kafe, gezi, tarih, park, spor, otel, alışveriş
- Mekan arama, kategori ve ilçe filtreleri
- Mekan detayları ve rota butonları
- Etkinlik + mekan genel araması
- DENLIFE içinde kalan ulaşım sayfası
- Resmi veri kaynakları sayfası
- Gizlilik ve hakkında sayfaları
- SEO robots, sitemap ve web manifest
- Vercel cron otomasyonu
- OpenStreetMap zenginleştirmesi hata verse bile çalışan yerleşik başlangıç verileri

## Kurulum
Önce `README_FIRST.txt` dosyasını okuyun.

### Kısa yol
1. `.env.local` dosyanızı proje köküne koyun.
2. Supabase'te `supabase/setup.sql` dosyasını bir kez çalıştırın.
3. `INSTALL_DENLIFE.bat` çalıştırın.
4. `START_DENLIFE.bat` çalıştırın.

## Environment Variables
`.env.example` örnek dosyadır. Secret değerleri GitHub'a yüklemeyin.

## Otomasyon
- `/api/import/all`: yerleşik mekanları senkronlar, PAÜ ve Denizli Büyükşehir etkinliklerini günceller.
- `/api/import/places`: OpenStreetMap ile best-effort mekan zenginleştirmesi yapar. 429/504 durumunda sitenin çalışmasını bozmaz.
- Production endpointleri `CRON_SECRET` ile korunur.

## Sayfalar
`/`, `/etkinlikler`, `/etkinlik/[slug]`, `/mekanlar`, `/mekan/[slug]`, `/arama`, `/ulasim`, `/kaynaklar`, `/hakkinda`, `/gizlilik`
