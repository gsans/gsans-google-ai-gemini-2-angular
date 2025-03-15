export namespace GoogleAI {
  export enum Model {
    // Official Models
    Gemini20Flash = "gemini-2.0-flash",
    Gemini20Flash001 = 'gemini-2.0-flash-001',
    Gemini20FlashLitePreview = "gemini-2.0-flash-lite-preview-02-05",
    Gemini20ProExp = 'gemini-2.0-pro-exp-02-05',
    // Note: gemini-2.0-flash-thinking-exp-01-21 is using a different API
    Gemini15Flash = 'gemini-1.5-flash-002',
    
    //Preview Models
    Gemini20FlashExp = 'gemini-2.0-flash-exp',
    Gemini15ProExp = 'gemini-1.5-pro-002',
  }
  export enum Embeddings {
    TextEmbedding004 = 'text-embedding-004',
    TextEmbedding005 = 'text-embedding-005',
    TextMultilingualEmbedding002 = 'text-multilingual-embedding-002',
    TextEmbeddingLargeExp0307 = 'text-embedding-large-exp-03-07',
  }
}
