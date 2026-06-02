import { useState } from "react";
import { Home, Building2, CreditCard, GraduationCap, BookOpen, FileText, Building, Users, Calendar, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import DepartmentCard from "@/components/DepartmentCard";
import SupportForm from "@/components/SupportForm";
import LogsPanel from "@/components/LogsPanel";
import StudentTimetable from "@/components/StudentTimetable";
import { useAuth } from "@/contexts/AuthContext";

const baseDepartments = [
  {
    title: "Admin Office",
    description: "Handles student registrations, ID cards, certificates, and general administrative queries.",
    icon: Building2,
    gradientClass: "card-gradient-red",
    iconColorClass: "text-card-red",
  },
  {
    title: "Fee Office",
    description: "Manages tuition payments, scholarship disbursements, fee receipts, and financial queries.",
    icon: CreditCard,
    gradientClass: "card-gradient-orange",
    iconColorClass: "text-card-orange",
  },
  {
    title: "Academic Affairs",
    description: "Coordinates course registration, academic calendars, grade reports, and curriculum matters.",
    icon: GraduationCap,
    gradientClass: "card-gradient-purple",
    iconColorClass: "text-card-purple",
  },
  {
    title: "Library",
    description: "Provides access to books, digital resources, study spaces, and research materials.",
    icon: BookOpen,
    gradientClass: "card-gradient-blue",
    iconColorClass: "text-card-blue",
  },
  {
    title: "Exam Cell",
    description: "Oversees examination schedules, hall tickets, result processing, and revaluation requests.",
    icon: FileText,
    gradientClass: "card-gradient-yellow",
    iconColorClass: "text-card-yellow",
  },
  {
    title: "Hostel Office",
    description: "Manages room allocations, maintenance requests, hostel rules, and residential facilities.",
    icon: Building,
    gradientClass: "card-gradient-pink",
    iconColorClass: "text-card-pink",
  },
  {
    title: "Placement Cell",
    description: "Facilitates campus recruitment, internships, career counseling, and industry connections.",
    icon: Users,
    gradientClass: "card-gradient-teal",
    iconColorClass: "text-card-teal",
  },
];

const itSupportCard = {
  title: "IT Support",
  description: "Technical assistance for systems, network issues, software problems, and digital services.",
  icon: Calendar,
  gradientClass: "card-gradient-green",
  iconColorClass: "text-card-green",
};

const teacherAvailableCard = {
  title: "Teacher Available",
  description: "Check which teachers are available and their free slots throughout the week.",
  icon: Calendar,
  gradientClass: "card-gradient-green",
  iconColorClass: "text-card-green",
  isTeacherCard: true,
};

const Index = () => {
  const { user, logout } = useAuth();
  const [showTimetable, setShowTimetable] = useState(false);

  // For students, replace IT Support with Teacher Available
  const departments = user?.role === "student"
    ? [...baseDepartments, teacherAvailableCard]
    : [...baseDepartments, itSupportCard];

  if (showTimetable && user?.role === "student") {
    return <StudentTimetable onBack={() => setShowTimetable(false)} />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Home className="w-6 h-6 text-primary" />
            <span className="font-semibold text-lg text-foreground">College Support AI</span>
            {user && (
              <span className="text-xs px-2 py-1 rounded-full bg-primary/20 text-primary ml-2">
                {user.name} ({user.role})
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <LogsPanel />
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            {user && (
              <Button variant="outline" onClick={logout} className="gap-2">
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Quick Access Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-center text-foreground mb-8">
            Quick Access Departments
          </h2>
          
          {/* Cards Grid - 8 cards in a tight grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0">
            {departments.map((dept) => (
              <div key={dept.title} className="p-1">
                {"isTeacherCard" in dept && dept.isTeacherCard ? (
                  <button
                    onClick={() => setShowTimetable(true)}
                    className="w-full text-left"
                  >
                    <DepartmentCard
                      title={dept.title}
                      description={dept.description}
                      icon={dept.icon}
                      gradientClass={dept.gradientClass}
                      iconColorClass={dept.iconColorClass}
                    />
                  </button>
                ) : (
                  <DepartmentCard
                    title={dept.title}
                    description={dept.description}
                    icon={dept.icon}
                    gradientClass={dept.gradientClass}
                    iconColorClass={dept.iconColorClass}
                  />
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Form Section */}
        <section className="max-w-4xl mx-auto">
          <h3 className="text-xl font-semibold text-center text-primary mb-6">
            How can we assist you today?
          </h3>
          <SupportForm />
        </section>
      </main>
    </div>
  );
};

export default Index;
