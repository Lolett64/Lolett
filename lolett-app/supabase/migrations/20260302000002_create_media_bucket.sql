-- Create public media storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

-- Public read access for media bucket
CREATE POLICY "media_public_read" ON storage.objects
FOR SELECT
USING (bucket_id = 'media');

-- Authenticated users (admin) can upload
CREATE POLICY "media_admin_insert" ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'media' AND auth.role() = 'authenticated');

-- Authenticated users (admin) can update
CREATE POLICY "media_admin_update" ON storage.objects
FOR UPDATE
USING (bucket_id = 'media' AND auth.role() = 'authenticated');

-- Authenticated users (admin) can delete
CREATE POLICY "media_admin_delete" ON storage.objects
FOR DELETE
USING (bucket_id = 'media' AND auth.role() = 'authenticated');
