import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const HOURS = Array.from({ length: 8 }, (_, i) => i + 9);

interface TeacherAvailability {
  name: string;
  slots: Record<string, boolean>;
}

interface StudentTimetableProps {
  onBack: () => void;
}

const TEACHER_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  teacher1: { bg: "bg-green-500/70", border: "border-green-400", text: "text-green-100" },
  teacher2: { bg: "bg-blue-500/70", border: "border-blue-400", text: "text-blue-100" },
  teacher3: { bg: "bg-purple-500/70", border: "border-purple-400", text: "text-purple-100" },
};

const StudentTimetable = ({ onBack }: StudentTimetableProps) => {
  const [teacherData, setTeacherData] = useState<Record<string, TeacherAvailability>>({});

  useEffect(() => {
    const stored = localStorage.getItem("all_teacher_availability");
    if (stored) {
      setTeacherData(JSON.parse(stored));
    }
  }, []);

  const formatHour = (hour: number) => {
    const suffix = hour >= 12 ? "PM" : "AM";
    const displayHour = hour > 12 ? hour - 12 : hour;
    return `${displayHour}:00 ${suffix}`;
  };

  const getAvailableTeachers = (day: string, hour: number) => {
    const key = `${day}-${hour}`;
    const available: { id: string; name: string }[] = [];
    
    Object.entries(teacherData).forEach(([teacherId, data]) => {
      if (data.slots[key]) {
        available.push({ id: teacherId, name: data.name });
      }
    });
    
    return available;
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" onClick={onBack} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Teacher Availability</h2>
            <p className="text-muted-foreground">See which teachers are available</p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 mb-4 p-4 bg-card/50 rounded-lg border border-border/30">
          <span className="text-sm text-muted-foreground">Teachers:</span>
          {Object.entries(teacherData).map(([id, data]) => (
            <div key={id} className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded ${TEACHER_COLORS[id]?.bg || "bg-gray-500"} ${TEACHER_COLORS[id]?.border || "border-gray-400"} border`}></div>
              <span className="text-sm text-foreground">{data.name}</span>
            </div>
          ))}
          {Object.keys(teacherData).length === 0 && (
            <span className="text-sm text-muted-foreground italic">No teachers have marked availability yet</span>
          )}
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
                    <th key={day} className="p-3 text-center text-sm font-semibold text-foreground bg-background/50 min-w-[120px]">
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
                      const available = getAvailableTeachers(day, hour);
                      return (
                        <td key={day} className="p-1">
                          <div className="min-h-[60px] rounded-md bg-background/20 border border-border/30 p-1 flex flex-col gap-1">
                            {available.map(teacher => {
                              const colors = TEACHER_COLORS[teacher.id] || { bg: "bg-gray-500/70", border: "border-gray-400", text: "text-gray-100" };
                              return (
                                <div
                                  key={teacher.id}
                                  className={`px-2 py-1 rounded text-xs font-medium ${colors.bg} ${colors.border} ${colors.text} border`}
                                >
                                  {teacher.name}
                                </div>
                              );
                            })}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentTimetable;
