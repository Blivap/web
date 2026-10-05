type JsonLdProps = {
  data: Record<string, unknown> | Record<string, unknown>[];
};

/** Server-only JSON-LD injector. Do not add "use client". */
export function JsonLd({ data }: JsonLdProps) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
