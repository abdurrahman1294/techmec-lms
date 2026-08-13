import { Link } from "react-router-dom";
import "./CourseCard.css";

type CourseCardProps = {
  id: number;
  title: string;
  description: string;
  instructor: string;
  price?: number;
  category?: string;
  isPublished?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  canAddToCart?: boolean;
  canEnroll?: boolean;
  progressPercent?: number;
  onEdit?: () => void;
  onDelete?: (id: number) => void;
  onAddToCart?: (id: number) => void;
  onEnroll?: (id: number) => void;
  learnLink?: boolean;
};

export default function CourseCard({
  id,
  title,
  description,
  instructor,
  price,
  category,
  isPublished,
  canEdit,
  canDelete,
  canAddToCart,
  canEnroll,
  progressPercent,
  onEdit,
  onDelete,
  onAddToCart,
  onEnroll,
  learnLink,
}: CourseCardProps) {
  return (
    <div className="course-card" style={{ marginBottom: 16 }}>
      <h3>
        <Link to={`/courses/${id}`}>{title}</Link>
      </h3>
      <p>{description}</p>
      <p>
        <strong>Instructor:</strong> {instructor}
      </p>
      {category && (
        <p>
          <strong>Category:</strong> {category}
        </p>
      )}
      {price !== undefined && (
        <p>
          <strong>Price:</strong> ${Number(price).toFixed(2)}
        </p>
      )}
      {isPublished !== undefined && (
        <p>
          <strong>Status:</strong>{" "}
          {isPublished ? "Published" : "Draft"}
        </p>
      )}
      {progressPercent !== undefined && (
        <p>
          <strong>Progress:</strong> {progressPercent}%
        </p>
      )}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {canEdit && onEdit && (
          <button onClick={onEdit}>Edit</button>
        )}
        {canDelete && onDelete && (
          <button onClick={() => onDelete(id)}>Delete</button>
        )}
        {canAddToCart && onAddToCart && (
          <button onClick={() => onAddToCart(id)}>Add to Cart</button>
        )}
        {canEnroll && onEnroll && (
          <button onClick={() => onEnroll(id)}>Enroll</button>
        )}
        {learnLink && (
          <Link to={`/learn/${id}`}>
            <button>Continue Learning</button>
          </Link>
        )}
      </div>
    </div>
  );
}
