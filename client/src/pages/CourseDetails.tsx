import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";
import { addToCart } from "../services/cartService";
import { createLesson, deleteLesson } from "../services/courseService";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import { resolveThumbnailUrl } from "../services/uploadService";

interface Lesson {
  id: number;
  title: string;
  sortOrder: number;
}

interface Course {
  id: number;
  title: string;
  description: string;
  category?: string;
  price?: number;
  thumbnailUrl?: string | null;
  learningObjectives?: string[];
  isPublished?: boolean;
  instructor: {
    id: number;
    name: string;
    email: string;
  };
  lessons?: Lesson[];
}

export default function CourseDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonContent, setLessonContent] = useState("");

  const loadCourse = async () => {
    try {
      const response = await api.get(`/courses/${id}`);
      setCourse(response.data.data);
    } catch {
      toast.error("Failed to load course.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourse();
  }, [id]);

  const handleAddToCart = async () => {
    if (!course) return;
    try {
      await addToCart(course.id);
      toast.success("Added to cart!");
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ?? "Could not add to cart."
      );
    }
  };

  const handleAddLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!course || !lessonTitle.trim() || !lessonContent.trim()) return;
    try {
      await createLesson(course.id, lessonTitle.trim(), lessonContent.trim());
      toast.success("Lesson added.");
      setLessonTitle("");
      setLessonContent("");
      loadCourse();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to add lesson.");
    }
  };

  const handleDeleteLesson = async (lessonId: number) => {
    try {
      await deleteLesson(lessonId);
      toast.success("Lesson deleted.");
      loadCourse();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Delete failed.");
    }
  };

  const canManage =
    user &&
    (user.role === "ADMIN" ||
      (user.role === "INSTRUCTOR" &&
        course &&
        user.id === course.instructor.id));

  if (loading) return <h2 style={{ padding: 20 }}>Loading...</h2>;
  if (!course) return <h2 style={{ padding: 20 }}>Course not found.</h2>;

  return (
    <div style={{ maxWidth: 900, margin: "40px auto", padding: 20 }}>
      {course.thumbnailUrl && (
        <img
          src={resolveThumbnailUrl(course.thumbnailUrl)}
          alt=""
          style={{ maxWidth: "100%", maxHeight: 240, borderRadius: 8 }}
        />
      )}
      <h1>{course.title}</h1>
      <p>
        <strong>Instructor:</strong> {course.instructor.name}
      </p>
      {course.category && (
        <p>
          <strong>Category:</strong> {course.category}
        </p>
      )}
      <p>
        <strong>Price:</strong> ${Number(course.price ?? 0).toFixed(2)}
      </p>
      <p>
        <strong>Status:</strong>{" "}
        {course.isPublished ? "Published" : "Draft"}
      </p>
      <hr />
      <h3>Description</h3>
      <p>{course.description}</p>

      {course.learningObjectives &&
        course.learningObjectives.length > 0 && (
          <>
            <h3>Learning Objectives</h3>
            <ul>
              {course.learningObjectives.map((o, i) => (
                <li key={i}>{o}</li>
              ))}
            </ul>
          </>
        )}

      <h3>Lessons ({course.lessons?.length ?? 0})</h3>
      <ul>
        {(course.lessons ?? []).map((l) => (
          <li key={l.id}>
            {l.sortOrder}. {l.title}{" "}
            {canManage && (
              <button
                onClick={() => handleDeleteLesson(l.id)}
                style={{ marginLeft: 8 }}
              >
                Delete
              </button>
            )}
          </li>
        ))}
      </ul>

      {user?.role === "STUDENT" && course.isPublished && (
        <button type="button" className="btn btn-success" onClick={handleAddToCart} style={{ marginRight: 8 }}>Add to Cart</button>
      )}

      {canManage && (
        <div style={{ marginTop: 24, borderTop: "1px solid #ddd", paddingTop: 16 }}>
          <h3>Add Lesson</h3>
          <form onSubmit={handleAddLesson}>
            <input
              type="text"
              placeholder="Lesson title"
              value={lessonTitle}
              onChange={(e) => setLessonTitle(e.target.value)}
              required
              style={{ width: "100%", padding: 8, marginBottom: 8 }}
            />
            <textarea
              placeholder="Lesson content"
              value={lessonContent}
              onChange={(e) => setLessonContent(e.target.value)}
              rows={5}
              required
              style={{ width: "100%", padding: 8, marginBottom: 8 }}
            />
            <button type="submit" className="btn btn-primary">Add Lesson</button>
          </form>
          <p style={{ marginTop: 12 }}>
            <Link to={`/courses/${course.id}/students`}>
              View enrolled students
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}
