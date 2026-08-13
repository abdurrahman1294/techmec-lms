export const emailRegex =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#_\-])[A-Za-z\d@$!%*?&.#_\-]{8,}$/;

/** Roles allowed via public registration (ADMIN is never public). */
export const publicRegisterRoles = [
  "INSTRUCTOR",
  "STUDENT",
];

/** All application roles (JWT / authorize middleware). */
export const validRoles = [
  "ADMIN",
  "INSTRUCTOR",
  "STUDENT",
];
