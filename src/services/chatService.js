import { supabase } from '../supabase'

// ══════════════════════════════════════════
// GROUP CHAT
// ══════════════════════════════════════════

// ── GET MY GROUPS ──
export const getMyGroups = async () => {
  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('group_members')
    .select(`
      group_id,
      groups (
        id,
        name,
        type,
        match_id,
        expires_at,
        is_permanent,
        created_at
      )
    `)
    .eq('user_id', user.id)

  if (error) throw error
  return data.map(d => d.groups)
}

// ── GET GROUP MESSAGES ──
export const getGroupMessages = async (groupId) => {
  const { data, error } = await supabase
    .from('group_messages')
    .select(`
      *,
      profiles:sender_id (name)
    `)
    .eq('group_id', groupId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data
}

// ── SEND GROUP MESSAGE ──
export const sendGroupMessage = async (groupId, message) => {
  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('group_messages')
    .insert({
      group_id: groupId,
      sender_id: user.id,
      message
    })
    .select(`
      *,
      profiles:sender_id (name)
    `)
    .single()

  if (error) throw error
  return data
}

// ── SUBSCRIBE TO GROUP MESSAGES (realtime) ──
export const subscribeToGroupMessages = (groupId, onMessage) => {
  const channel = supabase
    .channel(`group:${groupId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'group_messages',
        filter: `group_id=eq.${groupId}`
      },
      async (payload) => {
        // Fetch sender name for new message
        const { data } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', payload.new.sender_id)
          .single()

        onMessage({
          ...payload.new,
          profiles: { name: data?.name || 'Unknown' }
        })
      }
    )
    .subscribe()

  // Return unsubscribe function
  return () => supabase.removeChannel(channel)
}

// ── GET GROUP MEMBERS ──
export const getGroupMembers = async (groupId) => {
  const { data, error } = await supabase
    .from('group_members')
    .select(`
      user_id,
      role,
      joined_at,
      profiles:user_id (name)
    `)
    .eq('group_id', groupId)

  if (error) throw error
  return data
}

// ── GET GROUP BY MATCH ID ──
export const getGroupByMatchId = async (matchId) => {
  const { data, error } = await supabase
    .from('groups')
    .select('*')
    .eq('match_id', matchId)
    .single()

  if (error) throw error
  return data
}

// ══════════════════════════════════════════
// DIRECT MESSAGES
// ══════════════════════════════════════════

// ── GET DM CONVERSATION ──
export const getDMConversation = async (otherUserId) => {
  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('direct_messages')
    .select(`
      *,
      sender:sender_id (name),
      receiver:receiver_id (name)
    `)
    .or(
      `and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),` +
      `and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`
    )
    .order('created_at', { ascending: true })

  if (error) throw error
  return data
}

// ── SEND DIRECT MESSAGE ──
export const sendDirectMessage = async (receiverId, message) => {
  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('direct_messages')
    .insert({
      sender_id: user.id,
      receiver_id: receiverId,
      message
    })
    .select(`
      *,
      sender:sender_id (name),
      receiver:receiver_id (name)
    `)
    .single()

  if (error) throw error
  return data
}

// ── SUBSCRIBE TO DIRECT MESSAGES (realtime) ──
export const subscribeToDMs = (otherUserId, onMessage) => {
  const channel = supabase
    .channel(`dm:${otherUserId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'direct_messages'
      },
      async (payload) => {
        const { new: msg } = payload

        // Only process messages relevant to this conversation
        const { data: { user } } = await supabase.auth.getUser()
        const isRelevant =
          (msg.sender_id === user.id && msg.receiver_id === otherUserId) ||
          (msg.sender_id === otherUserId && msg.receiver_id === user.id)

        if (!isRelevant) return

        // Fetch sender name
        const { data } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', msg.sender_id)
          .single()

        onMessage({
          ...msg,
          sender: { name: data?.name || 'Unknown' }
        })
      }
    )
    .subscribe()

  return () => supabase.removeChannel(channel)
}

// ── GET MY DM INBOX (latest message per conversation) ──
export const getDMInbox = async () => {
  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('direct_messages')
    .select(`
      *,
      sender:sender_id (name),
      receiver:receiver_id (name)
    `)
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .order('created_at', { ascending: false })

  if (error) throw error

  // Deduplicate — keep only latest message per conversation
  const seen = new Set()
  return data.filter(msg => {
    const key = [msg.sender_id, msg.receiver_id].sort().join(':')
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}