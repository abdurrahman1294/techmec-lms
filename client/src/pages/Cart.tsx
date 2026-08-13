import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import {
  getCart,
  removeFromCart,
  checkout,
} from "../services/cartService";

interface CartItem {
  id: number;
  courseId: number;
  Course: {
    id: number;
    title: string;
    description: string;
    price: number;
    instructor: { name: string };
  };
}

export default function Cart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);
  const navigate = useNavigate();

  const load = async () => {
    try {
      const data = await getCart();
      setItems(data);
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Failed to load cart.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleRemove = async (courseId: number) => {
    try {
      await removeFromCart(courseId);
      toast.success("Removed from cart.");
      load();
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Remove failed.");
    }
  };

  const handleCheckout = async () => {
    if (items.length === 0) return;
    setCheckingOut(true);
    try {
      await checkout();
      toast.success(
        "Simulated payment successful! You are now enrolled."
      );
      navigate("/my-courses");
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Checkout failed.");
    } finally {
      setCheckingOut(false);
    }
  };

  const total = items.reduce(
    (s, i) => s + (i.Course?.price ?? 0),
    0
  );

  if (loading) return <h2 style={{ padding: 20 }}>Loading cart...</h2>;

  return (
    <div style={{ maxWidth: 800, margin: "30px auto", padding: 20 }}>
      <h1>Shopping Cart</h1>
      <p style={{ color: "#666" }}>
        Simulated payment — no real card details are collected.
      </p>

      {items.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          {items.map((item) => (
            <div
              key={item.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: 8,
                padding: 16,
                marginBottom: 12,
              }}
            >
              <h3>{item.Course.title}</h3>
              <p>{item.Course.description}</p>
              <p>
                <strong>Instructor:</strong>{" "}
                {item.Course.instructor?.name}
              </p>
              <p>
                <strong>Price:</strong> $
                {Number(item.Course.price).toFixed(2)}
              </p>
              <button onClick={() => handleRemove(item.Course.id)}>
                Remove
              </button>
            </div>
          ))}

          <div style={{ marginTop: 20 }}>
            <h2>Total: ${total.toFixed(2)}</h2>
            <button
              onClick={handleCheckout}
              disabled={checkingOut}
              style={{
                padding: "12px 24px",
                fontSize: 16,
                background: "#2563eb",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
              }}
            >
              {checkingOut
                ? "Processing..."
                : "Confirm Simulated Payment"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
