export namespace GoogleAI {

  // Stable models: https://cloud.google.com/vertex-ai/generative-ai/docs/learn/model-versions
  // Experimental models: https://cloud.google.com/vertex-ai/generative-ai/docs/multimodal/gemini-experimental
  // Auto-updated models: automatically switch to the latest version. Eg: gemini-2.0-flash-001

  export enum Model {
    // Official Models
    Gemini20Flash = "gemini-2.0-flash", // Auto-updated
    Gemini20FlashLite = "gemini-2.0-flash-lite", // Auto-updated
    Gemini15Flash = 'gemini-1.5-flash', // Auto-updated

    // Experimental Models
    Gemini20ProExp = 'gemini-2.0-pro-exp-02-05',
    Gemini20FlashThinkingExp = 'gemini-2.0-flash-thinking-exp', // Auto-updated
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
