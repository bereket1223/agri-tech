"use client"

import { marked } from "marked"
import { memo, useMemo } from "react"
import ReactMarkdown from "react-markdown"

function parseMarkdownIntoBlocks(markdown: string): string[] {
  const tokens = marked.lexer(markdown)
  return tokens.map((token) => token.raw)
}

const MemoizedMarkdownBlock = memo(
  ({ content }: { content: string }) => {
    return <ReactMarkdown>{content}</ReactMarkdown>
  },
  (prevProps, nextProps) => {
    // Only re-render if content has changed
    return prevProps.content === nextProps.content
  },
)
MemoizedMarkdownBlock.displayName = "MemoizedMarkdownBlock"

export const MemoizedMarkdown = memo(({ content, id }: { content: string; id: string }) => {
  const blocks = useMemo(() => parseMarkdownIntoBlocks(content), [content])

  return (
    <>
      {blocks.map((block, index) => (
        <MemoizedMarkdownBlock content={block} key={`${id}-block_${index}`} />
      ))}
    </>
  )
})
MemoizedMarkdown.displayName = "MemoizedMarkdown"
