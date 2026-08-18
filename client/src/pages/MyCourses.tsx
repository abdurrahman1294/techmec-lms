import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { getMyCourses } from "../services/enrollmentService";
import CourseCard from "../components/CourseCard";

interface Enrollment {
  id: number;
  progressPercent: number;
  course: {
    id: number;
    title: string;
    description: string;
    price?: number;
    instructor: {
      id: number;
      name: string;
      email: string;
    };
  };
}

export default function MyCourses() {
  const [courses, setCourses] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getMyCourses();
        setCourses(data || []);
      } catch (error: any) {
        toast.error(
          error.response?.data?.message || "Failed to load your courses."
        );
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <h2 style={{ padding: 20 }}>Loading your courses...</h2>;

  return (
    <div style={{ maxWidth: 900, margin: "30px auto", padding: 20 }}>
      <h1>My Courses</h1>
      <p style={{ color: "#64748b" }}>
        Courses you have purchased or enrolled in. Open a course to continue
        learning and update your progress.
      </p>

      {courses.length === 0 ? (
        <div
          style={{
            padding: 24,
            background: "#f8fafc",
            borderRadius: 8,
            border: "1px dashed #cbd5e1",
            marginTop: 16,
          }}
        >
          <p style={{ margin: 0, fontWeight: 600 }}>No enrollments yet</p>
          <p style={{ margin: "8px 0 12px", color: "#64748b" }}>
            Browse the catalogue, add a course to your cart, and complete
            checkout to get access here.
          </p>
          <Link to="/courses">
            <button>Browse courses</button>
          </Link>
        </div>
      ) : (
        courses.map((enrollment) => (
          <div key={enrollment.id} style={{ marginBottom: 8 }}>
            <CourseCard
              id={enrollment.course.id}
              title={enrollment.course.title}
              description={enrollment.course.description}
              instructor={enrollment.course.instructor.name}
              price={enrollment.course.price}
              progressPercent={enrollment.progressPercent}
              learnLink
            />
            <div className="progress-bar-outer">
              <div
                className="progress-bar-inner"
                style={{ width: `${enrollment.progressPercent || 0}%` }}
              />
            </div>
          </div>
        ))
      )}
    </div>
  );
}
