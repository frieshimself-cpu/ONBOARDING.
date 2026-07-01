// Loads every Markdown file in app/content/guides at build time.
// Drop a new .md file in that folder (with frontmatter) and it appears
// automatically in the sidebar + on the landing page.

export interface GuideMeta {
  slug: string
  title: string
  description: string
  order: number
}
export interface Guide extends GuideMeta {
  body: string
}

function parseFrontmatter(raw: string): { data: Record<string, string>; body: string } {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
  if (!m) return { data: {}, body: raw }
  const data: Record<string, string> = {}
  for (const line of m[1].split(/\r?\n/)) {
    const idx = line.indexOf(':')
    if (idx === -1) continue
    const key = line.slice(0, idx).trim()
    const val = line.slice(idx + 1).trim().replace(/^["']|["']$/g, '')
    data[key] = val
  }
  return { data, body: m[2] }
}

// eager + ?raw => each value is the file's string contents.
const modules = import.meta.glob('../../../content/guides/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

export const guides: Guide[] = Object.entries(modules)
  .map(([path, raw]) => {
    const slug = (path.split('/').pop() ?? 'guide').replace(/\.md$/, '')
    const { data, body } = parseFrontmatter(raw)
    return {
      slug,
      title: data.title ?? slug,
      description: data.description ?? '',
      order: Number(data.order ?? 999),
      body,
    }
  })
  .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title))

export function getGuide(slug?: string): Guide | undefined {
  if (!slug) return guides[0]
  return guides.find((g) => g.slug === slug)
}
