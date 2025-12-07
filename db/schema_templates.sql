-- Industries Table
create table if not exists public.industries (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text not null unique,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Templates Table
create table if not exists public.templates (
  id uuid default gen_random_uuid() primary key,
  industry_id uuid references public.industries(id) on delete cascade,
  name text not null,
  slug text not null unique, -- e.g. 'tech-minimalist'
  component_map_id text not null, -- 'classic', 'sidebar', 'grid' (Maps to React Component)
  preview_image_url text,
  default_config jsonb, -- { "primaryColor": "#2563eb", "font": "Inter" }
  is_premium boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Seed Data: Industries
insert into public.industries (name, slug) values
('Technology & Engineering', 'tech'),
('Medical & Healthcare', 'medical'),
('Legal & Corporate', 'legal'),
('Creative & Design', 'creative'),
('Retail & General', 'retail')
on conflict (slug) do nothing;

-- Seed Data: Templates (Example for Tech, ensuring we have 4 variants as requested)
-- We need to look up IDs dynamically in a real script, but for seed we can rely on order or manual insert if running one by one.
-- Here we use a DO block for robust seeding.

do $$
declare
  tech_id uuid;
  med_id uuid;
  legal_id uuid;
  creative_id uuid;
  retail_id uuid;
begin
  select id into tech_id from public.industries where slug = 'tech';
  select id into med_id from public.industries where slug = 'medical';
  select id into legal_id from public.industries where slug = 'legal';
  select id into creative_id from public.industries where slug = 'creative';
  select id into retail_id from public.industries where slug = 'retail';

  -- TECH TEMPLATES
  insert into public.templates (industry_id, name, slug, component_map_id, default_config, is_premium) values
  (tech_id, 'DevOps Modern', 'tech-devops', 'sidebar', '{"primaryColor": "#0f172a", "font": "JetBrains Mono"}', true),
  (tech_id, 'Full Stack Minimal', 'tech-minimal', 'classic', '{"primaryColor": "#3b82f6", "font": "Inter"}', false),
  (tech_id, 'Engineering Grid', 'tech-grid', 'grid', '{"primaryColor": "#059669", "font": "Roboto"}', true),
  (tech_id, 'Tech Lead', 'tech-lead', 'classic', '{"primaryColor": "#4b5563", "font": "Lato"}', true)
  on conflict (slug) do nothing;

  -- MEDICAL TEMPLATES
  insert into public.templates (industry_id, name, slug, component_map_id, default_config, is_premium) values
  (med_id, 'Clinical Clean', 'med-clinical', 'classic', '{"primaryColor": "#0ea5e9", "font": "Open Sans"}', false),
  (med_id, 'Academic CV', 'med-academic', 'classic', '{"primaryColor": "#334155", "font": "Merriweather"}', true),
  (med_id, 'Nursing Modern', 'med-nursing', 'sidebar', '{"primaryColor": "#be185d", "font": "Lato"}', false),
  (med_id, 'Research Fellow', 'med-research', 'grid', '{"primaryColor": "#0f766e", "font": "Source Sans Pro"}', true)
  on conflict (slug) do nothing;

  -- LEGAL TEMPLATES
  insert into public.templates (industry_id, name, slug, component_map_id, default_config, is_premium) values
  (legal_id, 'Magic Circle', 'legal-magic', 'classic', '{"primaryColor": "#1e293b", "font": "Times New Roman"}', true),
  (legal_id, 'Corporate Counsel', 'legal-corp', 'classic', '{"primaryColor": "#0f172a", "font": "Playfair Display"}', true),
  (legal_id, 'Modern Associate', 'legal-modern', 'sidebar', '{"primaryColor": "#334155", "font": "Libre Baskerville"}', false),
  (legal_id, 'Barrister', 'legal-barrister', 'classic', '{"primaryColor": "#000000", "font": "Garamond"}', true)
  on conflict (slug) do nothing;

  -- CREATIVE TEMPLATES
  insert into public.templates (industry_id, name, slug, component_map_id, default_config, is_premium) values
  (creative_id, 'Portfolio Showcase', 'creative-port', 'grid', '{"primaryColor": "#8b5cf6", "font": "Poppins"}', true),
  (creative_id, 'Vibrant Designer', 'creative-vibrant', 'sidebar', '{"primaryColor": "#f43f5e", "font": "Montserrat"}', false),
  (creative_id, 'Gallery View', 'creative-gallery', 'grid', '{"primaryColor": "#0891b2", "font": "Raleway"}', true),
  (creative_id, 'Typography Focus', 'creative-type', 'classic', '{"primaryColor": "#171717", "font": "Space Grotesk"}', false)
  on conflict (slug) do nothing;
  
  -- RETAIL TEMPLATES
  insert into public.templates (industry_id, name, slug, component_map_id, default_config, is_premium) values
  (retail_id, 'Store Manager', 'retail-manager', 'sidebar', '{"primaryColor": "#d97706", "font": "Roboto Condensed"}', false),
  (retail_id, 'Customer Service', 'retail-service', 'classic', '{"primaryColor": "#4f46e5", "font": "Inter"}', false),
  (retail_id, 'Visual Merchandiser', 'retail-visual', 'grid', '{"primaryColor": "#db2777", "font": "Montserrat"}', true),
  (retail_id, 'Sales Associate', 'retail-sales', 'classic', '{"primaryColor": "#16a34a", "font": "Lato"}', false)
  on conflict (slug) do nothing;

end $$;
