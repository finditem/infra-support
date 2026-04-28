export const apisQueryKeys = {
  all: ["apis"] as const,
  list: () => [...apisQueryKeys.all, "list"] as const,
  detail: (apiId: string) => [...apisQueryKeys.all, "detail", apiId] as const,
};
