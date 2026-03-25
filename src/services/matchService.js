import { supabase } from "../lib/supabase"

// ── CREATE CHALLENGE ──
export const createChallenge = async ({
  arenaId, courtId, sportId, matchTime, matchType, maxPlayers, entryPoints
}) => {
  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('matches')
    .insert({
      created_by: user.id,
      arena_id: arenaId,
      court_id: courtId,
      sport_id: sportId,
      match_time: matchTime,
      match_type: matchType,
      max_players: maxPlayers,
      entry_points: entryPoints,
      status: 'open'
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// ── JOIN CHALLENGE ──
export const joinChallenge = async (matchId, team) => {
  const { data: { user } } = await supabase.auth.getUser()

  // Add to match_players (trigger deducts entry points)
  const { error: joinError } = await supabase
    .from('match_players')
    .insert({ match_id: matchId, user_id: user.id, team })

  if (joinError) throw joinError

  // Update match accepted_by + status
  // ↑ This triggers create_match_group() automatically
  const { error: updateError } = await supabase
    .from('matches')
    .update({ accepted_by: user.id, status: 'accepted' })
    .eq('id', matchId)
    .eq('status', 'open')

  if (updateError) throw updateError
}

// ── CREATE BOOKING FOR MATCH ──
export const createMatchBooking = async ({
  matchId, arenaId, courtId, arenaName, sportType,
  price, challengerId, accepterId, bookingDate
}) => {
  const { data, error } = await supabase
    .from('bookings')
    .insert({
      match_id: matchId,
      arena_id: arenaId,
      court_id: courtId,
      arena_name: arenaName,
      sport_type: sportType,
      price: price,
      challenger_id: challengerId,
      accepter_id: accepterId,
      user_id: challengerId,
      booking_date: bookingDate,
      status: 'pending',
      paid_by_challenger: false,
      paid_by_accepter: false
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// ── MARK PAYMENT DONE ──
// If both paid → auto_confirm_booking trigger fires
//   → booking status = 'confirmed'
//     → link_booking_to_match trigger fires
//       → match.booking_id set
//       → match status = 'active'
export const markPaymentDone = async (bookingId, role) => {
  const field = role === 'challenger' ? 'paid_by_challenger' : 'paid_by_accepter'

  const { error } = await supabase
    .from('bookings')
    .update({ [field]: true })
    .eq('id', bookingId)

  if (error) throw error
}

// ── SUBMIT RESULT ──
// ↑ Triggers transfer_points_to_winner() automatically
export const submitResult = async (matchId, winningTeam, score) => {
  const { data: { user } } = await supabase.auth.getUser()

  const { error } = await supabase
    .from('match_results')
    .insert({
      match_id: matchId,
      winning_team: winningTeam,
      score: score,
      submitted_by: user.id
    })

  if (error) throw error

  // Mark match completed
  await supabase
    .from('matches')
    .update({ status: 'completed' })
    .eq('id', matchId)
}

// ── GET OPEN CHALLENGES ──
export const getOpenChallenges = async () => {
  const { data, error } = await supabase
    .from('matches')
    .select(`
      *,
      profiles:created_by (name),
      arenas (name),
      courts (name)
    `)
    .eq('status', 'open')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

// ── GET MY MATCHES ──
export const getMyMatches = async () => {
  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('match_players')
    .select(`
      *,
      matches (
        *,
        arenas (name),
        courts (name)
      )
    `)
    .eq('user_id', user.id)
    .order('joined_at', { ascending: false })

  if (error) throw error
  return data
}