import "server-only";

import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const KNOWLEDGE_DIRECTORY = path.join(
  process.cwd(),
  "src/server/services/ai-assistant/knowledge",
);

const KNOWLEDGE_RETRIEVAL_LIMIT = 5;
const MIN_QUERY_TOKEN_LENGTH = 3;
const DOCUMENT_TITLE_REGEX = /^#\s+(.+)$/m;
const SECTION_HEADING_REGEX = /^##\s+(.+)$/;
const TOKEN_REGEX = /[\p{L}\p{N}]+/gu;

type KnowledgeDocument = {
  title: string;
  relativePath: string;
  content: string;
};

type KnowledgeChunk = {
  documentTitle: string;
  documentPath: string;
  sectionTitle: string;
  text: string;
};

export type AssistantKnowledgeSnippet = KnowledgeChunk & {
  score: number;
};

export type AssistantKnowledgeRetrievalContext = {
  status: "matched" | "empty-query" | "no-match" | "unavailable";
  query: string;
  reason: string | null;
  snippets: AssistantKnowledgeSnippet[];
};

export async function retrieveAssistantKnowledgeContexts({
  query,
}: {
  query: string;
}): Promise<AssistantKnowledgeRetrievalContext> {
  const normalizedQuery = query.trim();
  const queryTokens = tokenize(normalizedQuery);

  if (queryTokens.length === 0) {
    return {
      status: "empty-query",
      query: normalizedQuery,
      reason: "The conversation did not contain searchable knowledge intent.",
      snippets: [],
    };
  }

  try {
    const documents = await readKnowledgeDocuments();
    const chunks = documents.flatMap(createKnowledgeChunks);
    const snippets = chunks
      .map((chunk) => ({
        ...chunk,
        score: scoreChunk(chunk, queryTokens),
      }))
      .filter((chunk) => chunk.score > 0)
      .sort((left, right) => right.score - left.score)
      .slice(0, KNOWLEDGE_RETRIEVAL_LIMIT);

    if (snippets.length === 0) {
      return {
        status: "no-match",
        query: normalizedQuery,
        reason: "No relevant saved knowledge snippets matched the query.",
        snippets: [],
      };
    }

    return {
      status: "matched",
      query: normalizedQuery,
      reason: null,
      snippets,
    };
  } catch {
    return {
      status: "unavailable",
      query: normalizedQuery,
      reason: "Saved knowledge documents could not be read.",
      snippets: [],
    };
  }
}

async function readKnowledgeDocuments(): Promise<KnowledgeDocument[]> {
  const fileNames = await readdir(KNOWLEDGE_DIRECTORY);
  const markdownFileNames = fileNames.filter((fileName) =>
    fileName.endsWith(".md"),
  );

  return Promise.all(
    markdownFileNames.map(async (fileName) => {
      const relativePath = path.join(
        "src/server/services/ai-assistant/knowledge",
        fileName,
      );
      const content = await readFile(
        path.join(KNOWLEDGE_DIRECTORY, fileName),
        "utf8",
      );

      return {
        title: getDocumentTitle(content) ?? fileName,
        relativePath,
        content,
      };
    }),
  );
}

function createKnowledgeChunks(document: KnowledgeDocument): KnowledgeChunk[] {
  const chunks: KnowledgeChunk[] = [];
  const lines = document.content.split(/\r?\n/);
  let sectionTitle = document.title;
  let tableHeaders: string[] | null = null;
  let proseBuffer: string[] = [];

  const flushProseBuffer = () => {
    const text = proseBuffer.join("\n").trim();

    if (text) {
      chunks.push({
        documentTitle: document.title,
        documentPath: document.relativePath,
        sectionTitle,
        text,
      });
    }

    proseBuffer = [];
  };

  for (const line of lines) {
    const headingMatch = SECTION_HEADING_REGEX.exec(line);

    if (headingMatch?.[1]) {
      flushProseBuffer();
      sectionTitle = headingMatch[1].trim();
      tableHeaders = null;
      continue;
    }

    if (isMarkdownTableRow(line)) {
      const cells = parseMarkdownTableRow(line);

      if (cells.every((cell) => /^-+$/.test(cell))) {
        continue;
      }

      if (tableHeaders === null) {
        flushProseBuffer();
        tableHeaders = cells;
        continue;
      }

      chunks.push({
        documentTitle: document.title,
        documentPath: document.relativePath,
        sectionTitle,
        text: [
          `Область або розділ: ${sectionTitle}`,
          ...cells.map((cell, index) => {
            const header = tableHeaders?.[index] ?? `Поле ${index + 1}`;

            return `${header}: ${cell}`;
          }),
        ].join("\n"),
      });
      continue;
    }

    tableHeaders = null;

    if (line.trim()) {
      proseBuffer.push(line);
    } else {
      flushProseBuffer();
    }
  }

  flushProseBuffer();

  return chunks;
}

function scoreChunk(chunk: KnowledgeChunk, queryTokens: string[]) {
  const text = normalizeText(
    [
      chunk.documentTitle,
      chunk.documentPath,
      chunk.sectionTitle,
      chunk.text,
    ].join(" "),
  );

  return queryTokens.reduce((score, token) => {
    if (text.includes(token)) {
      return score + (chunk.sectionTitle.toLowerCase().includes(token) ? 3 : 1);
    }

    return score;
  }, 0);
}

function getDocumentTitle(content: string) {
  return DOCUMENT_TITLE_REGEX.exec(content)?.[1]?.trim() ?? null;
}

function isMarkdownTableRow(line: string) {
  const trimmedLine = line.trim();

  return trimmedLine.startsWith("|") && trimmedLine.endsWith("|");
}

function parseMarkdownTableRow(line: string) {
  return line
    .trim()
    .slice(1, -1)
    .split("|")
    .map((cell) => cell.trim());
}

function tokenize(text: string) {
  const tokens = normalizeText(text).matchAll(TOKEN_REGEX);

  return Array.from(new Set(Array.from(tokens, ([token]) => token)))
    .map((token) => token.trim())
    .filter((token) => token.length >= MIN_QUERY_TOKEN_LENGTH);
}

function normalizeText(text: string) {
  return text
    .toLocaleLowerCase("uk-UA")
    .normalize("NFKC")
    .replace(/['ʼ`]/g, "");
}
