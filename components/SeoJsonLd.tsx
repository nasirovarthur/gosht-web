type JsonLdValue = Record<string, unknown> | Array<Record<string, unknown>>

export default function SeoJsonLd({ data }: { data: JsonLdValue }) {
  return (
    <script
      type="application/ld+json"
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
