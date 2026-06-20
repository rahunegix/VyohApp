function isHtmlContent(text: string): boolean {
  return /<[a-z][\s\S]*>/i.test(text);
}

export function StoryBody({ body }: { body: string }) {
  if (!body.trim()) return null;

  if (isHtmlContent(body)) {
    return (
      <div
        className="prose prose-sm max-w-none text-muted-foreground [&_a]:text-primary [&_a]:underline"
        dangerouslySetInnerHTML={{ __html: body }}
      />
    );
  }

  return (
    <div className="prose prose-sm max-w-none text-muted-foreground">
      {body.split("\n").map((paragraph, i) => (
        <p key={i} className="mb-4 leading-relaxed last:mb-0">
          {paragraph}
        </p>
      ))}
    </div>
  );
}
