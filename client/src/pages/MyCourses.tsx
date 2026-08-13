import { useEffect, useState } from "react";
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
        setCourses(data);
      } catch (error) {
        console.error(error);
        alert("Failed to load your courses.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <h2 style={{ padding: 20 }}>Loading...</h2>;

  return (
    <div style={{ maxWidth: 900, margin: "30px auto", padding: 20 }}>
      <h1>My Courses</h1>
      {courses.length === 0 ? (
        <p>You have not enrolled in any courses yet.</p>
      ) : (
        courses.map((enrollment) => (
          <CourseCard
            key={enrollment.id}
            id={enrollment.course.id}
            title={enrollment.course.title}
            description={enrollment.course.description}
            instructor={enrollment.course.instructor.name}
            price={enrollment.course.price}
            progressPercent={enrollment.progressPercent}
            learnLink
          />
        ))
      )}
    </div>
  );
}
