import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../services/api";
import CourseForm from "../components/CourseForm";
import type { CourseFormValues } from "../components/CourseForm";
import CourseCard from "../components/CourseCard";
import {
  createCourse,
  updateCourse,
  deleteCourse,
} from "../services/courseService";

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

  if (loading) return <h2>Loading...</h2>;

  return (
    <div>
      <h1>My Teaching</h1>
      <p style={{ color: "#64748b", marginBottom: 16 }}>
        Create and manage your courses. Publish them so students can purchase.
      </p>

      {editing ? (
        <div className="course-form-wrap">
          <h2>Edit course</h2>
          <CourseForm
            buttonText="Save changes"
            initial={{
              title: editing.title,
              description: editing.description,
              category: editing.category || "",
              price: editing.price ?? 0,
              thumbnailUrl: editing.thumbnailUrl || "",
              learningObjectives: (editing.learningObjectives || []).join("\n"),
              isPublished: !!editing.isPublished,
            }}
            onSubmit={handleUpdate}
          />
          <button
            type="button"
            className="btn btn-secondary"
            style={{ marginTop: 10 }}
            onClick={() => setEditing(null)}
          >
            Cancel
          </button>
        </div>
      ) : (
        <div className="course-form-wrap">
          <h2>Create course</h2>
          <CourseForm buttonText="Create" onSubmit={handleCreate} />
        </div>
      )}

      <hr />

      {courses.length === 0 ? (
        <div className="course-card">
          <p style={{ margin: 0, fontWeight: 600 }}>No courses yet</p>
          <p style={{ margin: "8px 0 0", color: "#64748b" }}>
            Use the form above to create your first course.
          </p>
        </div>
      ) : (
        courses.map((c) => (
          <div key={c.id}>
            <CourseCard
              id={c.id}
              title={c.title}
              description={c.description}
              instructor={c.instructor?.name || "You"}
              price={c.price}
              category={c.category}
              isPublished={c.isPublished}
              canEdit
              canDelete
              onEdit={() => setEditing(c)}
              onDelete={handleDelete}
            />
            <p style={{ marginTop: -8, marginBottom: 16, fontSize: 13, color: "#64748b" }}>
              Lessons: {c._count?.lessons ?? 0} · Enrollments:{" "}
              {c._count?.enrollments ?? 0}
              {" · "}
              <Link to={`/courses/${c.id}`}>Open / Lessons</Link>
              {" · "}
              <Link to={`/courses/${c.id}/students`}>Enrolled students</Link>
            </p>
          </div>
        ))
      )}
    </div>
  );
}
