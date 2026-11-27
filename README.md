# bt_app_lab_2

Expo (React Native) ve Supabase ile geliştirilmiş; **görev yönetimi (To-Do)**, **Pomodoro zamanlayıcısı**, **hesap makinesi** ve **kullanıcı profili / bulut senkronizasyonu** özelliklerini minimalist bir arayüzde sunan mobil uygulama.

---

## Özellikler

- **Görev Yönetimi (To-Do):**
  - Yeni görev ekleme, tamamlama durumunu değiştirme ve görev silme
  - Tümü / Aktif / Tamamlanan sekmeleriyle filtreleme
  - Dokunsal geri bildirim (`expo-haptics`) desteği
- **Pomodoro Zamanlayıcı:**
  - Üç aşamalı zamanlayıcı: **Odak** (25 dk), **Kısa Mola** (5 dk) ve **Uzun Mola** (15 dk)
  - Başlatma, duraklatma, sıfırlama ve aşama atlama kontrolleri
  - Tamamlanan oturumların yerel ve uzak veritabanına kaydedilmesi
- **Hesap Makinesi:**
  - Dört temel işlem (`+`, `-`, `×`, `÷`), yüzde (`%`), işaret değiştirme (`±`), ondalık nokta ve geri silme
  - İşlem geçmişi önizlemesi, sıfıra bölme koruması (`Hata`) ve dokunsal geri bildirim
  - Açık/koyu tema uyumlu `tabular-nums` minimalist tuş takımı
- **Kimlik Doğrulama ve Profil:**
  - Supabase Auth ile giriş yapma ve kayıt olma (`src/app/auth.tsx`)
  - Kullanıcı profili ve günlük Pomodoro hedefi (`daily_pomodoro_goal`) yönetimi
- **Çevrimdışı Destek ve Senkronizasyon:**
  - `@react-native-async-storage/async-storage` ile yerel depolama
  - Oturum açıldığında Supabase (`todos`, `pomodoro_sessions`, `profiles`) ile senkronizasyon

---

## Kullanılan Teknolojiler

| Kategori | Teknoloji |
| :--- | :--- |
| **Çatı / Platform** | [Expo](https://expo.dev/) (`~58.1.0`), [React Native](https://reactnative.dev/) (`0.88.1`), React (`19.3.0`) |
| **Navigasyon** | [Expo Router](https://docs.expo.dev/router/introduction/) (`~58.0.33`) |
| **Dil** | TypeScript (`~6.0.3`) |
| **Backend & Auth** | [Supabase](https://supabase.com/) (`@supabase/supabase-js`) |
| **Yerel Depolama** | `@react-native-async-storage/async-storage` |
| **Test** | Jest (`~30.5.2`), `jest-expo`, `@testing-library/react-native` |
| **Kod Kalitesi** | ESLint (`^9.0.0`), `eslint-config-expo` |

---

## Proje Yapısı

```text
bt_app_lab_2/
├── assets/                  # Uygulama ikonları ve görseller
├── src/
│   ├── app/                 # Expo Router ekran ve layout tanımları
│   │   ├── (tabs)/          # Sekme navigasyonu (index, pomodoro, calculator, profile)
│   │   ├── _layout.tsx      # Kök layout
│   │   └── auth.tsx         # Giriş / Kayıt ekranı
│   ├── components/          # Yeniden kullanılabilir UI bileşenleri
│   ├── context/             # AuthContext (oturum yönetimi)
│   ├── hooks/               # useTodos, usePomodoro özel hook'ları
│   ├── lib/                 # Supabase istemci yapılandırması
│   ├── screens/             # Ekran bileşenleri (Home, Pomodoro, Calculator, Profile, Auth)
│   ├── storage/             # Yerel (AsyncStorage) ve uzak (Supabase) veri katmanı
│   ├── theme/               # Tasarım token'ları (renkler, boşluklar, tipografi)
│   ├── types/               # TypeScript tipleri (database, todo, pomodoro)
│   ├── utils/               # Yardımcı fonksiyonlar (calculator, haptics, uuid)
│   └── __tests__/           # Birim ve bileşen testleri
├── .env.example             # Örnek ortam değişkenleri
├── app.json                 # Expo yapılandırması
├── eslint.config.js         # ESLint yapılandırması
├── jest.setup.ts            # Jest kurulum dosyası
└── package.json
```

---

## Kurulum ve Çalıştırma

### 1. Bağımlılıkları Yükleyin

```bash
npm install
```

### 2. Ortam Değişkenlerini Ayarlayın

`.env.example` dosyasını kopyalayarak `.env` dosyası oluşturun ve kendi Supabase proje bilgilerinizi girin:

```bash
cp .env.example .env
```

`.env` içeriği:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_key
```

> **Not:** `.env` dosyası `.gitignore` içinde yer alır ve repoya gönderilmez.

### 3. Uygulamayı Başlatın

```bash
# Expo geliştirme sunucusunu başlatır
npm start

# Doğrudan platform seçerek başlatmak için:
npm run android
npm run ios
npm run web
```

---

## Test ve Kalite Kontrolleri

```bash
# Testleri çalıştır
npm test

# TypeScript tip kontrolü
npm run typecheck

# ESLint kontrolü
npm run lint
```

---

## Supabase Veritabanı Tabloları

Uygulama `public` şeması altında aşağıdaki tabloları kullanır (tip tanımları [`src/types/database.ts`](src/types/database.ts) dosyasındadır):

- `profiles`: Kullanıcı profil bilgileri (`id`, `username`, `full_name`, `daily_pomodoro_goal`, `created_at`, `updated_at`)
- `todos`: Görevler (`id`, `user_id`, `title`, `completed`, `created_at`, `updated_at`)
- `pomodoro_sessions`: Tamamlanan Pomodoro oturumları (`id`, `user_id`, `phase`, `duration_seconds`, `session_date`, `completed_at`)

---

## Lisans

Bu proje [MIT Lisansı](LICENSE) ile lisanslanmıştır.
