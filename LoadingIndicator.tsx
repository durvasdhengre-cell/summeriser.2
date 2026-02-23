import { motion } from "framer-motion";
import { Stethoscope } from "lucide-react";

const LoadingIndicator = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="flex flex-col items-center gap-4 py-12"
  >
    <div className="relative">
      <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center animate-pulse-soft">
        <Stethoscope className="h-7 w-7 text-primary" />
      </div>
      <div className="absolute -inset-2 rounded-3xl border-2 border-primary/20 animate-ping" style={{ animationDuration: '2s' }} />
    </div>
    <div className="text-center">
      <p className="text-sm font-medium text-foreground">Analyzing document...</p>
      <p className="mt-1 text-xs text-muted-foreground">AI is summarizing your medical report</p>
    </div>
  </motion.div>
);

export default LoadingIndicator;
