
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://enrtqetoosfvjxaijoje.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVucnRxZXRvb3Nmdmp4YWlqb2plIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5MzcwMzIsImV4cCI6MjA2ODUxMzAzMn0.GjahpS4OotUqfFL6EyPhc0Kc2f08vGLMn_RnM5ulzo8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);