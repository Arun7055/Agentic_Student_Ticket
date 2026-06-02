import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, MessageSquare, Search, Bot, Send } from "lucide-react";

interface FormData {
  name: string;
  email: string;
  description: string;
}

const processingSteps = [
  { icon: Search, text: "Gathering information...", delay: 0 },
  { icon: Bot, text: "Analyzing your request...", delay: 1500 },
  { icon: MessageSquare, text: "Connecting to support agents...", delay: 3000 },
  { icon: Send, text: "Submitting your ticket...", delay: 4500 },
  { icon: CheckCircle2, text: "Ticket created successfully!", delay: 6000 },
];

const SupportForm = () => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleClear = () => {
    setFormData({ name: "", email: "", description: "" });
    setIsComplete(false);
    setCurrentStep(0);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.email || !formData.description) return;

    setIsSubmitting(true);
    setCurrentStep(0);
    setIsComplete(false);

    // Simulate processing steps
    for (let i = 0; i < processingSteps.length - 1; i++) {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setCurrentStep(i + 1);
    }

    try {
      await fetch("http://localhost:3000/api/tickets/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          description: formData.description,
        }),
      });
    } catch (error) {
      console.error("Failed to submit ticket:", error);
    }

    setIsComplete(true);
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-4">
      {isSubmitting || isComplete ? (
        <div className="bg-card rounded-lg p-6 border border-border">
          <div className="space-y-3">
            {processingSteps.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = index === currentStep;
              const isPast = index < currentStep;
              const isFuture = index > currentStep;

              return (
                <div
                  key={index}
                  className={`flex items-center gap-3 transition-all duration-300 ${
                    isFuture ? "opacity-30" : "opacity-100"
                  } ${isActive ? "animate-slide-in" : ""}`}
                >
                  <div
                    className={`p-2 rounded-full transition-colors duration-300 ${
                      isPast || (isComplete && index === processingSteps.length - 1)
                        ? "bg-primary/20 text-primary"
                        : isActive
                        ? "bg-primary/20 text-primary animate-pulse-glow"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {isPast || (isComplete && index === processingSteps.length - 1) ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : isActive ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <StepIcon className="w-4 h-4" />
                    )}
                  </div>
                  <span
                    className={`text-sm ${
                      isPast || isComplete ? "text-primary" : isActive ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {step.text}
                  </span>
                </div>
              );
            })}
          </div>
          {isComplete && (
            <Button onClick={handleClear} className="mt-4 w-full" variant="outline">
              Submit Another Request
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Your Name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className="bg-card border-border text-foreground placeholder:text-muted-foreground"
            />
            <Input
              type="email"
              placeholder="Your Email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className="bg-card border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <Textarea
            placeholder="Describe your issue in detail..."
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            className="bg-card border-border text-foreground placeholder:text-muted-foreground min-h-[100px] resize-none"
          />
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleClear}
              className="border-primary text-primary hover:bg-primary/10"
            >
              Clear Form
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!formData.name || !formData.email || !formData.description}
              className="flex-1 bg-secondary hover:bg-secondary/80 text-secondary-foreground disabled:opacity-50"
            >
              Send Request
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default SupportForm;
