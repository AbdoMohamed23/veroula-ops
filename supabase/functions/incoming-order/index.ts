import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-order-api-key',
}

interface IncomingOrderItem {
  catalog_id?: string | null
  name: string
  quantity: number
  unit_price?: number
  line_total?: number
}

interface IncomingOrderPayload {
  external_order_id: string
  source?: string
  customer: {
    name: string
    phone: string
    alternative_phone?: string | null
    governorate?: string
    address: string
  }
  note?: string | null
  items: IncomingOrderItem[]
  totals: { subtotal: number }
  placed_at?: string
}

function resolveCatalogId(raw: string | null | undefined): string | null {
  if (raw == null || raw === '') return null
  const id = String(raw)
  if (/^\d+$/.test(id)) return null
  return id
}

function parsePayload(body: unknown): IncomingOrderPayload {
  if (!body || typeof body !== 'object') throw new Error('بيانات الطلب غير صالحة')
  const data = body as Record<string, unknown>
  if (!data.external_order_id || typeof data.external_order_id !== 'string') {
    throw new Error('external_order_id مطلوب')
  }
  const customer = data.customer as Record<string, unknown> | undefined
  if (!customer?.name || typeof customer.name !== 'string') throw new Error('اسم العميل مطلوب')
  if (!customer.phone || typeof customer.phone !== 'string') throw new Error('رقم هاتف العميل مطلوب')
  const items = data.items
  if (!Array.isArray(items) || items.length === 0) throw new Error('يجب أن يحتوي الطلب على منتج واحد على الأقل')
  const totals = data.totals as Record<string, unknown> | undefined
  const subtotal = Number(totals?.subtotal)
  if (!Number.isFinite(subtotal) || subtotal <= 0) throw new Error('إجمالي الطلب غير صالح')
  return data as unknown as IncomingOrderPayload
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ success: false, error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  try {
    const expectedKey = Deno.env.get('INSTANT_ORDER_API_KEY')
    const providedKey = req.headers.get('x-order-api-key')
    if (!expectedKey || providedKey !== expectedKey) {
      return new Response(JSON.stringify({ success: false, error: 'مفتاح API غير صالح' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const ownerUserId = Deno.env.get('OPS_OWNER_USER_ID')
    if (!ownerUserId) {
      return new Response(JSON.stringify({ success: false, error: 'OPS_OWNER_USER_ID غير مضبوط' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const payload = parsePayload(await req.json())

    const { data: existing } = await supabase
      .from('ops_orders')
      .select('id, external_order_id')
      .eq('external_order_id', payload.external_order_id)
      .maybeSingle()

    if (existing) {
      return new Response(
        JSON.stringify({ success: true, orderId: existing.id, external_order_id: existing.external_order_id, created: false }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const subtotal = Number(payload.totals.subtotal)
    const enrichedItems: Record<string, unknown>[] = []

    for (const item of payload.items) {
      const catalogId = resolveCatalogId(item.catalog_id)
      if (!catalogId) {
        enrichedItems.push({ ...item, catalog_id: null, from_catalog: false })
        continue
      }

      const { data: product } = await supabase
        .from('ops_products')
        .select('id, name, stock')
        .eq('id', catalogId)
        .eq('user_id', ownerUserId)
        .maybeSingle()

      const qty = Number(item.quantity) || 1
      if (product && product.stock < qty) {
        return new Response(
          JSON.stringify({ success: false, error: `المخزون غير كافٍ للمنتج "${item.name}" (المتاح: ${product.stock})` }),
          { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        )
      }

      enrichedItems.push({
        ...item,
        catalog_id: catalogId,
        from_catalog: !!product,
        catalog_name: product?.name ?? item.name,
        catalog_stock_at_order: product?.stock ?? null,
      })
    }

    for (const item of enrichedItems) {
      if (!item.from_catalog || !item.catalog_id) continue
      const qty = Number(item.quantity) || 1
      const catalogId = item.catalog_id as string
      const { data: product } = await supabase
        .from('ops_products')
        .select('stock')
        .eq('id', catalogId)
        .single()
      if (product) {
        await supabase.from('ops_products').update({ stock: product.stock - qty }).eq('id', catalogId)
      }
    }

    const governorate = payload.customer.governorate || ''
    const addressDetail = payload.customer.address || ''
    const fullAddress = governorate ? `${governorate} — ${addressDetail}` : addressDetail
    const firstCatalogId =
      enrichedItems.find((i) => i.catalog_id && i.from_catalog)?.catalog_id as string | null ?? null

    const customerMeta = JSON.stringify({
      alternative_phone: payload.customer.alternative_phone ?? null,
      governorate,
      address_detail: addressDetail,
    })

    const { data: order, error } = await supabase
      .from('ops_orders')
      .insert({
        user_id: ownerUserId,
        external_order_id: payload.external_order_id,
        source: payload.source || 'veroula_store',
        order_items: JSON.stringify(enrichedItems),
        website_note: payload.note || null,
        governorate,
        external_placed_at: payload.placed_at ? new Date(payload.placed_at).toISOString() : new Date().toISOString(),
        customer_meta: customerMeta,
        client_name: payload.customer.name.trim(),
        client_phone: payload.customer.phone.trim(),
        address: fullAddress,
        total_price: subtotal,
        deposit: 0,
        remaining: subtotal,
        net_profit: subtotal,
        status: 'pending',
        is_urgent: false,
        product_id: firstCatalogId,
        images: '[]',
      })
      .select('id, external_order_id')
      .single()

    if (error) throw new Error(error.message)

    const itemsSummary = payload.items.map((i) => `${i.name} ×${i.quantity}`).join('، ')
    await supabase.from('ops_activities').insert({
      user_id: ownerUserId,
      type: 'incoming_order_received',
      message: `طلب جديد من المتجر — ${payload.customer.name} — ${itemsSummary} — ${subtotal.toLocaleString('ar-EG')} ج.م`,
    })

    return new Response(
      JSON.stringify({ success: true, orderId: order.id, external_order_id: order.external_order_id, created: true }),
      { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'حدث خطأ'
    const isStock = message.includes('المخزون')
    const isValidation = message.includes('مطلوب') || message.includes('غير صالح') || message.includes('يجب')
    return new Response(JSON.stringify({ success: false, error: message }), {
      status: isStock ? 409 : isValidation ? 400 : 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
