import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ikmztkfofadyjuhfqqst.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlrbXp0a2ZvZmFkeWp1aGZxcXN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4NTM0NjgsImV4cCI6MjA2MzQyOTQ2OH0.8NvlWc-V9hMjekuU4asu-Yg3kes3xFoQzu74InXg5ew';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);