import { useEffect, useState } from 'react'
import { supabase } from '../supabase'

export const useRole = () => {
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRole = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      const { data } = await supabase
        .from('user_roles')
        .select('roles(name)')
        .eq('user_id', user.id)
        .single()

      setRole(data?.roles?.name || 'user')
      setLoading(false)
    }
    fetchRole()
  }, [])

  return { role, loading }
}