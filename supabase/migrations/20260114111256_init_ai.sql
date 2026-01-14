-- Enable the pgvector extension to work with embedding vectors
create extension if not exists vector;

-- Create a table to store your documents
create table if not exists embeddings (
  id bigint primary key generated always as identity,
  content text,                    -- Text content to chunk and vectorize
  metadata jsonb,                  -- Extra info (e.g., project_id, contract_id, title)
  embedding vector(768)           -- 768 is the dimension for Gemini text-embedding-004
);

-- Create a search function
create or replace function match_documents (
  query_embedding vector(768),
  match_threshold float,
  match_count int
)
returns table (
  id bigint,
  content text,
  metadata jsonb,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    embeddings.id,
    embeddings.content,
    embeddings.metadata,
    1 - (embeddings.embedding <=> query_embedding) as similarity
  from embeddings
  where 1 - (embeddings.embedding <=> query_embedding) > match_threshold
  order by embeddings.embedding <=> query_embedding
  limit match_count;
end;
$$;

-- Create an index for faster similarity search
create index on embeddings using hnsw (embedding vector_cosine_ops);
