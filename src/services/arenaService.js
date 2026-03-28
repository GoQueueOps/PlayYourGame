import { supabase } from '../lib/supabase'

// ── GET ALL ACTIVE ARENAS ──
export const getArenas = async ({ city, sport, search } = {}) => {
  let query = supabase
    .from('arenas')
    .select(`
      *,
      play_area_images (image_url, image_type, position),
      play_area_amenities (
        amenities (id, name, emoji)
      ),
      arena_sports (
        sports (id, name, emoji)
      ),
      courts (
        id, name, price_per_hour, is_active,
        sports (id, name, emoji)
      )
    `)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (city && city !== 'All India' && city !== 'Detecting...') {
    query = query.ilike('city', `%${city}%`)
  }

  if (search) {
    query = query.ilike('name', `%${search}%`)
  }

  const { data, error } = await query
  if (error) throw error

  // Filter by sport if provided
  let arenas = data
  if (sport && sport !== 'All') {
    arenas = data.filter(arena =>
      arena.arena_sports?.some(as => as.sports?.name === sport)
    )
  }

  // Format data to match old playAreas.js structure
  return arenas.map(formatArena)
}

// ── GET SINGLE ARENA BY ID ──
export const getArenaById = async (id) => {
  const { data, error } = await supabase
    .from('arenas')
    .select(`
      *,
      play_area_images (image_url, image_type, position),
      play_area_amenities (
        amenities (id, name, emoji)
      ),
      arena_sports (
        sports (id, name, emoji)
      ),
      courts (
        id, name, price_per_hour, is_active,
        sports (id, name, emoji)
      ),
      pricing_rules (start_time, end_time, rate)
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  return formatArena(data)
}

// ── FORMAT ARENA (normalize DB structure to match frontend expectations) ──
const formatArena = (arena) => {
  // Sort images by position
  const images = (arena.play_area_images || [])
    .sort((a, b) => (a.position || 0) - (b.position || 0))
    .map(img => img.image_url)

  const logo = arena.play_area_images?.find(img => img.image_type === 'logo')?.image_url || images[0]

  const courtImages = arena.play_area_images
    ?.filter(img => img.image_type === 'court')
    .sort((a, b) => (a.position || 0) - (b.position || 0))
    .map(img => img.image_url) || []

  // Build sportsManaged object grouped by sport name
  const sportsManaged = {}
  const activeCourts = (arena.courts || []).filter(c => c.is_active)

  activeCourts.forEach(court => {
    const sportName = court.sports?.name
    if (!sportName) return
    if (!sportsManaged[sportName]) sportsManaged[sportName] = []
    sportsManaged[sportName].push({
      id: court.id,
      name: court.name,
      physicalID: court.id, // use uuid as physicalID
      pricePerHour: court.price_per_hour,
      sport: court.sports
    })
  })

  const amenities = (arena.play_area_amenities || [])
    .map(pa => pa.amenities)
    .filter(Boolean)

  const sports = (arena.arena_sports || [])
    .map(as => as.sports)
    .filter(Boolean)

  // Get min price from courts
  const prices = activeCourts.map(c => c.price_per_hour).filter(Boolean)
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0

  return {
    id: arena.id,
    name: arena.name,
    location: arena.location,
    city: arena.city,
    state: arena.state,
    country: arena.country,
    description: arena.description,
    phone: arena.phone,
    latitude: arena.latitude,
    longitude: arena.longitude,
    is_active: arena.is_active,
    owner_id: arena.owner_id,
    venue_manager_id: arena.venue_manager_id,
    images: courtImages.length > 0 ? courtImages : images,
    logo,
    amenities,
    sports,
    sportsManaged,
    pricePerHour: minPrice, // min price for display
    pricingRules: arena.pricing_rules || [],
    distance: null // calculate client-side if needed
  }
}

// ── GET COURTS BY ARENA AND SPORT ──
export const getCourtsBySport = async (arenaId, sportName) => {
  const { data, error } = await supabase
    .from('courts')
    .select(`
      *,
      sports (id, name, emoji)
    `)
    .eq('arena_id', arenaId)
    .eq('is_active', true)

  if (error) throw error

  return data.filter(court => court.sports?.name === sportName)
}

// ── GET PRICE FOR COURT AT TIME ──
export const getPriceForTime = async (arenaId, courtId, hour) => {
  const timeStr = `${String(hour).padStart(2, '0')}:00:00`

  const { data: rules } = await supabase
    .from('pricing_rules')
    .select('*')
    .eq('play_area_id', arenaId)

  if (rules && rules.length > 0) {
    const matchingRule = rules.find(r =>
      timeStr >= r.start_time && timeStr < r.end_time
    )
    if (matchingRule) return matchingRule.price_per_hour
  }

  const { data: court } = await supabase
    .from('courts')
    .select('price_per_hour')
    .eq('id', courtId)
    .single()

  return court?.price_per_hour || 0
}

// ── GET ALL SPORTS ──
export const getSports = async () => {
  const { data, error } = await supabase
    .from('sports')
    .select('*')
    .order('name')

  if (error) throw error
  return data
}

// ── GET ALL AMENITIES ──
export const getAmenities = async () => {
  const { data, error } = await supabase
    .from('amenities')
    .select('*')
    .order('name')

  if (error) throw error
  return data
}

// ── CALCULATE DISTANCE (client-side) ──
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const d = R * c
  return d < 1 ? `${Math.round(d * 1000)}m` : `${d.toFixed(1)}km`
}

// ── OWNER: CREATE ARENA ──
export const createArena = async ({
  name, location, city, state, country, description,
  phone, latitude, longitude
}) => {
  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('arenas')
    .insert({
      name, location, city, state, country,
      description, phone, latitude, longitude,
      owner_id: user.id,
      is_active: false // needs admin approval
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// ── OWNER: ADD COURT ──
export const addCourt = async (arenaId, { name, sportId, pricePerHour }) => {
  const { data, error } = await supabase
    .from('courts')
    .insert({
      arena_id: arenaId,
      name,
      sport_id: sportId,
      price_per_hour: pricePerHour,
      is_active: true
    })
    .select()
    .single()

  if (error) throw error

  // Add sport to arena_sports if not already there
  await supabase
    .from('arena_sports')
    .upsert({ arena_id: arenaId, sport_id: sportId })
    .select()

  return data
}

// ── OWNER: ADD IMAGE ──
export const addArenaImage = async (arenaId, imageUrl, imageType = 'court', position = 0) => {
  const { data, error } = await supabase
    .from('play_area_images')
    .insert({
      play_area_id: arenaId,
      image_url: imageUrl,
      image_type: imageType,
      position
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// ── ADMIN: APPROVE ARENA ──
export const approveArena = async (arenaId) => {
  const { error } = await supabase
    .from('arenas')
    .update({ is_active: true })
    .eq('id', arenaId)

  if (error) throw error
}

// ── ADMIN: DEACTIVATE ARENA ──
export const deactivateArena = async (arenaId) => {
  const { error } = await supabase
    .from('arenas')
    .update({ is_active: false })
    .eq('id', arenaId)

  if (error) throw error
}