import { supabase } from "../lib/supabase"

// ══════════════════════════════════════════
// NOTIFICATIONS REALTIME
// ══════════════════════════════════════════

export const subscribeToNotifications = (onNotification) => {
  const channel = supabase
    .channel('notifications')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications'
      },
      (payload) => {
        onNotification(payload.new)
      }
    )
    .subscribe()

  return () => supabase.removeChannel(channel)
}

// ══════════════════════════════════════════
// MATCH STATUS REALTIME
// ══════════════════════════════════════════

export const subscribeToMatch = (matchId, onUpdate) => {
  const channel = supabase
    .channel(`match:${matchId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'matches',
        filter: `id=eq.${matchId}`
      },
      (payload) => {
        onUpdate(payload.new)
      }
    )
    .subscribe()

  return () => supabase.removeChannel(channel)
}

// ══════════════════════════════════════════
// BOOKING STATUS REALTIME
// ══════════════════════════════════════════

export const subscribeToBooking = (bookingId, onUpdate) => {
  const channel = supabase
    .channel(`booking:${bookingId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'bookings',
        filter: `id=eq.${bookingId}`
      },
      (payload) => {
        onUpdate(payload.new)
      }
    )
    .subscribe()

  return () => supabase.removeChannel(channel)
}

// ══════════════════════════════════════════
// WALLET REALTIME
// ══════════════════════════════════════════

export const subscribeToWalletChanges = (userId, onUpdate) => {
  const channel = supabase
    .channel(`wallet:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'wallet',
        filter: `user_id=eq.${userId}`
      },
      (payload) => {
        onUpdate(payload.new)
      }
    )
    .subscribe()

  return () => supabase.removeChannel(channel)
}

// ══════════════════════════════════════════
// LOBBY REALTIME (open challenges)
// ══════════════════════════════════════════

export const subscribeToOpenChallenges = (onInsert, onUpdate) => {
  const channel = supabase
    .channel('open_challenges')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'matches'
      },
      (payload) => {
        if (payload.new.status === 'open') onInsert(payload.new)
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'matches'
      },
      (payload) => {
        onUpdate(payload.new)
      }
    )
    .subscribe()

  return () => supabase.removeChannel(channel)
}

// ══════════════════════════════════════════
// PRESENCE (who is online in a lobby/group)
// ══════════════════════════════════════════

export const joinPresenceChannel = async (channelName, userInfo, onSync) => {
  const channel = supabase.channel(channelName, {
    config: { presence: { key: userInfo.id } }
  })

  channel
    .on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState()
      const onlineUsers = Object.values(state).flat()
      onSync(onlineUsers)
    })
    .subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track(userInfo)
      }
    })

  return () => supabase.removeChannel(channel)
}

// ══════════════════════════════════════════
// CLEANUP ALL CHANNELS
// ══════════════════════════════════════════

export const removeAllChannels = () => {
  supabase.removeAllChannels()
}