-- Programmatic SEO pages + admin-managed metadata

CREATE TYPE seo_page_kind AS ENUM ('static', 'programmatic');

CREATE TABLE seo_pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  route_path TEXT UNIQUE NOT NULL,
  page_kind seo_page_kind NOT NULL DEFAULT 'static',
  slug TEXT,
  title TEXT NOT NULL,
  meta_description TEXT NOT NULL,
  meta_keywords TEXT,
  og_title TEXT,
  og_description TEXT,
  og_image_url TEXT,
  canonical_path TEXT,
  robots_index BOOLEAN NOT NULL DEFAULT TRUE,
  robots_follow BOOLEAN NOT NULL DEFAULT TRUE,
  h1 TEXT,
  hero_subtitle TEXT,
  intro_html TEXT,
  sections JSONB NOT NULL DEFAULT '[]'::jsonb,
  faq JSONB NOT NULL DEFAULT '[]'::jsonb,
  focus_keywords TEXT[] NOT NULL DEFAULT '{}',
  related_links JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_seo_pages_kind ON seo_pages(page_kind);
CREATE INDEX idx_seo_pages_published ON seo_pages(is_published) WHERE is_published = TRUE;
CREATE INDEX idx_seo_pages_slug ON seo_pages(slug) WHERE slug IS NOT NULL;

-- Seed homepage + programmatic landing pages
INSERT INTO seo_pages (
  route_path, page_kind, slug, title, meta_description, meta_keywords,
  h1, hero_subtitle, intro_html, sections, faq, focus_keywords, related_links,
  is_published, sort_order
) VALUES
(
  '/',
  'static',
  NULL,
  'Saathini — Uttarakhand Matrimony & Dating | Garhwali & Kumaoni Matches',
  'Saathini is Uttarakhand''s verified matrimony and dating platform for Garhwali & Kumaoni singles. Phone-verified profiles, family-friendly Hindu marriage paths, and a trusted alternative to Maangal.com and Shaadi.com.',
  'uttarakhand matrimony, garhwali matrimony, kumaoni matrimony, pahadi matrimonial site, alternative to maangal.com, alternative to shadi.com, uttarakhand dating, hindu marriage uttarakhand',
  'Uttarakhand''s trusted matrimony & dating platform',
  'Garhwali · Kumaoni · Verified profiles · Hindu marriage & serious relationships',
  '<p>Saathini connects Uttarakhand singles and families with intent-first matching — from modern dating to traditional Hindu marriage. Built for Dehradun, Nainital, Haridwar, and the entire Garhwal–Kumaon region.</p>',
  '[
    {"title":"Why Saathini for Uttarakhand matrimony","body":"Unlike generic national portals, Saathini is designed for Pahadi culture — gotra preferences, family involvement, and region-aware discovery.","bullets":["Garhwali & Kumaoni community focus","Phone + face verified profiles","Marriage and relationship paths on one platform","Family-managed profile options"]},
    {"title":"A modern alternative to Maangal.com & Shaadi.com","body":"Many Uttarakhand families search for local alternatives to Maangal.com, Shaadi.com, and BharatMatrimony. Saathini offers a focused, trust-first experience without noisy nationwide listings.","bullets":["Local Uttarakhand discovery filters","Consent-first chat before family intro","AI compatibility rooted in shared values","Success stories from real Uttarakhand couples"]}
  ]'::jsonb,
  '[
    {"question":"Is Saathini only for marriage?","answer":"No. You can choose serious relationship or Hindu marriage intent. Many members start with dating and move toward family-led marriage when both sides are ready."},
    {"question":"How is Saathini different from Maangal.com or Shaadi.com?","answer":"Saathini focuses on Uttarakhand — Garhwali and Kumaoni communities, verified profiles, and culturally aware matching rather than a generic all-India catalogue."},
    {"question":"Which cities and regions does Saathini cover?","answer":"We serve all 13 districts of Uttarakhand including Dehradun, Haridwar, Nainital, Almora, Pauri, Tehri, Rudraprayag, and diaspora Pahadi families."},
    {"question":"Are profiles verified?","answer":"Yes. Mobile OTP verification is required. Optional face and ID verification badges increase trust score and visibility."},
    {"question":"Can parents create or manage a profile?","answer":"Yes. Profiles can be created by self, parents, siblings, or guardians — common for traditional matrimony in Uttarakhand."}
  ]'::jsonb,
  ARRAY['uttarakhand matrimony','garhwali matrimony','kumaoni matrimony','alternative to maangal.com','alternative to shadi.com','pahadi matrimonial site'],
  '[{"label":"Garhwali matrimony","href":"/matrimony/garhwali-matrimony"},{"label":"Kumaoni matrimony","href":"/matrimony/kumaoni-matrimony"},{"label":"Alternative to Maangal.com","href":"/matrimony/alternative-maangal-com"},{"label":"Success stories","href":"/success-stories"}]'::jsonb,
  TRUE,
  0
),
(
  '/welcome',
  'static',
  NULL,
  'Welcome to Saathini — Start Your Uttarakhand Match Journey',
  'Join Saathini — verified Uttarakhand matrimony and dating. Create your profile in minutes with phone OTP verification.',
  'saathini welcome, uttarakhand matrimony signup, garhwali kumaoni dating',
  'Welcome to Saathini',
  'From connection to commitment — built for Uttarakhand',
  NULL,
  '[]'::jsonb,
  '[]'::jsonb,
  ARRAY['saathini','uttarakhand matrimony signup'],
  '[]'::jsonb,
  TRUE,
  1
),
(
  '/matrimony/uttarakhand-matrimony',
  'programmatic',
  'uttarakhand-matrimony',
  'Uttarakhand Matrimony — Garhwali & Kumaoni Matrimonial Site | Saathini',
  'Find verified Uttarakhand matrimony matches on Saathini. Garhwali & Kumaoni brides and grooms with family-friendly Hindu marriage features.',
  'uttarakhand matrimony, uttarakhand matrimonial site, garhwali kumaoni marriage, pahadi shaadi',
  'Uttarakhand matrimony — verified Pahadi matches',
  'The dedicated matrimonial platform for Garhwal, Kumaon & diaspora families',
  '<p>Looking for a trusted Uttarakhand matrimonial site? Saathini brings together verified profiles from Dehradun, Haridwar, Nainital, Almora, and across all districts — with marriage intent, gotra filters, and family involvement built in.</p>',
  '[{"title":"Matrimony features for Uttarakhand families","body":"Saathini supports both self-managed and family-managed profiles common in Pahadi matrimony.","bullets":["Hindu marriage intent path","Community & gotra preferences","District and region filters","Trust score and verification badges"]}]'::jsonb,
  '[{"question":"Which districts are covered?","answer":"All 13 Uttarakhand districts plus diaspora Pahadi members worldwide."},{"question":"Is Saathini free to join?","answer":"Yes — create a profile free. Premium plans add visibility and advanced filters."}]'::jsonb,
  ARRAY['uttarakhand matrimony','uttarakhand matrimonial site','pahadi shaadi'],
  '[{"label":"Home","href":"/"},{"label":"Garhwali matrimony","href":"/matrimony/garhwali-matrimony"}]'::jsonb,
  TRUE,
  10
),
(
  '/matrimony/garhwali-matrimony',
  'programmatic',
  'garhwali-matrimony',
  'Garhwali Matrimony — Verified Garhwal Brides & Grooms | Saathini',
  'Garhwali matrimony on Saathini. Connect with verified Garhwal brides and grooms from Dehradun, Tehri, Pauri, Rudraprayag, Chamoli & more.',
  'garhwali matrimony, garhwal matrimonial, garhwali shaadi, garhwal bride groom',
  'Garhwali matrimony for verified Garhwal matches',
  'Tehri · Pauri · Dehradun · Rudraprayag · Chamoli · Uttarkashi',
  '<p>Saathini is built for Garhwali families seeking meaningful matrimony — with cultural awareness, verification, and intent-first matching across Garhwal districts.</p>',
  '[]'::jsonb,
  '[{"question":"Can I filter by Garhwal district?","answer":"Yes — filter by district, region, community, and marriage timeline during onboarding."}]'::jsonb,
  ARRAY['garhwali matrimony','garhwal matrimonial','garhwali shaadi'],
  '[{"label":"Uttarakhand matrimony","href":"/matrimony/uttarakhand-matrimony"},{"label":"Kumaoni matrimony","href":"/matrimony/kumaoni-matrimony"}]'::jsonb,
  TRUE,
  11
),
(
  '/matrimony/kumaoni-matrimony',
  'programmatic',
  'kumaoni-matrimony',
  'Kumaoni Matrimony — Verified Kumaon Brides & Grooms | Saathini',
  'Kumaoni matrimony on Saathini. Nainital, Almora, Pithoragarh, Bageshwar & Kumaon diaspora — verified profiles for Hindu marriage.',
  'kumaoni matrimony, kumaon matrimonial, kumaoni shaadi, nainital matrimony',
  'Kumaoni matrimony — trusted Kumaon matches',
  'Nainital · Almora · Pithoragarh · Champawat · Bageshwar',
  '<p>Find Kumaoni brides and grooms with Saathini''s verified matrimony platform — designed for Kumaon culture, family values, and serious marriage intent.</p>',
  '[]'::jsonb,
  '[]'::jsonb,
  ARRAY['kumaoni matrimony','kumaon matrimonial','nainital matrimony'],
  '[{"label":"Uttarakhand matrimony","href":"/matrimony/uttarakhand-matrimony"}]'::jsonb,
  TRUE,
  12
),
(
  '/matrimony/alternative-maangal-com',
  'programmatic',
  'alternative-maangal-com',
  'Alternative to Maangal.com — Uttarakhand Matrimony on Saathini',
  'Looking for an alternative to Maangal.com? Saathini offers verified Uttarakhand matrimony with Garhwali & Kumaoni focus, modern UX, and trust-first matching.',
  'alternative to maangal.com, maangal.com alternative, uttarakhand matrimony site',
  'A trusted alternative to Maangal.com for Uttarakhand',
  'Local focus · Verified profiles · Garhwali & Kumaoni communities',
  '<p>If you searched for an alternative to Maangal.com, Saathini provides a modern, mobile-first matrimony experience focused on Uttarakhand — not a generic national listing site.</p>',
  '[{"title":"Why users switch from Maangal.com","body":"Families often want better verification, mobile apps, and region-specific discovery.","bullets":["OTP-verified phone numbers","Face verification badges","AI compatibility for Pahadi values","Active success stories from Uttarakhand"]}]'::jsonb,
  '[{"question":"Is Saathini affiliated with Maangal.com?","answer":"No. Saathini is an independent platform by FirstTrek OPC Private Limited."}]'::jsonb,
  ARRAY['alternative to maangal.com','maangal.com alternative'],
  '[{"label":"Alternative to Shaadi.com","href":"/matrimony/alternative-shadi-com"},{"label":"Uttarakhand matrimony","href":"/matrimony/uttarakhand-matrimony"}]'::jsonb,
  TRUE,
  20
),
(
  '/matrimony/alternative-shadi-com',
  'programmatic',
  'alternative-shadi-com',
  'Alternative to Shaadi.com — Uttarakhand Matrimony | Saathini',
  'Saathini is a focused alternative to Shaadi.com for Uttarakhand singles — Garhwali & Kumaoni matrimony with verification, family paths, and local discovery.',
  'alternative to shadi.com, shaadi.com alternative uttarakhand, pahadi matrimony',
  'Alternative to Shaadi.com — built for Uttarakhand',
  'Less noise · More local matches · Verified Pahadi profiles',
  '<p>National portals like Shaadi.com serve everyone. Saathini is purpose-built for Uttarakhand matrimony — helping you find Garhwali and Kumaoni matches faster with culturally relevant filters.</p>',
  '[]'::jsonb,
  '[{"question":"Does Saathini support Hindu marriage rituals?","answer":"Yes — marriage intent includes family involvement, gotra, and community preferences common in Uttarakhand Hindu weddings."}]'::jsonb,
  ARRAY['alternative to shadi.com','shaadi.com alternative','uttarakhand matrimony'],
  '[{"label":"Alternative to Maangal.com","href":"/matrimony/alternative-maangal-com"}]'::jsonb,
  TRUE,
  21
),
(
  '/matrimony/dehradun-matrimony',
  'programmatic',
  'dehradun-matrimony',
  'Dehradun Matrimony — Verified Brides & Grooms in Dehradun | Saathini',
  'Dehradun matrimony on Saathini. Find verified Garhwali and Kumaoni matches in Dehradun with phone-verified profiles and marriage intent filters.',
  'dehradun matrimony, dehradun matrimonial, dehradun shaadi, dehradun bride groom',
  'Dehradun matrimony — verified local matches',
  'Garhwali & Kumaoni singles in Dehradun valley',
  '<p>Dehradun is home to thousands of Pahadi families. Saathini helps Dehradun brides and grooms discover verified matches with district-level filters and trust scores.</p>',
  '[]'::jsonb,
  '[]'::jsonb,
  ARRAY['dehradun matrimony','dehradun matrimonial'],
  '[{"label":"Uttarakhand matrimony","href":"/matrimony/uttarakhand-matrimony"}]'::jsonb,
  TRUE,
  30
)
ON CONFLICT (route_path) DO NOTHING;
