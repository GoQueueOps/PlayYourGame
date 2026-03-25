import { supabase } from '../supabase'
import { adminCreditPoints, logTransaction } from './walletService'

// ══════════════════════════════════════════
// LOGGING
// ══════════════════════════════════════════

export const logAdminAction = async (action, targetUserId = null) => {
  const { data: { user } } = await supabase.auth.getUser()

  const { error } = await supabase
    .from('admin_logs')
    .insert({
      admin_id: user.id,
      action,
      target_user_id: targetUserId
    })

  if (error) console.error('Admin log error:', error)
}

export const getAdminLogs = async () => {
  const { data, error } = await supabase
    .from('admin_logs')
    .select(`
      *,
      admin:admin_id (name),
      target:target_user_id (name)
    `)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

// ══════════════════════════════════════════
// USER MANAGEMENT
// ══════════════════════════════════════════

export const getAllUsers = async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select(`
      *,
      user_roles (
        roles (name)
      ),
      wallet (
        g_points_balance,
        z_points_balance,
        locked_points
      ),
      player_stats (
        matches_played,
        matches_won,
        aura_level,
        rank
      )
    `)
    .order('created_date', { ascending: false })

  if (error) throw error
  return data
}

export const getUserById = async (userId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select(`
      *,
      user_roles (
        roles (name)
      ),
      wallet (
        g_points_balance,
        z_points_balance,
        locked_points
      ),
      player_stats (
        matches_played,
        matches_won,
        aura_level,
        rank
      )
    `)
    .eq('id', userId)
    .single()

  if (error) throw error
  return data
}

// ── BAN USER (change role to 'banned') ──
export const banUser = async (targetUserId, reason) => {
  // Get banned role id
  const { data: role } = await supabase
    .from('roles')
    .select('id')
    .eq('name', 'banned')
    .single()

  if (!role) {
    // Create banned role if it doesn't exist
    const { data: newRole } = await supabase
      .from('roles')
      .insert({ name: 'banned' })
      .select()
      .single()

    await supabase
      .from('user_roles')
      .update({ role_id: newRole.id })
      .eq('user_id', targetUserId)
  } else {
    await supabase
      .from('user_roles')
      .update({ role_id: role.id })
      .eq('user_id', targetUserId)
  }

  await logAdminAction(`Banned user: ${reason}`, targetUserId)
  await sendNotification(
    targetUserId,
    'account',
    `Your account has been suspended. Reason: ${reason}`
  )
}

// ── UNBAN USER (restore to 'user' role) ──
export const unbanUser = async (targetUserId) => {
  const { data: role } = await supabase
    .from('roles')
    .select('id')
    .eq('name', 'user')
    .single()

  await supabase
    .from('user_roles')
    .update({ role_id: role.id })
    .eq('user_id', targetUserId)

  await logAdminAction('Unbanned user', targetUserId)
  await sendNotification(
    targetUserId,
    'account',
    'Your account has been reinstated. Welcome back!'
  )
}

// ── CHANGE USER ROLE ──
export const changeUserRole = async (targetUserId, newRoleName) => {
  const { data: role, error: roleError } = await supabase
    .from('roles')
    .select('id')
    .eq('name', newRoleName)
    .single()

  if (roleError) throw roleError

  const { error } = await supabase
    .from('user_roles')
    .update({ role_id: role.id })
    .eq('user_id', targetUserId)

  if (error) throw error

  await logAdminAction(`Changed role to ${newRoleName}`, targetUserId)
  await sendNotification(
    targetUserId,
    'account',
    `Your account role has been updated to ${newRoleName}`
  )
}

// ══════════════════════════════════════════
// APPEALS
// ══════════════════════════════════════════

export const getAllAppeals = async () => {
  const { data, error } = await supabase
    .from('appeals')
    .select(`
      *,
      profiles:user_id (name),
      bookings:booking_id (arena_name, booking_date, status)
    `)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export const getPendingAppeals = async () => {
  const { data, error } = await supabase
    .from('appeals')
    .select(`
      *,
      profiles:user_id (name),
      bookings:booking_id (arena_name, booking_date, status)
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export const resolveAppeal = async (appealId, resolution, targetUserId) => {
  const { error } = await supabase
    .from('appeals')
    .update({ status: resolution })
    .eq('id', appealId)

  if (error) throw error

  await logAdminAction(`Appeal ${resolution}: ${appealId}`, targetUserId)
  await sendNotification(
    targetUserId,
    'appeal',
    `Your appeal has been ${resolution}. ${
      resolution === 'approved'
        ? 'We have taken action on your request.'
        : 'Unfortunately we could not resolve this in your favor.'
    }`
  )
}

// ══════════════════════════════════════════
// NOTIFICATIONS
// ══════════════════════════════════════════

export const sendNotification = async (userId, type, message) => {
  const { error } = await supabase
    .from('notifications')
    .insert({ user_id: userId, type, message, is_read: false })

  if (error) console.error('Notification error:', error)
}

export const broadcastNotification = async (type, message) => {
  // Get all user ids
  const { data: users, error } = await supabase
    .from('profiles')
    .select('id')

  if (error) throw error

  const notifications = users.map(u => ({
    user_id: u.id,
    type,
    message,
    is_read: false
  }))

  const { error: insertError } = await supabase
    .from('notifications')
    .insert(notifications)

  if (insertError) throw insertError

  await logAdminAction(`Broadcast notification: ${message}`)
}

// ══════════════════════════════════════════
// MATCH OVERSIGHT
// ══════════════════════════════════════════

export const getAllMatches = async () => {
  const { data, error } = await supabase
    .from('matches')
    .select(`
      *,
      profiles:created_by (name),
      arenas (name),
      courts (name),
      match_players (user_id, team)
    `)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export const adminCancelMatch = async (matchId, reason) => {
  const { error } = await supabase
    .from('matches')
    .update({ status: 'cancelled' })
    .eq('id', matchId)

  if (error) throw error
  // ↑ refund_on_cancel trigger fires automatically

  await logAdminAction(`Admin cancelled match ${matchId}: ${reason}`)
}

// ══════════════════════════════════════════
// WALLET ADMIN TOOLS
// ══════════════════════════════════════════

export const adminAddPoints = async (targetUserId, currency, points) => {
  await adminCreditPoints(targetUserId, currency, points, 'admin_credit')
  await logAdminAction(
    `Credited ${points} ${currency} points`,
    targetUserId
  )
  await sendNotification(
    targetUserId,
    'wallet',
    `${points} ${currency} points have been added to your wallet by admin`
  )
}

export const adminDeductPoints = async (targetUserId, currency, points) => {
  await adminCreditPoints(targetUserId, currency, -points, 'admin_deduct')
  await logAdminAction(
    `Deducted ${points} ${currency} points`,
    targetUserId
  )
  await sendNotification(
    targetUserId,
    'wallet',
    `${points} ${currency} points have been deducted from your wallet by admin`
  )
}

// ══════════════════════════════════════════
// DASHBOARD STATS
// ══════════════════════════════════════════

export const getAdminStats = async () => {
  const [users, matches, bookings, appeals] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('matches').select('id', { count: 'exact', head: true }),
    supabase.from('bookings').select('id', { count: 'exact', head: true }),
    supabase.from('appeals').select('id', { count: 'exact', head: true }).eq('status', 'pending')
  ])

  return {
    totalUsers: users.count || 0,
    totalMatches: matches.count || 0,
    totalBookings: bookings.count || 0,
    pendingAppeals: appeals.count || 0
  }
}