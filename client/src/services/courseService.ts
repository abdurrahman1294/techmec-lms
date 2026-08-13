import api from "./api";

export const getCourses = async (publishedOnly = false) => {
  const response = await api.get(
    publishedOnly ? "/courses?published=true" : "/courses"
  );
  return response.data.data;
};

export const getCourseById = async (id: number) => {
  const response = await api.get(`/courses/${id}`);
  return response.data.data;
};

export type CoursePayload = {
  title: string;
  description: string;
  category?: string;
  price?: number;
  thumbnailUrl?: string;
  learningObjectives?: string[] | string;
  isPublished?: boolean;
};

export const createCourse = async (payload: CoursePayload) => {
  const response = await api.post("/courses", payload);
  return response.data.data;
};

export const updateCourse = async (
  id: number,
  payload: CoursePayload
) => {
  const response = await api.put(`/courses/${id}`, payload);
  return response.data.data;
};

export const deleteCourse = async (id: number) => {
  const response = await api.delete(`/courses/${id}`);
  return response.data;
};

export const getCourseStudents = async (courseId: number) => {
  const response = await api.get(`/courses/${courseId}/students`);
  return response.data.data;
};

export const getLessons = async (courseId: number) => {
  const response = await api.get(`/courses/${courseId}/lessons`);
  return response.data.data;
};

export const createLesson = async (
  courseId: number,
  title: string,
  content: string
) => {
  const response = await api.post(`/courses/${courseId}/lessons`, {
    title,
    content,
  });
  return response.data.data;
};

export const deleteLesson = async (lessonId: number) => {
  const response = await api.delete(`/lessons/${lessonId}`);
  return response.data;
};
