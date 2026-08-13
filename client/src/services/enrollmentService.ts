import api from "./api";

export const enrollCourse = async (courseId: number) => {
  const response = await api.post(`/enrollments/${courseId}`);
  return response.data;
};

export const getMyCourses = async () => {
  const response = await api.get("/enrollments/my-courses");
  return response.data.data;
};

export const completeLesson = async (
  courseId: number,
  lessonId: number
) => {
  const response = await api.post(
    `/enrollments/${courseId}/lessons/${lessonId}/complete`
  );
  return response.data.data;
};

export const getCourseProgress = async (courseId: number) => {
  const response = await api.get(`/enrollments/${courseId}/progress`);
  return response.data.data;
};
