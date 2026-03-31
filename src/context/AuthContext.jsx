import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [roleLoading, setRoleLoading] = useState(true);

  const fetchRole = async (userId) => {
    if (!userId) { setRole(null); setRoleLoading(false); return }
    const { data } = await supabase
      .from('user_roles')
      .select('roles(name)')
      .eq('user_id', userId)
      .single()
    setRole(data?.roles?.name || 'user')
    setRoleLoading(false)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const u = data.session?.user ?? null
      setUser(u)
      fetchRole(u?.id)
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const u = session?.user ?? null
        setUser(u)
        fetchRole(u?.id)
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  const isAdmin = role === 'admin' || role === 'superadmin'
  const isSuperAdmin = role === 'superadmin'
  const isOwner = role === 'owner' || role === 'venue_manager'
  const isVenueManager = role === 'venue_manager'

  return (
    <AuthContext.Provider value={{
      user,
      role,
      roleLoading,
      isAdmin,
      isSuperAdmin,
      isOwner,
      isVenueManager
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
