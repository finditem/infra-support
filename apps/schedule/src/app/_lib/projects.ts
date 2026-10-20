import type { TasksRow } from "@/types/tables";

export type ProjectKey = TasksRow["project_key"];

export const PROJECTS: Array<{
  key: ProjectKey;
  label: string;
  shortLabel: string;
  color: string;
}> = [
  { key: "operations", label: "운영", shortLabel: "운영", color: "#2563eb" },
  { key: "mobile", label: "모바일", shortLabel: "모바일", color: "#7c3aed" },
  { key: "admin", label: "어드민", shortLabel: "어드민", color: "#d97706" },
  { key: "monitoring", label: "모니터링", shortLabel: "모니터링", color: "#059669" },
];

export const DEFAULT_PROJECT_KEY: ProjectKey = "operations";

export const getProject = (key: ProjectKey) =>
  PROJECTS.find((project) => project.key === key) ?? PROJECTS[0];
