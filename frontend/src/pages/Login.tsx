import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth, TEACHER_CREDENTIALS, STUDENT_CREDENTIALS } from "@/contexts/AuthContext";
import { GraduationCap, BookOpen } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [selectedRole, setSelectedRole] = useState<"teacher" | "student" | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    const result = login(email, password);
    if (result.success) {
      navigate("/");
    } else {
      setError(result.error || "Login failed");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground">Hostel Support AI</h1>
          <p className="text-muted-foreground mt-2">Choose your login type</p>
        </div>

        {!selectedRole ? (
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setSelectedRole("teacher")}
              className="p-8 rounded-xl border border-border/30 bg-card/50 hover:bg-card/80 transition-all flex flex-col items-center gap-4 group"
            >
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                <BookOpen className="w-8 h-8 text-primary" />
              </div>
              <span className="text-lg font-semibold text-foreground">Teacher</span>
            </button>

            <button
              onClick={() => setSelectedRole("student")}
              className="p-8 rounded-xl border border-border/30 bg-card/50 hover:bg-card/80 transition-all flex flex-col items-center gap-4 group"
            >
              <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center group-hover:bg-accent/30 transition-colors">
                <GraduationCap className="w-8 h-8 text-accent-foreground" />
              </div>
              <span className="text-lg font-semibold text-foreground">Student</span>
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <button
              onClick={() => setSelectedRole(null)}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              ← Back to selection
            </button>

            <div className="bg-card/50 border border-border/30 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                {selectedRole === "teacher" ? (
                  <><BookOpen className="w-5 h-5 text-primary" /> Teacher Login</>
                ) : (
                  <><GraduationCap className="w-5 h-5" /> Student Login</>
                )}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="bg-background/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="bg-background/50"
                  />
                </div>

                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}

                <Button type="submit" className="w-full">
                  Login
                </Button>
              </form>

              {/* Credentials hint */}
              <div className="mt-6 p-4 bg-background/30 rounded-lg">
                <p className="text-xs text-muted-foreground mb-2">Demo Credentials:</p>
                {selectedRole === "teacher" ? (
                  <div className="space-y-1 text-xs">
                    {TEACHER_CREDENTIALS.map((t, i) => (
                      <p key={i} className="text-muted-foreground">
                        <span className="text-foreground">{t.name}:</span> {t.email} / {t.password}
                      </p>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    {STUDENT_CREDENTIALS[0].email} / {STUDENT_CREDENTIALS[0].password}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
