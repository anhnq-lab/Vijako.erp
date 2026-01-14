-- Enable the pgvector extension to work with embedding vectors
create extension if not exists vector;

-- Create a table to store your documents
create table if not exists embeddings (
  id bigint primary key generated always as identity,
  content text,                    -- Text content to chunk and vectorize
  metadata jsonb,                  -- Extra info (e.g., project_id, contract_id, title)
  embedding vector(1536)           -- 1536 is the dimension for OpenAI's text-embedding-3-small
);

-- Create a search function
create or replace function match_documents (
  query_embedding vector(1536),
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
