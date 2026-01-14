-- Create project_documents table
CREATE TABLE IF NOT EXISTS public.project_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT, -- e.g., 'pdf', 'docx', 'jpg'
    size INTEGER, -- in bytes
    url TEXT NOT NULL,
    uploaded_by TEXT, -- could be user id or name
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.project_documents ENABLE ROW LEVEL SECURITY;

-- Create Policies
CREATE POLICY "Allow public read access on project_documents" ON public.project_documents FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on project_documents" ON public.project_documents FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on project_documents" ON public.project_documents FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access on project_documents" ON public.project_documents FOR DELETE USING (true);
