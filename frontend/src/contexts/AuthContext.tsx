import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
  id: string;
  name: string;
  role: "teacher" | "student";
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hardcoded credentials
const TEACHERS = [
  { id: "teacher1", email: "teacher1@school.com", password: "teacher123", name: "Prof. Poornima" },
  { id: "teacher2", email: "teacher2@school.com", password: "teacher123", name: "Prof Mamata GS" },
  { id: "teacher3", email: "teacher3@school.com", password: "teacher123", name: "Prof. R" },
];

const STUDENTS = [
  { id: "student1", email: "student@school.com", password: "student123", name: "Student" },
];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("auth_user");
    if (stored) {
      setUser(JSON.parse(stored));
    }
  }, []);

  const login = (email: string, password: string) => {
    const teacher = TEACHERS.find(t => t.email === email && t.password === password);
    if (teacher) {
      const userData = { id: teacher.id, name: teacher.name, role: "teacher" as const };
      setUser(userData);
      localStorage.setItem("auth_user", JSON.stringify(userData));
      return { success: true };
    }

    const student = STUDENTS.find(s => s.email === email && s.password === password);
    if (student) {
      const userData = { id: student.id, name: student.name, role: "student" as const };
      setUser(userData);
      localStorage.setItem("auth_user", JSON.stringify(userData));
      return { success: true };
    }

    return { success: false, error: "Invalid credentials" };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("auth_user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

export const TEACHER_CREDENTIALS = TEACHERS.map(t => ({ email: t.email, password: t.password, name: t.name }));
export const STUDENT_CREDENTIALS = STUDENTS.map(s => ({ email: s.email, password: s.password }));
