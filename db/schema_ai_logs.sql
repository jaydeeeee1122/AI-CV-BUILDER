-- AI Logs Table
-- Captures every interaction with the AI for training purposes (RLHF)

create table if not exists public.ai_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id),
  session_id text, -- Optional: to group logs by session
  action_type text not null, -- 'enhance_skills', 'enhance_experience', 'rewrite_cv', 'job_match'
  input_context text, -- The original text or context provided by user
  job_description_keywords jsonb, -- Extracted keywords if available
  ai_prompt text, -- The actual full prompt sent to the LLM
  ai_response text, -- The raw response from the LLM
  provider text, -- 'ollama' or 'gemini'
  model text, -- 'llama3', 'gemini-pro', etc.
  meta_data jsonb, -- Any extra technical metadata (latency, tokens)
  user_rating integer, -- 1-5 rating (explicit feedback)
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies (Optional but recommended)
alter table public.ai_logs enable row level security;

-- Only service role can insert (triggered by backend) or user can insert their own logs?
-- Usually backend inserts. If client inserts, we need policy. 
-- For now, assuming backend usage via service key or user context.
create policy "Users can view their own logs"
  on public.ai_logs for select
  using (auth.uid() = user_id);
