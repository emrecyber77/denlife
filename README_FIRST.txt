DENLIFE - HAZIR KURULUM
=======================

1) Eski çalışan projenizdeki .env.local dosyasını bu klasörün içine kopyalayın.
   Dosyada şu 4 değer olmalı:
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   SUPABASE_SECRET_KEY
   CRON_SECRET

2) Supabase Dashboard > SQL Editor > New Query açın.
   Bu klasördeki supabase/setup.sql dosyasının TAMAMINI yapıştırıp Run'a basın.
   Bu SQL mevcut verileri silmez; eksikleri tamamlar ve başlangıç mekanlarını ekler.

3) İlk kurulumda INSTALL_DENLIFE.bat dosyasına çift tıklayın.

4) Bundan sonra siteyi açmak için START_DENLIFE.bat dosyasına çift tıklamanız yeterli.
   Adres: http://localhost:3000

5) Yerelde etkinlikleri ve yerleşik mekanları tek seferde senkronlamak için:
   http://localhost:3000/api/import/all

6) Canlı yayın:
   GitHub'a push edin. Vercel mevcut projeyi otomatik deploy eder.
   Vercel Environment Variables bölümünde yukarıdaki 4 değer bulunmalıdır.

NOTLAR
- Ulaşım menüsü belediye sitesine gitmez; /ulasim sayfasında DENLIFE içinde kalır.
- Harita yalnızca kullanıcı rota/harita butonuna basarsa dışarı açılır.
- OpenStreetMap geçici 429/504 verirse site çalışmaya devam eder. Mekan başlangıç verileri Supabase SQL ve /api/import/all ile hazırdır.
- DENLIFE markası birleşik yazılır: DEN beyaz, LIFE yeşil.
