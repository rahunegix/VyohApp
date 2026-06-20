-- Success story photo gallery (detail page)

ALTER TABLE success_stories
  ADD COLUMN IF NOT EXISTS gallery_image_urls TEXT[] NOT NULL DEFAULT '{}';
