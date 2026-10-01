// ============================================================
// Danh mục chi nhánh dùng chung — nguồn thật duy nhất:
// GET /api/branches qua api-gateway (organization-service).
// Không hardcode HN-1/HN-2/ĐN-1 trong components.
// ============================================================
import { apiGet } from "./api";

export interface BranchOption {
  slug: string;
  name: string;
}

export async function fetchBranchOptions(): Promise<BranchOption[]> {
  try {
    const rows = await apiGet<Array<{ slug?: string; branchSlug?: string; name?: string }>>(
      "/api/branches"
    );
    return (rows || [])
      .map((b) => ({
        slug: String(b.slug || b.branchSlug || "").toUpperCase(),
        name: String(b.name || ""),
      }))
      .filter((b) => b.slug);
  } catch {
    return [];
  }
}
