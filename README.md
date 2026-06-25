# OPS — نظام إدارة الأوردرات

واجهة PWA منفصلة (Vite + React).

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
- أيقونة: **$** (أسود)
- تثبيت من المتصفح على الموبايل

## Edge Function (webhook المتجر)

راجع `supabase/functions/incoming-order/README.md`

## النشر

Vercel — Framework: Vite — Output: `dist`
