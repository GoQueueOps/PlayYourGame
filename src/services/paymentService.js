import { supabase } from '../lib/supabase'
import { markPaymentDone } from './matchService'

const RAZORPAY_KEY_ID = process.env.REACT_APP_RAZORPAY_KEY_ID

// ── LOAD RAZORPAY SCRIPT ──
export const loadRazorpay = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true)
      return
    }
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

// ── CREATE RAZORPAY ORDER (via edge function) ──
export const createRazorpayOrder = async (amount, bookingId, role) => {
  // Get session fresh each time
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

  if (sessionError || !sessionData?.session) {
    throw new Error('Not authenticated. Please log in again.')
  }

  const token = sessionData.session.access_token

  const response = await fetch(
    `${process.env.REACT_APP_SUPABASE_URL}/functions/v1/create-razorpay-order`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'apikey': process.env.REACT_APP_SUPABASE_ANON_KEY
      },
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

// ── INITIATE PAYMENT ──
export const initiatePayment = async ({
  bookingId,
  amount,
  role,           // 'challenger' or 'accepter'
  userName,
  userEmail,
  onSuccess,
  onFailure
}) => {
  // Load Razorpay script
  const loaded = await loadRazorpay()
  if (!loaded) {
    alert('Razorpay failed to load. Check your internet connection.')
    return
  }

  // Create order from edge function
  const order = await createRazorpayOrder(amount, bookingId, role)

  // Save order id to booking
  const orderField = role === 'challenger'
    ? 'razorpay_order_id_challenger'
    : 'razorpay_order_id_accepter'

  await supabase
    .from('bookings')
    .update({ [orderField]: order.id })
    .eq('id', bookingId)

  // Open Razorpay checkout
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
      color: '#22c55e' // green to match your UI
    },
    handler: async (response) => {
      try {
        // Mark payment done in DB
        // This triggers auto_confirm_booking if both paid
        await markPaymentDone(bookingId, role)

        if (onSuccess) onSuccess(response)
      } catch (error) {
        console.error('Payment handler error:', error)
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