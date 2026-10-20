export interface RecipePermission {
  permission: string;
  access: string;
  why: string;
}

export interface Recipe {
  id: "push" | "ci" | "release";
  title: string;
  description: string;
  fineGrained: RecipePermission[];
  classic: string[];
  notes: string[];
}

export const RECIPES: Recipe[] = [
  {
    id: "push",
    title: "Push code and open pull requests",
    description: "The smallest token that can clone, push branches and open pull requests.",
    fineGrained: [
      { permission: "Contents", access: "Read and write", why: "Clone, push commits and create branches." },
      { permission: "Pull requests", access: "Read and write", why: "Open, update and comment on pull requests." },
      { permission: "Metadata", access: "Read-only", why: "Required by GitHub for almost every repository request." },
    ],
    classic: ["repo"],
    notes: [
      "Limit repository access to the repositories you actually push to.",
      "Use the account's noreply email for commits to avoid exposing a personal address.",
    ],
  },
  {
    id: "ci",
    title: "Read code in CI",
    description: "For a workflow that checks out code, reads metadata and reports checks.",
    fineGrained: [
      { permission: "Contents", access: "Read-only", why: "Check out source code." },
      { permission: "Actions", access: "Read-only", why: "Read workflow and run metadata." },
      { permission: "Checks", access: "Read and write", why: "Publish check runs and annotations." },
      { permission: "Pull requests", access: "Read-only", why: "Read pull request metadata and changed files." },
      { permission: "Metadata", access: "Read-only", why: "Required by GitHub for almost every repository request." },
    ],
    classic: ["repo"],
    notes: [
      "Prefer the automatic GITHUB_TOKEN in Actions over a personal token.",
      "If you must use a PAT, scope it to a single repository and set an expiry date.",
    ],
  },
  {
    id: "release",
    title: "Publish a release and packages",
    description: "For cutting releases and publishing packages from CI.",
    fineGrained: [
      { permission: "Contents", access: "Read and write", why: "Create tags and releases." },
      { permission: "Packages", access: "Read and write", why: "Publish packages." },
      { permission: "Metadata", access: "Read-only", why: "Required by GitHub for almost every repository request." },
    ],
    classic: ["repo", "write:packages"],
    notes: [
      "Use an environment with required reviewers for release jobs.",
      "Set an expiry date and rotate the token after the release window.",
    ],
  },
];

export function getRecipe(id: string): Recipe | null {
  return RECIPES.find((recipe) => recipe.id === id) ?? null;
}
