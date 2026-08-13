import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { uploadThumbnail } from "../services/uploadService";

export interface CourseFormValues {
  title: string;
  description: string;
  category: string;
  price: number;
  thumbnailUrl: string;
  learningObjectives: string;
  isPublished: boolean;
}

type CourseFormProps = {
  buttonText: string;
  onSubmit: (values: CourseFormValues) => void;
  initial?: Partial<CourseFormValues> | null;
};

export default function CourseForm({
  buttonText,
  onSubmit,
  initial = null,
}: CourseFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("General");
  const [price, setPrice] = useState("0");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [learningObjectives, setLearningObjectives] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!initial) return;
    setTitle(initial.title ?? "");
    setDescription(initial.description ?? "");
    setCategory(initial.category ?? "General");
    setPrice(String(initial.price ?? 0));
    setThumbnailUrl(initial.thumbnailUrl ?? "");
    setLearningObjectives(initial.learningObjectives ?? "");
    setIsPublished(initial.isPublished ?? false);
  }, [
    initial?.title,
    initial?.description,
    initial?.category,
    initial?.price,
    initial?.thumbnailUrl,
    initial?.learningObjectives,
    initial?.isPublished,
  ]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file (jpeg, png, webp, gif).");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be 2MB or smaller.");
      return;
    }

    setUploading(true);
    try {
      const url = await uploadThumbnail(file);
      setThumbnailUrl(url);
      toast.success("Thumbnail uploaded.");
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Thumbnail upload failed."
      );
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !description.trim()) {
      alert("Title and description are required.");
      return;
    }

    const parsedPrice = Number(price);
    if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
      alert("Price must be a non-negative number.");
      return;
    }

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      category: category.trim() || "General",
      price: parsedPrice,
      thumbnailUrl: thumbnailUrl.trim(),
      learningObjectives,
      isPublished,
    });

    if (buttonText.toLowerCase().includes("create")) {
      setTitle("");
      setDescription("");
      setCategory("General");
      setPrice("0");
      setThumbnailUrl("");
      setLearningObjectives("");
      setIsPublished(false);
    }
  };

  const fieldStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px",
    marginBottom: "12px",
    boxSizing: "border-box",
  };

  return (
    <div style={{ marginBottom: "30px" }}>
      <h2>{buttonText} Course</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Course Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          style={fieldStyle}
        />
        <textarea
          placeholder="Course Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          required
          style={fieldStyle}
        />
        <input
          type="text"
          placeholder="Category (e.g. Mechanical, CAD)"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={fieldStyle}
        />
        <input
          type="number"
          min="0"
          step="0.01"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          style={fieldStyle}
        />

        <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
          Course thumbnail
        </label>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleFileChange}
          disabled={uploading}
          style={{ marginBottom: 8 }}
        />
        {uploading && (
          <p style={{ color: "#64748b", marginBottom: 8 }}>Uploading...</p>
        )}
        <input
          type="url"
          placeholder="Or paste a thumbnail URL"
          value={thumbnailUrl}
          onChange={(e) => setThumbnailUrl(e.target.value)}
          style={fieldStyle}
        />
        {thumbnailUrl && (
          <p style={{ fontSize: 12, color: "#64748b", marginTop: -8 }}>
            Current: {thumbnailUrl}
          </p>
        )}

        <textarea
          placeholder="Learning objectives (one per line)"
          value={learningObjectives}
          onChange={(e) => setLearningObjectives(e.target.value)}
          rows={3}
          style={fieldStyle}
        />
        <label style={{ display: "block", marginBottom: "12px" }}>
          <input
            type="checkbox"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
          />{" "}
          Published (visible to students / purchasable)
        </label>
        <button type="submit" disabled={uploading}>
          {buttonText}
        </button>
      </form>
    </div>
  );
}
