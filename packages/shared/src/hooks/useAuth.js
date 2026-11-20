import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
export function useAuth() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        if (!supabase) {
            setLoading(false);
            return undefined;
        }
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            setLoading(false);
        });
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            setLoading(false);
        });
        return () => subscription.unsubscribe();
    }, []);
    return { user, loading };
}
