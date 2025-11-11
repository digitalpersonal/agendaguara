import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://awtmbbjldxbikrfgaxma.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3dG1iYmpsZHhiaWtyZmdheG1hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4OTg2MTMsImV4cCI6MjA3ODQ3NDYxM30.rV0dclu_OnVmr-LqvndDKy1W2Hna_wXMYJNqoNxcsbc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
