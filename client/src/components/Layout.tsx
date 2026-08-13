import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import { AiAssistantWidget } from "./AiAssistantWidget";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Layout() {
  return (
    <div>
      <Navbar />
      <main>
        <Outlet />
      </main>
      <AiAssistantWidget />
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}
