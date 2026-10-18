function toTransitionToken(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getPostTitleTransitionName(slug: string): string {
  return `blog-title-${slug}`;
}

export function getPostImageTransitionName(slug: string): string {
  return `blog-image-${slug}`;
}

export function getPostAuthorTransitionName(slug: string): string {
  return `blog-author-${slug}`;
}

export function getPostDateTransitionName(slug: string): string {
  return `blog-date-${slug}`;
}

export function getPostTagTransitionName(slug: string, tag: string): string {
  return `blog-tag-${slug}-${toTransitionToken(tag)}`;
}
