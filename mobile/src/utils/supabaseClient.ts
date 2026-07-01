import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";

// Expo public environment variables resolved at build time
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || "https://grvjtbesdaquyukryoex.supabase.co";
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_mTp_EHAN45PRWAKpGudI_Q_sAa9xF0A";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
