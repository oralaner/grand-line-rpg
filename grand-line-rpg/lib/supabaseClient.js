import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// --- Ajout pour le débogage ---
console.log("URL Supabase vue :", supabaseUrl);
console.log("Clé Supabase vue :", supabaseAnonKey ? "Clé présente" : "Clé absente");
// -----------------------------

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Les variables d'environnement Supabase sont manquantes !");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)