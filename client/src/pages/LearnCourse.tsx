import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  getCourseProgress,
  completeLesson,
} from "../services/enrollmentService";

interface Lesson {
  id: number;
  title: string;
  content: string;
  sortOrder: number;
}

export default function LearnCourse() {
  const { id } = useParams();
  const courseId = Number(id);

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [completed, setCompleted] = useState<number[]>([]);
  const [progress, setProgress] = useState(0);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const data = await getCourseProgress(courseId);
      setLessons(data.lessons || []);
      setCompleted(data.completedLessons || []);
      setProgress(data.progressPercent || 0);
      if (data.lessons?.length && !activeLesson) {
        setActiveLesson(data.lessons[0]);
      }
    } catch (e: any) {
      toast.error(
        e.response?.data?.message || "Failed to load course progress."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!Number.isNaN(courseId)) load();
  }, [courseId]);

  const handleComplete = async (lessonId: number) => {
    try {
      const updated = await completeLesson(courseId, lessonId);
      setCompleted(updated.completedLessons || []);
      setProgress(updated.progressPercent || 0);
      toast.success("Lesson marked complete!");
    } catch (e: any) {
      toast.error(
        e.response?.data?.message || "Could not mark complete."
      );
    }
  };

  if (loading) return <h2 style={{ padding: 20 }}>Loading...</h2>;

  return (
    <div style={{ maxWidth: 1000, margin: "30px auto", padding: 20 }}>
      <h1>Course Learning</h1>
      <div
        style={{
          background: "#e0f2fe",
          padding: 12,
          borderRadius: 8,
          marginBottom: 20,
        }}
      >
        <strong>Progress: {progress}%</strong>
        <div
          style={{
            height: 10,
            background: "#bae6fd",
            borderRadius: 5,
            marginTop: 8,
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: "100%",
              background: "#0284c7",
              borderRadius: 5,
            }}
          />
        </div>
      </div>

      <div style={{ display: "flex", gap: 24 }}>
        <div style={{ minWidth: 220 }}>
          <h3>Lessons</h3>
          {lessons.length === 0 && <p>No lessons yet.</p>}
          {lessons.map((l) => {
            const done = completed.includes(l.id);
            return (
              <button
                key={l.id}
                onClick={() => setActiveLesson(l)}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  marginBottom: 8,
                  padding: 10,
                  border: "1px solid #ddd",
                  borderRadius: 6,
                  background:
                    activeLesson?.id === l.id ? "#dbeafe" : "#fff",
                  cursor: "pointer",
                }}
              >
                {done ? "✅ " : "⬜ "}
                {l.sortOrder}. {l.title}
              </button>
            );
          })}
        </div>

        <div style={{ flex: 1 }}>
          {activeLesson ? (
            <>
              <h2>{activeLesson.title}</h2>
              <div
                style={{
                  whiteSpace: "pre-wrap",
                  marginBottom: 16,
                  lineHeight: 1.6,
                }}
              >
                {activeLesson.content}
              </div>
              {!completed.includes(activeLesson.id) && (
                <button
                  onClick={() => handleComplete(activeLesson.id)}
                  style={{
                    padding: "10px 18px",
                    background: "#16a34a",
                    color: "#fff",
                    border: "none",
                    borderRadius: 6,
                    cursor: "pointer",
                  }}
                >
                  Mark Complete
                </button>
              )}
              {completed.includes(activeLesson.id) && (
                <p style={{ color: "#16a34a" }}>✓ Completed</p>
              )}
            </>
          ) : (
            <p>Select a lesson to begin.</p>
          )}
        </div>
      </div>
    </div>
  );
}
