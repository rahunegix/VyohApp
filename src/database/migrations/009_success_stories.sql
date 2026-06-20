-- Success stories (published) + member story submissions

CREATE TYPE success_story_type AS ENUM ('relationship', 'marriage');
CREATE TYPE success_story_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE story_submission_status AS ENUM ('pending', 'approved', 'rejected');

CREATE TABLE success_stories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  story_type success_story_type NOT NULL,
  names TEXT NOT NULL,
  location TEXT,
  timeline TEXT,
  quote TEXT NOT NULL,
  body TEXT,
  cover_image_url TEXT NOT NULL,
  alt_text TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  status success_story_status NOT NULL DEFAULT 'draft',
  sort_order INTEGER NOT NULL DEFAULT 0,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE success_stories
  ADD COLUMN IF NOT EXISTS gallery_image_urls TEXT[] NOT NULL DEFAULT '{}';

CREATE INDEX idx_success_stories_status ON success_stories(status);
CREATE INDEX idx_success_stories_type ON success_stories(story_type);
CREATE INDEX idx_success_stories_featured ON success_stories(is_featured) WHERE status = 'published';

CREATE TABLE story_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  story_type success_story_type NOT NULL,
  submitter_name TEXT NOT NULL,
  partner_name TEXT,
  email TEXT,
  phone TEXT,
  location TEXT,
  timeline TEXT,
  title TEXT,
  story TEXT NOT NULL,
  photo_urls TEXT[] NOT NULL DEFAULT '{}',
  consent BOOLEAN NOT NULL DEFAULT FALSE,
  status story_submission_status NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_story_submissions_status ON story_submissions(status);
CREATE INDEX idx_story_submissions_user ON story_submissions(user_id);

-- Seed featured stories (matches welcome page content)
INSERT INTO success_stories (
  slug, story_type, names, location, timeline, quote, body,
  cover_image_url, alt_text, is_featured, status, sort_order, published_at
) VALUES
(
  'ankit-priya-marriage',
  'marriage',
  'Ankit & Priya',
  'Dehradun · Garhwal',
  'Engaged in 4 months',
  'Our families met through Saathini after we matched on values and gotra preferences. The mandap felt like it was always meant to be.',
  'Ankit from Dehradun and Priya from a Garhwali family connected on Saathini through shared values and family preferences. After thoughtful conversations and family introductions, they were engaged within four months. They credit verified profiles and intent-first matching for helping both families feel confident from day one.',
  'https://images.unsplash.com/photo-1583934270204-75a0e3b05ec5?auto=format&fit=crop&w=900&q=80',
  'Hindu wedding ceremony with sacred fire and rituals',
  TRUE,
  'published',
  1,
  NOW()
),
(
  'rohit-kavya-relationship',
  'relationship',
  'Rohit & Kavya',
  'Nainital · Kumaon',
  'Together 18 months',
  'We chose the serious relationship path first. Saathini helped us build trust before our families got involved — no rush, just clarity.',
  'Rohit and Kavya matched in Nainital while both were looking for a serious, long-term relationship. They spent months building trust through consent-first chats before involving their families. Eighteen months later, they describe their bond as steady, intentional, and rooted in shared Kumaoni values.',
  'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?auto=format&fit=crop&w=900&q=80',
  'Indian wedding couple in traditional attire',
  TRUE,
  'published',
  2,
  NOW()
),
(
  'aditya-ishita-relationship',
  'relationship',
  'Aditya & Ishita',
  'Haridwar · Uttarakhand',
  'First date in 2 weeks',
  'Verified profiles and consent-first chats made us comfortable exploring a connection. We are taking it one meaningful step at a time.',
  'Aditya and Ishita began with a verified match in Haridwar. Face verification and clear intent labels helped them feel safe exploring a new connection. Their first in-person meeting happened within two weeks — and they continue to take each step with openness and respect.',
  'https://images.unsplash.com/photo-1522673607200-8d87521a1536?auto=format&fit=crop&w=900&q=80',
  'Indian couple celebrating together',
  TRUE,
  'published',
  3,
  NOW()
)
ON CONFLICT (slug) DO NOTHING;
