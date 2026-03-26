import webpush from 'web-push'
import { supabase } from '../lib/supabase.js'

webpush.setVapidDetails(
  process.env.VAPID_EMAIL,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
)

export async function checkExpiryAndNotify() {
  const today = new Date().toISOString().split('T')[0]

  // Scadenze oggi e nei prossimi 2 giorni
  const soon = new Date()
  soon.setDate(soon.getDate() + 2)
  const soonStr = soon.toISOString().split('T')[0]

  // Prodotti in scadenza
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .gte('expiry_date', today)
    .lte('expiry_date', soonStr)

  if (error) { console.error('Errore query prodotti:', error); return }
  if (!products?.length) { console.log('Nessuna scadenza imminente.'); return }

  // Raggruppa per utente
  const byUser = {}
  for (const p of products) {
    if (!byUser[p.user_id]) byUser[p.user_id] = []
    byUser[p.user_id].push(p)
  }

  for (const [userId, userProducts] of Object.entries(byUser)) {
    // Prendi le subscriptions dell'utente
    const { data: subs } = await supabase
      .from('push_subscriptions')
      .select('subscription')
      .eq('user_id', userId)

    if (!subs?.length) continue

    // Costruisci messaggio
    const todayItems = userProducts.filter(p => p.expiry_date === today)
    const soonItems = userProducts.filter(p => p.expiry_date !== today)

    let body = ''
    if (todayItems.length) body += `⚠️ Scade OGGI: ${todayItems.map(p => p.name).join(', ')}. `
    if (soonItems.length) body += `📅 In scadenza presto: ${soonItems.map(p => p.name).join(', ')}.`

    const payload = JSON.stringify({
      title: '🥫 Scadenze alimenti',
      body: body.trim(),
      url: '/'
    })

    // Invia a tutti i browser dell'utente
    for (const { subscription } of subs) {
      try {
        await webpush.sendNotification(JSON.parse(subscription), payload)
      } catch (err) {
        console.error('Errore invio push:', err.statusCode)
        // Se la subscription è scaduta, la rimuoviamo
        if (err.statusCode === 410) {
          const parsed = JSON.parse(subscription)
          await supabase.from('push_subscriptions').delete().eq('endpoint', parsed.endpoint)
        }
      }
    }

    console.log(`✅ Notifiche inviate a utente ${userId} per ${userProducts.length} prodotti`)
  }
}
