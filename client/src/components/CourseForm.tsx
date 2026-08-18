import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { uploadThumbnail } from "../services/uploadService";
import "./CourseForm.css";

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
  /** Label for the submit button. Defaults to "Create". */
  buttonText?: string;
  onSubmit: (values: CourseFormValues) => void;
  initial?: Partial<CourseFormValues> | null;
};

export default function CourseForm({
  buttonText = "Create",
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
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!initial) return;
    setTitle(initial.title ?? "");
    setDescription(initial.description ?? "");
    setCategory(initial.category ?? "General");
    setPrice(String(initial.price ?? 0));
    setThumbnailUrl(initial.thumbnailUrl ?? "");
    setLearningObjectives(initial.learningObjectives ?? "");
    setIsPublished(initial.isPublished ?? false);
    setFileName("");
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

    setFileName(file.name);
    setUploading(true);
    try {
      const url = await uploadThumbnail(file);
      setThumbnailUrl(url);
      toast.success("Thumbnail uploaded.");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Thumbnail upload failed.");
      setFileName("");
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
      setFileName("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="course-form">
      <div className="form-field">
        <label htmlFor="course-title">Course title</label>
        <input
          id="course-title"
          type="text"
          placeholder="e.g. Database Management with SQL"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div className="form-field">
        <label htmlFor="course-description">Course description</label>
        <textarea
          id="course-description"
          placeholder="What will students learn?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          required
        />
      </div>

      <div className="form-row">
        <div className="form-field">
          <label htmlFor="course-category">Category</label>
          <input
            id="course-category"
            type="text"
            placeholder="e.g. Mechanical, CAD, Software"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
        </div>
        <div className="form-field">
          <label htmlFor="course-price">Price (₦ / $)</label>
          <input
            id="course-price"
            type="number"
            min="0"
            step="0.01"
            placeholder="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>
      </div>

      <div className="form-field">
        <label>Course thumbnail</label>
        <div className="file-upload-row">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleFileChange}
            disabled={uploading}
            className="file-input-hidden"
            id="course-thumbnail-file"
          />
          <button
            type="button"
            className="btn btn-secondary file-pick-btn"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
          >
            {uploading ? "Uploading…" : "Choose image"}
          </button>
          <span className="file-name">
            {fileName || (thumbnailUrl ? "Image selected" : "No file chosen")}
          </span>
        </div>
        {uploading && (
          <p className="field-hint">Uploading thumbnail…</p>
        )}
        <input
          type="url"
          placeholder="Or paste a thumbnail URL"
          value={thumbnailUrl}
          onChange={(e) => setThumbnailUrl(e.target.value)}
          className="mt-8"
        />
        {thumbnailUrl && (
          <p className="field-hint truncate">Current: {thumbnailUrl}</p>
        )}
      </div>

      <div className="form-field">
        <label htmlFor="course-objectives">Learning objectives (one per line)</label>
        <textarea
          id="course-objectives"
          placeholder={"Understand SQL joins\nWrite efficient queries\nDesign normalized schemas"}
          value={learningObjectives}
          onChange={(e) => setLearningObjectives(e.target.value)}
          rows={3}
        />
      </div>

      <label className="publish-label">
        <input
          type="checkbox"
          checked={isPublished}
          onChange={(e) => setIsPublished(e.target.checked)}
        />
        <span>Published (visible to students / purchasable)</span>
      </label>

      <button
        type="submit"
        className="btn btn-primary submit-btn"
        disabled={uploading}
      >
        {buttonText}
      </button>
    </form>
  );
}
