# إعداد Supabase — veroula-ops

## أنت في الصفحة الغلط؟

الصورة اللي بعتها = **Authentication → Emails** (قوالب البريد).

**مش محتاجها دلوقتي.** محتاج:

### 1) تفعيل تسجيل الدخول بالإيميل

1. من القائمة اليسار: **Authentication**
2. تحت **CONFIGURATION** اضغط **Sign In / Providers** ← مش Emails
3. افتح **Email**
4. فعّل **Enable Email provider**
5. للتجربة: **اقفل** خيار **Confirm email** (عشان تدخل من غير تأكيد بريد)
6. **Save**

### 2) تشغيل SQL للجداول

1. **SQL Editor** (من القائمة اليسار)
2. New query
3. انسخ محتوى [`supabase/migrations/001_initial.sql`](./migrations/001_initial.sql)
4. **Run**

### 3) إنشاء أول مستخدم

**Authentication → Users → Add user → Create new user**

- Email: إيميلك
- Password: كلمة سر
- ✅ Auto Confirm User (مهم لو Confirm email مقفول)

### 4) `.env` (عملته ✅)

```env
VITE_SUPABASE_URL=https://llrbznzcyfwylfpuuoky.supabase.co
VITE_SUPABASE_ANON_KEY=...
```

### 5) تشغيل التطبيق

```bash
npm run dev
```

افتح `/login` وسجّل دخول بالإيميل وكلمة السر.

---

## Emails / SMTP — متى تحتاجها؟

صفحة **Emails** اللي ظهرتلك = تخصيص شكل رسائل التأكيد وإعادة تعيين كلمة السر.

- **مش مطلوبة** لو **Confirm email** مقفول
- **مطلوبة** لو عايز المستخدم يأكد الإيميل أو تستخدم SMTP مخصص
