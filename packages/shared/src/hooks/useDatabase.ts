import { supabase } from "../supabaseClient";

export function useDatabase() {
  const fetchData = async (tableName: string) => {
    if (!supabase) {
      throw new Error("Supabase is not configured.");
    }

    const { data, error } = await supabase.from(tableName).select("*");
    if (error) throw error;
    return data;
  };

  return { fetchData };
}
