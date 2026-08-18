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
    <div className="course-card">
      <div className="course-header">
        <h3>
          <Link to={`/courses/${id}`}>{title}</Link>
        </h3>
      </div>
      <p className="course-description">{description}</p>
      <p className="course-instructor">
        <strong>Instructor:</strong> {instructor}
      </p>
      {category && (
        <p>
          <strong>Category:</strong> {category}
        </p>
      )}
      {price !== undefined && (
        <p className="course-price">
          <strong>Price:</strong> ${Number(price).toFixed(2)}
        </p>
      )}
      {isPublished !== undefined && (
        <p>
          <strong>Status:</strong> {isPublished ? "Published" : "Draft"}
        </p>
      )}
      {progressPercent !== undefined && (
        <>
          <p>
            <strong>Progress:</strong> {progressPercent}%
          </p>
          <div className="progress-bar-outer">
            <div
              className="progress-bar-inner"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </>
      )}
      <div className="course-actions">
        {canEdit && onEdit && (
          <button type="button" className="edit-btn" onClick={onEdit}>
            Edit
          </button>
        )}
        {canDelete && onDelete && (
          <button
            type="button"
            className="delete-btn"
            onClick={() => onDelete(id)}
          >
            Delete
          </button>
        )}
        {canAddToCart && onAddToCart && (
          <button
            type="button"
            className="enroll-btn"
            onClick={() => onAddToCart(id)}
          >
            Add to Cart
          </button>
        )}
        {canEnroll && onEnroll && (
          <button
            type="button"
            className="enroll-btn"
            onClick={() => onEnroll(id)}
          >
            Enroll
          </button>
        )}
        {learnLink && (
          <Link to={`/learn/${id}`}>
            <button type="button" className="view-btn">
              Continue Learning
            </button>
          </Link>
        )}
      </div>
    </div>
  );
}
