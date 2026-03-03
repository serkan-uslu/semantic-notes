import { ChromaClient, Collection } from 'chromadb'

// ─── ChromaDB Client ──────────────────────────────────────────────────────────

const CHROMA_URL = 'http://localhost:8000'
const COLLECTION_NAME = 'semantic_notes'

let client: ChromaClient | null = null
let collection: Collection | null = null

async function getCollection(): Promise<Collection> {
  if (!client) {
    client = new ChromaClient({ path: CHROMA_URL })
    collection = null // reset when client is recreated
  }
  if (!collection) {
    collection = await client.getOrCreateCollection({
      name: COLLECTION_NAME,
      metadata: { 'hnsw:space': 'cosine' },
    })
  }
  return collection
}

// ─── Vector Store Service ─────────────────────────────────────────────────────

export const vectorService = {
  /**
   * Check if ChromaDB is reachable via direct HTTP heartbeat.
   * Uses /api/v2/heartbeat to avoid chromadb JS client version incompatibilities.
   */
  async isOnline(): Promise<boolean> {
    try {
      const res = await fetch(`${CHROMA_URL}/api/v2/heartbeat`)
      return res.ok
    } catch {
      return false
    }
  },

  /**
   * Upsert embedding for a chunk
   */
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

  /**
   * Query for similar chunks
   */
  async query(params: {
    embedding: number[]
    limit?: number
    where?: Record<string, unknown>
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
      where: params.where as Record<string, string | number | boolean>,
    })

    return (results.ids[0] ?? []).map((id, i) => ({
      id,
      score: 1 - (results.distances?.[0]?.[i] ?? 1), // cosine similarity
      text: results.documents?.[0]?.[i] ?? '',
      noteId: String((results.metadatas?.[0]?.[i] as Record<string, unknown>)?.note_id ?? ''),
      blockId: String((results.metadatas?.[0]?.[i] as Record<string, unknown>)?.block_id ?? ''),
      title: String((results.metadatas?.[0]?.[i] as Record<string, unknown>)?.title ?? ''),
    }))
  },

  /**
   * Delete all embeddings related to a note
   */
  async deleteByNoteId(noteId: string): Promise<void> {
    const col = await getCollection()
    await col.delete({ where: { note_id: noteId } })
  },

  /**
   * Delete a specific embedding by ID
   */
  async deleteById(id: string): Promise<void> {
    const col = await getCollection()
    await col.delete({ ids: [id] })
  },
}
