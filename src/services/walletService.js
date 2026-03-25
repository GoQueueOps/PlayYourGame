import { supabase } from "../lib/supabase"

// ══════════════════════════════════════════
// READ WALLET
// ══════════════════════════════════════════

// ── GET MY WALLET ──
export const getMyWallet = async () => {
  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('wallet')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (error) throw error
  return data
}

// ── GET MY TRANSACTIONS ──
export const getMyTransactions = async () => {
  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('wallet_transactions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

// ── GET MY CONVERSION HISTORY ──
export const getMyConversions = async () => {
  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('g_to_z_conversions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

// ══════════════════════════════════════════
// CONVERSION: G → Z POINTS
// ══════════════════════════════════════════

// Rules:
// 10 G points = 1 Z point (conversion rate)
// Minimum conversion: 10 G points
// Z points used for bookings rewards
// G points used for match entry + winnings

const CONVERSION_RATE = 10 // 10 G = 1 Z

export const convertGtoZ = async (gPointsToConvert) => {
  const { data: { user } } = await supabase.auth.getUser()

  if (gPointsToConvert < CONVERSION_RATE) {
    throw new Error(`Minimum conversion is ${CONVERSION_RATE} G points`)
  }

  if (gPointsToConvert % CONVERSION_RATE !== 0) {
    throw new Error(`G points must be a multiple of ${CONVERSION_RATE}`)
  }

  const zPointsToReceive = gPointsToConvert / CONVERSION_RATE

  // Check balance
  const wallet = await getMyWallet()
  if (wallet.g_points_balance < gPointsToConvert) {
    throw new Error('Insufficient G points balance')
  }

  // Deduct G, add Z
  const { error: walletError } = await supabase
    .from('wallet')
    .update({
      g_points_balance: wallet.g_points_balance - gPointsToConvert,
      z_points_balance: wallet.z_points_balance + zPointsToReceive
    })
    .eq('user_id', user.id)

  if (walletError) throw walletError

  // Log conversion
  const { error: convError } = await supabase
    .from('g_to_z_conversions')
    .insert({
      user_id: user.id,
      g_points_used: gPointsToConvert,
      z_points_received: zPointsToReceive,
      conversion_rate: CONVERSION_RATE
    })

  if (convError) throw convError

  // Log transaction
  await logTransaction({
    userId: user.id,
    currency: 'G',
    points: -gPointsToConvert,
    transactionType: 'conversion_out'
  })

  await logTransaction({
    userId: user.id,
    currency: 'Z',
    points: zPointsToReceive,
    transactionType: 'conversion_in'
  })

  return { gPointsUsed: gPointsToConvert, zPointsReceived: zPointsToReceive }
}

// ══════════════════════════════════════════
// REFUND (on match cancel)
// ══════════════════════════════════════════

export const refundEntryPoints = async (matchId) => {
  const { data: { user } } = await supabase.auth.getUser()

  // Get entry points for match
  const { data: match, error: matchError } = await supabase
    .from('matches')
    .select('entry_points')
    .eq('id', matchId)
    .single()

  if (matchError) throw matchError

  if (match.entry_points > 0) {
    // Unlock locked points back to g_points_balance
    const { error } = await supabase
      .from('wallet')
      .update({
        locked_points: supabase.rpc('greatest', { a: 0, b: `locked_points - ${match.entry_points}` }),
        g_points_balance: supabase.rpc('g_points_balance + ' + match.entry_points)
      })
      .eq('user_id', user.id)

    if (error) {
      // Fallback: use raw SQL via RPC
      const { error: rpcError } = await supabase.rpc('refund_entry_points', {
        p_user_id: user.id,
        p_points: match.entry_points
      })
      if (rpcError) throw rpcError
    }

    await logTransaction({
      userId: user.id,
      currency: 'G',
      points: match.entry_points,
      transactionType: 'refund'
    })
  }
}

// ══════════════════════════════════════════
// ADMIN: CREDIT POINTS TO USER
// ══════════════════════════════════════════

export const adminCreditPoints = async (targetUserId, currency, points, reason) => {
  const field = currency === 'G' ? 'g_points_balance' : 'z_points_balance'

  // Get current balance
  const { data: wallet, error: walletFetchError } = await supabase
    .from('wallet')
    .select(field)
    .eq('user_id', targetUserId)
    .single()

  if (walletFetchError) throw walletFetchError

  const { error } = await supabase
    .from('wallet')
    .update({ [field]: wallet[field] + points })
    .eq('user_id', targetUserId)

  if (error) throw error

  await logTransaction({
    userId: targetUserId,
    currency,
    points,
    transactionType: reason || 'admin_credit'
  })
}

// ══════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════

// ── LOG TRANSACTION ──
export const logTransaction = async ({ userId, currency, points, transactionType, bookingId }) => {
  const { error } = await supabase
    .from('wallet_transactions')
    .insert({
      user_id: userId,
      currency,
      points,
      transaction_type: transactionType,
      booking_id: bookingId || null
    })

  if (error) console.error('Transaction log error:', error)
}

// ── SUBSCRIBE TO WALLET CHANGES (realtime) ──
export const subscribeToWallet = (onUpdate) => {
  const channel = supabase
    .channel('wallet_changes')
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'wallet'
      },
      (payload) => {
        onUpdate(payload.new)
      }
    )
    .subscribe()

  return () => supabase.removeChannel(channel)
}