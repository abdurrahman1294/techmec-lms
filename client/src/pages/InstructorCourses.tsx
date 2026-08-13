import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../services/api";
import CourseForm from "../components/CourseForm";
import type { CourseFormValues } from "../components/CourseForm";
import { createCourse, updateCourse, deleteCourse } from "../services/courseService";

interface Course {
  id: number;
  title: string;
  description: string;
  category?: string;
  price?: number;
  thumbnailUrl?: string | null;
  learningObjectives?: string[];
  isPublished?: boolean;
  instructor: { id: number; name: string; email: string };
  _count?: { lessons: number; enrollments: number };
}

export default function InstructorCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [editing, setEditing] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await api.get("/instructor/courses");
      setCourses(res.data.data || []);
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Failed to load your courses.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (values: CourseFormValues) => {
    try {
      await createCourse({
        ...values,
        learningObjectives: values.learningObjectives
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
      });
      toast.success("Course created.");
      load();
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Create failed.");
    }
  };

  const handleUpdate = async (values: CourseFormValues) => {
    if (!editing) return;
    try {
      await updateCourse(editing.id, {
        ...values,
        learningObjectives: values.learningObjectives
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
      });
      toast.success("Course updated.");
      setEditing(null);
      load();
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Update failed.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this course?")) return;
    try {
      await deleteCourse(id);
      toast.success("Course deleted.");
      load();
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Delete failed.");
    }
  };

  if (loading) return <h2 style={{ padding: 20 }}>Loading...</h2>;

  return (
    <div style={{ maxWidth: 900, margin: "30px auto", padding: 20 }}>
      <h1>My Instructor Courses</h1>
      <p style={{ color: "#64748b" }}>
        Create, publish, edit, and manage lessons for courses you teach.
        Thumbnail is provided as a URL in this MVP (file upload is a future enhancement).
      </p>

      <CourseForm
        buttonText={editing ? "Update" : "Create"}
        initial={
          editing
            ? {
                title: editing.title,
                description: editing.description,
                category: editing.category ?? "General",
                price: editing.price ?? 0,
                thumbnailUrl: editing.thumbnailUrl ?? "",
                learningObjectives: (editing.learningObjectives ?? []).join("\n"),
                isPublished: editing.isPublished ?? false,
              }
            : null
        }
        onSubmit={editing ? handleUpdate : handleCreate}
      />
      {editing && (
        <button onClick={() => setEditing(null)} style={{ marginBottom: 16 }}>
          Cancel editing
        </button>
      )}

      <hr style={{ margin: "24px 0" }} />

      {courses.length === 0 ? (
        <p>You have not created any courses yet.</p>
      ) : (
        courses.map((c) => (
          <div
            key={c.id}
            style={{
              border: "1px solid #e2e8f0",
              borderRadius: 8,
              padding: 16,
              marginBottom: 12,
            }}
          >
            <h3>
              <Link to={`/courses/${c.id}`}>{c.title}</Link>
            </h3>
            <p>{c.description}</p>
            <p>
              <strong>Status:</strong>{" "}
              {c.isPublished ? "Published" : "Draft"} ·{" "}
              <strong>Price:</strong> ${Number(c.price ?? 0).toFixed(2)} ·{" "}
              <strong>Lessons:</strong> {c._count?.lessons ?? 0} ·{" "}
              <strong>Enrollments:</strong> {c._count?.enrollments ?? 0}
            </p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button onClick={() => setEditing(c)}>Edit</button>
              <button onClick={() => handleDelete(c.id)}>Delete</button>
              <Link to={`/courses/${c.id}`}>
                <button>Open / Lessons</button>
              </Link>
              <Link to={`/courses/${c.id}/students`}>
                <button>Enrolled students</button>
              </Link>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
