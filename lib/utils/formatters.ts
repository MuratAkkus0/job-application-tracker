export function formatJobTags(tags: string | undefined) {
  if (!tags) return undefined;
  return (
    tags
      ?.split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0) || []
  );
}
