import { supabase } from '../lib/supabase'
import { markPaymentDone } from './matchService'

const RAZORPAY_KEY_ID = process.env.REACT_APP_RAZORPAY_KEY_ID
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY
const IS_PRODUCTION = process.env.REACT_APP_ENV === 'production'

// ── GET FRESH AUTH HEADERS ──
const getAuthHeaders = async () => {
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error || !session) throw new Error('Not logged in. Please sign in again.')
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session.access_token}`,
    'apikey': SUPABASE_ANON_KEY
  }
}

// ── LOAD RAZORPAY SCRIPT ──
export const loadRazorpay = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return }
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

// ── CREATE RAZORPAY ORDER ──
export const createRazorpayOrder = async (amount, bookingId, role) => {
  const headers = await getAuthHeaders()

  const response = await fetch(
    `${SUPABASE_URL}/functions/v1/create-razorpay-order`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify({ amount, currency: 'INR', bookingId, role })
    }
  )

  const data = await response.json()
  if (!response.ok) {
    console.error('Edge function error:', data)
    throw new Error(data.error || `Order creation failed (${response.status})`)
  }
  return data.order
}

// ── VERIFY PAYMENT SIGNATURE ──
export const verifyPayment = async (razorpay_order_id, razorpay_payment_id, razorpay_signature) => {
  const headers = await getAuthHeaders()

  const response = await fetch(
    `${SUPABASE_URL}/functions/v1/verify-payment`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify({
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
      })
    }
  )

  const data = await response.json()
  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Payment verification failed')
  }
  return true
}

// ── INITIATE PAYMENT ──
export const initiatePayment = async ({
  bookingId,
  amount,
  role,
  userName,
  userEmail,
  onSuccess,
  onFailure
}) => {
  // Step 1 — Load Razorpay script
  const loaded = await loadRazorpay()
  if (!loaded) {
    alert('Razorpay failed to load. Check your internet connection.')
    return
  }

  // Step 2 — Create order via edge function (JWT protected)
  const order = await createRazorpayOrder(amount, bookingId, role)

  // Step 3 — Save order id to booking
  const orderField = role === 'challenger'
    ? 'razorpay_order_id_challenger'
    : 'razorpay_order_id_accepter'

  await supabase
    .from('bookings')
    .update({ [orderField]: order.id })
    .eq('id', bookingId)

  // Step 4 — Open Razorpay checkout
  const options = {
    key: RAZORPAY_KEY_ID,
    amount: order.amount,
    currency: order.currency,
    name: 'PlayYourGame',
    description: `Booking Payment - ${role}`,
    order_id: order.id,
    prefill: {
      name: userName || '',
      email: userEmail || ''
    },
    theme: {
      color: '#22c55e'
    },
    handler: async (response) => {
      try {
        // Step 5 — Verify signature server-side (production only)
        if (IS_PRODUCTION) {
          await verifyPayment(
            response.razorpay_order_id,
            response.razorpay_payment_id,
            response.razorpay_signature
          )
        }

        // Step 6 — Mark payment done in DB
        // If both players paid → auto_confirm_booking trigger fires
        // → booking confirmed → match status = active
        await markPaymentDone(bookingId, role)

        // Step 7 — Success
        if (onSuccess) onSuccess(response)

      } catch (error) {
        console.error('Payment verification/confirmation error:', error)
        if (onFailure) onFailure(error)
      }
    },
    modal: {
      ondismiss: () => {
        if (onFailure) onFailure(new Error('Payment cancelled by user'))
      }
    }
  }

  const razorpay = new window.Razorpay(options)
  razorpay.open()
}