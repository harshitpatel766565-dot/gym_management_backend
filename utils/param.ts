export const getParam = (
  params: any,
  key: string
): string => {
  if (!params) return "";
  const value = params[key];
  if (Array.isArray(value)) {
    const first = value[0];
    return typeof first === "string" ? first : "";
  }
  return typeof value === "string" ? value : "";
};
