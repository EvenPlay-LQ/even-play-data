import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Trophy, Zap, Calendar, Users, Target, X, ChevronRight, ChevronLeft,
  Sparkles, BarChart3, MessageSquare, Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

interface PlatformGuideProps {
  isOpen: boolean;
  onClose: () => void;
  role?: string;
}

const steps = [
  {
    id: "welcome",
    title: "Welcome to Even Playground",
    description: "Your ultimate platform for athletic growth, performance tracking, and community engagement.",
    icon: Sparkles,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    id: "stats",
    title: "Level Up Your Game",
    description: "Track your XP, Level, and Performance Score. Watch your progress as you log matches and metrics.",
    icon: Zap,
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  {
    id: "actions",
    title: "Record Every Moment",
    description: "Use Quick Actions to log your match results, fitness metrics, and achievements in seconds.",
    icon: Calendar,
    color: "text-stat-blue",
    bgColor: "bg-stat-blue/10",
  },
  {
    id: "buzz",
    title: "Join the Buzz",
    description: "Connect with athletes and institutions. Share highlights, like posts, and stay updated in the Community.",
    icon: MessageSquare,
    color: "text-stat-green",
    bgColor: "bg-stat-green/10",
  },
  {
    id: "zone",
    title: "The Athlete Zone",
    description: "Discover and compare yourself with other athletes. Find institutions and grow your professional network.",
    icon: Target,
    color: "text-stat-orange",
    bgColor: "bg-stat-orange/10",
  },
];

const PlatformGuide = ({ isOpen, onClose, role = "athlete" }: PlatformGuideProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    if (dontShowAgain) {
      localStorage.setItem("even_play_guide_seen", "true");
    }
    onClose();
  };

  const step = steps[currentStep];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
      />

      {/* Guide Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-lg bg-card border border-border shadow-elevated rounded-3xl overflow-hidden"
      >
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 flex">
          {steps.map((_, i) => (
            <div 
              key={i} 
              className={`flex-1 transition-colors duration-500 ${
                i <= currentStep ? "bg-primary" : "bg-muted"
              }`} 
            />
          ))}
        </div>

        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-all"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-8 sm:p-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center text-center gap-6"
            >
              <div className={`w-20 h-20 rounded-2xl ${step.bgColor} flex items-center justify-center shadow-glow mb-2`}>
                <step.icon className={`h-10 w-10 ${step.color}`} />
              </div>
              
              <div className="space-y-3">
                <h2 className="text-2xl font-display font-bold text-foreground">
                  {step.title}
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="mt-10 flex flex-col gap-6">
            <div className="flex items-center justify-between gap-4">
              <Button 
                variant="ghost" 
                onClick={handleBack}
                disabled={currentStep === 0}
                className="gap-1.5 text-muted-foreground"
              >
                <ChevronLeft className="h-4 w-4" /> Back
              </Button>

              <div className="flex items-center gap-1.5">
                {steps.map((_, i) => (
                  <div 
                    key={i} 
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === currentStep ? "w-6 bg-primary" : "w-1.5 bg-muted"
                    }`} 
                  />
                ))}
              </div>

              <Button 
                onClick={handleNext}
                className="gap-1.5 min-w-[100px] shadow-glow"
              >
                {currentStep === steps.length - 1 ? "Finish" : "Next"}
                {currentStep !== steps.length - 1 && <ChevronRight className="h-4 w-4" />}
              </Button>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2 border-t border-border/50">
              <Checkbox 
                id="dont-show" 
                checked={dontShowAgain}
                onCheckedChange={(checked) => setDontShowAgain(checked as boolean)}
              />
              <label 
                htmlFor="dont-show" 
                className="text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
              >
                Don't show this guide again
              </label>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PlatformGuide;
