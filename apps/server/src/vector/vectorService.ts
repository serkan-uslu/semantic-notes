import { ChromaClient, type Collection } from 'chromadb'

// ─── ChromaDB Client ──────────────────────────────────────────────────────────

const COLLECTION_NAME = 'semantic_notes'

let client: ChromaClient | null = null
let collection: Collection | null = null

async function getCollection(): Promise<Collection> {
  if (!client) {
    client = new ChromaClient({ host: 'localhost', port: 8000, ssl: false })
    collection = null
  }
  if (!collection) {
    // No embeddingFunction — we supply embeddings directly from Ollama
    collection = await client.getOrCreateCollection({
      name: COLLECTION_NAME,
      configuration: {
        hnsw: { space: 'cosine' },
      },
    })
  }
  return collection
}

// ─── Vector Store Service ─────────────────────────────────────────────────────

export const vectorService = {
  async isOnline(): Promise<boolean> {
    try {
      if (!client) client = new ChromaClient({ host: 'localhost', port: 8000, ssl: false })
      await client.heartbeat()
      return true
    } catch {
      return false
    }
  },

  async upsert(params: {
    id: string
    embedding: number[]
    text: string
    noteId: string
    blockId?: string
    chunkIndex: number
    title?: string
  }): Promise<void> {
    const col = await getCollection()
    await col.upsert({
      ids: [params.id],
      embeddings: [params.embedding],
      documents: [params.text],
      metadatas: [
        {
          note_id: params.noteId,
          block_id: params.blockId ?? '',
          chunk_index: params.chunkIndex,
          title: params.title ?? '',
        },
      ],
    })
  },

  async query(params: {
    embedding: number[]
    limit?: number
  }): Promise<
    {
      id: string
      score: number
      text: string
      noteId: string
      blockId: string
      title: string
    }[]
  > {
    const col = await getCollection()
    const results = await col.query({
      queryEmbeddings: [params.embedding],
      nResults: params.limit ?? 10,
      include: ['documents', 'metadatas', 'distances'] as never,
    })

    return (results.ids[0] ?? []).map((id, i) => ({
      id,
      score: 1 - (results.distances[0]?.[i] ?? 1), // cosine distance → similarity
      text: results.documents[0]?.[i] ?? '',
      noteId: String((results.metadatas[0]?.[i] as Record<string, unknown>)?.note_id ?? ''),
      blockId: String((results.metadatas[0]?.[i] as Record<string, unknown>)?.block_id ?? ''),
      title: String((results.metadatas[0]?.[i] as Record<string, unknown>)?.title ?? ''),
    }))
  },

  async deleteByNoteId(noteId: string): Promise<void> {
    const col = await getCollection()
    await col.delete({ where: { note_id: { $eq: noteId } } })
  },

  async deleteById(id: string): Promise<void> {
    const col = await getCollection()
    await col.delete({ ids: [id] })
  },
}
