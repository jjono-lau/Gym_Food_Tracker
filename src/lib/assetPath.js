const repoName = process.env.NEXT_PUBLIC_REPO_NAME || "";
const basePath = process.env.NODE_ENV === "production" && repoName ? `/${repoName}` : "";

export default function assetPath(path) {
  return `${basePath}${path}`;
}
