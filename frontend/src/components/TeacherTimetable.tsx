import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut, Save } from "lucide-react";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const HOURS = Array.from({ length: 8 }, (_, i) => i + 9); // 9am to 4pm (8 slots)

const TeacherTimetable = () => {
  const { user, logout } = useAuth();
  const [availability, setAvailability] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Load existing availability
    const stored = localStorage.getItem(`availability_${user?.id}`);
    if (stored) {
      setAvailability(JSON.parse(stored));
    }
  }, [user?.id]);

  const toggleSlot = (day: string, hour: number) => {
    const key = `${day}-${hour}`;
    setAvailability(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
    setSaved(false);
  };

  const saveAvailability = () => {
    localStorage.setItem(`availability_${user?.id}`, JSON.stringify(availability));
    
    // Also save to a combined store for students to view
    const allAvailability = JSON.parse(localStorage.getItem("all_teacher_availability") || "{}");
    allAvailability[user?.id || ""] = {
      name: user?.name,
      slots: availability
    };
    localStorage.setItem("all_teacher_availability", JSON.stringify(allAvailability));
    setSaved(true);
  };

  const formatHour = (hour: number) => {
    const suffix = hour >= 12 ? "PM" : "AM";
    const displayHour = hour > 12 ? hour - 12 : hour;
    return `${displayHour}:00 ${suffix}`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-lg text-foreground">
              Welcome, {user?.name}
            </span>
            <span className="text-xs px-2 py-1 rounded-full bg-primary/20 text-primary">
              Teacher
            </span>
          </div>
          <Button variant="outline" onClick={logout} className="gap-2">
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Weekly Availability</h2>
              <p className="text-muted-foreground">Click on slots to mark when you're available (green)</p>
            </div>
            <Button onClick={saveAvailability} className="gap-2">
              <Save className="w-4 h-4" />
              {saved ? "Saved!" : "Save"}
            </Button>
          </div>

          {/* Timetable Grid */}
          <div className="bg-card/50 border border-border/30 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/30">
                    <th className="p-3 text-left text-sm font-semibold text-muted-foreground bg-background/50 min-w-[80px]">
                      Time
                    </th>
                    {DAYS.map(day => (
                      <th key={day} className="p-3 text-center text-sm font-semibold text-foreground bg-background/50 min-w-[100px]">
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {HOURS.map(hour => (
                    <tr key={hour} className="border-b border-border/20">
                      <td className="p-3 text-sm text-muted-foreground bg-background/30">
                        {formatHour(hour)} - {formatHour(hour + 1)}
                      </td>
                      {DAYS.map(day => {
                        const key = `${day}-${hour}`;
                        const isAvailable = availability[key];
                        return (
                          <td key={day} className="p-1">
                            <button
                              onClick={() => toggleSlot(day, hour)}
                              className={`w-full h-12 rounded-md transition-all ${
                                isAvailable
                                  ? "bg-green-500/80 hover:bg-green-500/60 border-2 border-green-400"
                                  : "bg-background/20 hover:bg-background/40 border border-border/30"
                              }`}
                            >
                              {isAvailable && (
                                <span className="text-xs font-medium text-white">Available</span>
                              )}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-500/80 border border-green-400"></div>
              <span>Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-background/20 border border-border/30"></div>
              <span>Not marked</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TeacherTimetable;
