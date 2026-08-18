import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import CourseCard from "../components/CourseCard";
import CourseForm from "../components/CourseForm";
import type { CourseFormValues } from "../components/CourseForm";
import {
  getCourses,
  createCourse,
  updateCourse,
  deleteCourse,
} from "../services/courseService";
import { addToCart } from "../services/cartService";
import { useAuth } from "../context/AuthContext";

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
}

export default function Courses() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);

  const isStaff =
    user?.role === "ADMIN" || user?.role === "INSTRUCTOR";

  const loadCourses = async () => {
    try {
      const data = await getCourses(!isStaff);
      setCourses(data || []);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to load courses."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    loadCourses();
  }, [user?.role]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    courses.forEach((c) => {
      if (c.category) set.add(c.category);
    });
    return Array.from(set).sort();
  }, [courses]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return courses.filter((c) => {
      const matchesSearch =
        !q ||
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        (c.instructor?.name || "").toLowerCase().includes(q);
      const matchesCat =
        categoryFilter === "ALL" || c.category === categoryFilter;
      return matchesSearch && matchesCat;
    });
  }, [courses, search, categoryFilter]);

  const handleCreate = async (values: CourseFormValues) => {
    try {
      await createCourse({
        ...values,
        learningObjectives: values.learningObjectives
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
      });
      toast.success("Course created successfully!");
      loadCourses();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to create course."
      );
    }
  };

  const handleUpdate = async (values: CourseFormValues) => {
    if (!editingCourse) return;
    try {
      await updateCourse(editingCourse.id, {
        ...values,
        learningObjectives: values.learningObjectives
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
      });
      toast.success("Course updated successfully!");
      setEditingCourse(null);
      loadCourses();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to update course."
      );
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this course?")) return;
    try {
      await deleteCourse(id);
      toast.success("Course deleted successfully!");
      loadCourses();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to delete course."
      );
    }
  };

  const handleAddToCart = async (id: number) => {
    try {
      await addToCart(id);
      toast.success("Added to cart!");
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Could not add to cart."
      );
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: "30px auto", padding: 20 }}>
      <h1>Courses</h1>
      <p style={{ color: "#64748b" }}>
        {isStaff
          ? "Create, edit, and publish courses. Students only see published courses."
          : "Browse published courses and add them to your cart."}
      </p>

      {isStaff && (
        <>
          <CourseForm
            buttonText={editingCourse ? "Update" : "Create"}
            initial={
              editingCourse
                ? {
                    title: editingCourse.title,
                    description: editingCourse.description,
                    category: editingCourse.category ?? "General",
                    price: editingCourse.price ?? 0,
                    thumbnailUrl: editingCourse.thumbnailUrl ?? "",
                    learningObjectives: (
                      editingCourse.learningObjectives ?? []
                    ).join("\n"),
                    isPublished: editingCourse.isPublished ?? false,
                  }
                : null
            }
            onSubmit={editingCourse ? handleUpdate : handleCreate}
          />
          {editingCourse && (
            <button type="button" className="btn btn-secondary" onClick={() => setEditingCourse(null)}>
              Cancel Editing
            </button>
          )}
          <hr style={{ margin: "30px 0" }} />
        </>
      )}

      <div className="search-bar">
        <input
          type="search"
          placeholder="Search by title, description, or instructor..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="ALL">All categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p>Loading courses...</p>
      ) : filtered.length === 0 ? (
        <div
          style={{
            padding: 24,
            background: "#f8fafc",
            borderRadius: 8,
            border: "1px dashed #cbd5e1",
          }}
        >
          <p style={{ margin: 0, fontWeight: 600 }}>No courses found</p>
          <p style={{ margin: "8px 0 0", color: "#64748b" }}>
            {courses.length === 0
              ? isStaff
                ? "Create your first course using the form above."
                : "No published courses yet. Check back soon."
              : "Try a different search or category filter."}
          </p>
        </div>
      ) : (
        filtered.map((course) => (
          <CourseCard
            key={course.id}
            id={course.id}
            title={course.title}
            description={course.description}
            instructor={course.instructor.name}
            price={course.price}
            category={course.category}
            isPublished={course.isPublished}
            canEdit={
              user?.role === "ADMIN" ||
              (user?.role === "INSTRUCTOR" &&
                user.id === course.instructor.id)
            }
            canDelete={
              user?.role === "ADMIN" ||
              (user?.role === "INSTRUCTOR" &&
                user.id === course.instructor.id)
            }
            canAddToCart={user?.role === "STUDENT"}
            onEdit={() => setEditingCourse(course)}
            onDelete={handleDelete}
            onAddToCart={handleAddToCart}
          />
        ))
      )}
    </div>
  );
}
