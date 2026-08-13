import api from "./api";

export const getCart = async () => {
  const response = await api.get("/cart");
  return response.data.data;
};

export const addToCart = async (courseId: number) => {
  const response = await api.post("/cart", { courseId });
  return response.data.data;
};

export const removeFromCart = async (courseId: number) => {
  const response = await api.delete(`/cart/${courseId}`);
  return response.data;
};

export const checkout = async () => {
  const response = await api.post("/cart/checkout");
  return response.data;
};
