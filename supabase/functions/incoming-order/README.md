# Edge Function — استقبال أوردرات المتجر

## النشر

```bash
supabase functions deploy incoming-order --project-ref llrbznzcyfwylfpuuoky
```

## Secrets (في Supabase Dashboard → Edge Functions → Secrets)

| Secret | الوصف |
|--------|--------|
| `INSTANT_ORDER_API_KEY` | نفس المفتاح في `.env` للمتجر |
| `OPS_OWNER_USER_ID` | UUID حساب المدير في Supabase Auth |

`SUPABASE_URL` و `SUPABASE_SERVICE_ROLE_KEY` يُضبطان تلقائياً.

## الاستدعاء

```http
POST https://llrbznzcyfwylfpuuoky.supabase.co/functions/v1/incoming-order
Content-Type: application/json
x-order-api-key: YOUR_KEY

{ ... IncomingOrderPayload ... }
```

## ربط المتجر (veroula.shop)

في `.env` للمتجر، وجّه webhook الأوردرات إلى:

```
https://llrbznzcyfwylfpuuoky.supabase.co/functions/v1/incoming-order
```

بدل `/api/orders/incoming` المحلي.
