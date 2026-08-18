import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
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
      setItems(data || []);
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
        "Payment simulated successfully! You are now enrolled."
      );
      navigate("/my-courses");
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Checkout failed.");
    } finally {
      setCheckingOut(false);
    }
  };

  const total = items.reduce((s, i) => s + (i.Course?.price ?? 0), 0);

  if (loading) return <h2>Loading cart...</h2>;

  return (
    <div>
      <h1>Shopping Cart</h1>
      <p style={{ color: "#64748b" }}>
        Simulated payment — no real card details are collected.
      </p>

      {items.length === 0 ? (
        <div className="course-card">
          <p style={{ margin: 0, fontWeight: 600 }}>Your cart is empty</p>
          <p style={{ margin: "8px 0 12px", color: "#64748b" }}>
            Add a published course from the catalogue, then return here to
            checkout.
          </p>
          <Link to="/courses">
            <button type="button" className="btn btn-primary">
              Browse courses
            </button>
          </Link>
        </div>
      ) : (
        <>
          {items.map((item) => (
            <div key={item.id} className="course-card">
              <h3>{item.Course.title}</h3>
              <p className="course-description">{item.Course.description}</p>
              <p>
                <strong>Instructor:</strong> {item.Course.instructor?.name}
              </p>
              <p className="course-price">
                <strong>Price:</strong> $
                {Number(item.Course.price).toFixed(2)}
              </p>
              <div className="course-actions">
                <button
                  type="button"
                  className="delete-btn"
                  onClick={() => handleRemove(item.Course.id)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}

          <div className="course-card">
            <h2 style={{ marginTop: 0 }}>Total: ${total.toFixed(2)}</h2>
            <button
              type="button"
              className="btn btn-success"
              onClick={handleCheckout}
              disabled={checkingOut}
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
