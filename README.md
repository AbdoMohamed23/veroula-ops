# OPS — نظام إدارة الأوردرات

واجهة PWA منفصلة (Vite + React) على Supabase.

## التشغيل محلياً

```bash
npm install
npm run dev
```

## Supabase

```env
VITE_SUPABASE_URL=https://llrbznzcyfwylfpuuoky.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## PWA

- اسم التطبيق: **OPS**
- أيقونة: **$** أبيض على خلفية **#000**
- PNG لدعم iOS/Android (`npm run icons`)

## النطاق

- **لا إشعارات Web Push** — غير مدعومة في هذا النظام.
- **لا webhook أوردرات** — الربط المستقبلي مع أنظمة أخرى للكتالوج فقط (تصدير/مزامنة المنتجات).

## النشر

Vercel — Framework: Vite — Output: `dist`
