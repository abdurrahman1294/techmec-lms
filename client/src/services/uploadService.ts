import api from "./api";

/**
 * Upload a course thumbnail image.
 * Returns a path like /uploads/.... that the backend serves statically.
 * Frontend should prefix with API origin when displaying (http://localhost:5000).
 */
export const uploadThumbnail = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("thumbnail", file);

  const response = await api.post("/upload/thumbnail", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data.data.thumbnailUrl as string;
};

/** Build a full URL for a stored thumbnail path or external URL. */
export const resolveThumbnailUrl = (url?: string | null): string | undefined => {
  if (!url) return undefined;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const base = (api.defaults.baseURL || "http://localhost:5000/api").replace(
    /\/api\/?$/,
    ""
  );
  return `${base}${url.startsWith("/") ? url : `/${url}`}`;
};
