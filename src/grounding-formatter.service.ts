import { Injectable } from '@angular/core';

interface GeminiGroundingMetadata {
  searchEntryPoint?: { renderedContent?: string };
  groundingChunks?: GeminiGroundingChunk[];
  groundingSupports?: GeminiGroundingSupport[];
  webSearchQueries: string[];
}

interface GeminiGroundingChunk {
  web?: { uri?: string; title?: string };
}

interface GeminiGroundingSupport {
  segment: { startIndex?: number; endIndex?: number; text?: string };
  groundingChunkIndices?: number[];
  confidenceScores?: number[];
}

interface GroundingInfo {
  metadata: GeminiGroundingMetadata;
}

@Injectable({
  providedIn: 'root',
})
export class GoogleSearchOutputParserService {
  // original source: https://github.com/langchain-ai/langchainjs/blob/193d1e969e121d7d397e61755deb59168d8f59a1/libs/langchain-google-common/src/output_parsers.ts (MIT License)

  constructor() {}

  private generationToGroundingInfo(response: any): GroundingInfo | undefined {
    const responseMetadata = response?.candidates?.[0]; // Get the first candidate
    const metadata = responseMetadata?.groundingMetadata;
    return metadata ? { metadata } : undefined;
  }

  private segmentSuffix(
    _grounding: GroundingInfo,
    support: GeminiGroundingSupport,
    _index: number
  ): string {
    const indices: number[] = (support.groundingChunkIndices ?? []).map(i => i + 1);
    return indices.length ? ` [${indices.join(", ")}]` : '';
  }

  private annotateSegment(
    text: string,
    grounding: GroundingInfo,
    support: GeminiGroundingSupport,
    index: number
  ): string {
    const start = support.segment.startIndex ?? 0;
    const end = support.segment.endIndex ?? 0;
    const textBefore = text.substring(0, start);
    const textSegment = text.substring(start, end);
    const textAfter = text.substring(end);
    const textSuffix = this.segmentSuffix(grounding, support, index);
    return textBefore + textSegment + textSuffix + textAfter;
  }

  private annotateTextSegments(text: string, grounding: GroundingInfo): string {
    if (!grounding.metadata.groundingSupports) return text;
    let annotatedText = text;
    // Iterate in reverse so that modifications don't affect later indices.
    for (let i = grounding.metadata.groundingSupports.length - 1; i >= 0; i--) {
      const support = grounding.metadata.groundingSupports[i];
      annotatedText = this.annotateSegment(annotatedText, grounding, support, i);
    }
    return annotatedText;
  }

  private chunkToString(chunk: GeminiGroundingChunk, index: number): string {
    const info = chunk.web;
    return info ? `${index + 1}. ${info.title ?? ''} - ${info.uri ?? ''}` : '';
  }

  private textSuffix(text: string, grounding: GroundingInfo): string {
    const chunks: GeminiGroundingChunk[] = grounding.metadata.groundingChunks ?? [];
    const chunksText = chunks
      .map((chunk, index) => this.chunkToString(chunk, index))
      .filter(chunkText => chunkText.length > 0)
      .join("\n");
    return chunksText ? "\n" + chunksText + "\n" : "\n";
  }

  private searchSuggestion(grounding: GroundingInfo): string {
    return grounding.metadata.searchEntryPoint?.renderedContent ?? "";
  }

  private annotateText(text: string, grounding: GroundingInfo): string {
    const body = this.annotateTextSegments(text, grounding);
    const suffix = this.textSuffix(text, grounding);
    return body + suffix;
  }

  parse(response: any): string {
    const text = response.text();
    const grounding = this.generationToGroundingInfo(response);
    if (!grounding) {
      return text;
    }
    return this.annotateText(text, grounding);
  }

  parseMarkdown(response: any): string {
    const text = response.text();
    const grounding = this.generationToGroundingInfo(response);
    if (!grounding) {
      return text;
    }
    return this.annotateTextMarkdown(text, grounding);
  }

  private annotateTextMarkdown(text: string, grounding: GroundingInfo): string {
    const body = this.annotateTextSegmentsMarkdown(text, grounding);
    const suffix = this.textSuffixMarkdown(text, grounding) ?? "";
    return body + suffix;
  }

  private chunkLink(grounding: GroundingInfo, index: number): string {
    if (!grounding.metadata.groundingChunks || grounding.metadata.groundingChunks.length <= index) return '';
    const chunk = grounding.metadata.groundingChunks[index];
    const url = chunk.web?.uri;
    if (!url) return '';
    return `[[${index + 1}](${url})]`;
  }

  private segmentSuffixMarkdown(
    grounding: GroundingInfo,
    support: GeminiGroundingSupport,
    _index: number
  ): string {
    const groundingChunkIndices = support.groundingChunkIndices ?? [];
    return groundingChunkIndices
      .map(chunkIndex => this.chunkLink(grounding, chunkIndex))
      .join('');
  }

  private annotateTextSegmentsMarkdown(text: string, grounding: GroundingInfo): string {
    if (!grounding.metadata.groundingSupports) return text;
    let annotatedText = text;
    for (let i = grounding.metadata.groundingSupports.length - 1; i >= 0; i--) {
      const support = grounding.metadata.groundingSupports[i];
      annotatedText = this.annotateSegmentMarkdown(annotatedText, grounding, support, i);
    }
    return annotatedText;
  }

  private annotateSegmentMarkdown(
    text: string,
    grounding: GroundingInfo,
    support: GeminiGroundingSupport,
    index: number
  ): string {
    const start = support.segment.startIndex ?? 0;
    const end = support.segment.endIndex ?? 0;
    const textBefore = text.substring(0, start);
    const textSegment = text.substring(start, end);
    const textAfter = text.substring(end);
    const textSuffix = this.segmentSuffixMarkdown(grounding, support, index);
    return textBefore + textSegment + textSuffix + textAfter;
  }

  private chunkSuffixLink(chunk: GeminiGroundingChunk, index: number): string {
    const num = index + 1;
    const info = chunk.web;
    if (!info || !info?.uri || !info?.title) return '';
    return `${num}. [${info.title}](${info.uri})`;
  }

  private textSuffixMarkdown(_text: string, grounding: GroundingInfo): string {
    if (!grounding.metadata.groundingChunks) return '';
    const chunksText = grounding.metadata.groundingChunks
      .map((chunk, index) => this.chunkSuffixLink(chunk, index))
      .filter(linkText => linkText.length > 0)
      .join('\n');
    const search = this.searchSuggestion(grounding);
    return chunksText ? `\n**Sources**\n${chunksText}\n\n${search}` : search;
  }
}