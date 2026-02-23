import { motion } from "framer-motion";
import { CheckCircle2, AlertTriangle, AlertOctagon, ArrowDown, ArrowUp, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

export interface MedicalParameter {
  name: string;
  result: string;
  normalRange: string;
  status: string;
}

interface MedicalReportTableProps {
  parameters: MedicalParameter[];
}

const getStatusConfig = (status: string) => {
  const s = status.toLowerCase();
  if (s === "normal") {
    return {
      icon: CheckCircle2,
      className: "text-emerald-500",
      bgClassName: "bg-emerald-500/10",
      label: "Normal",
    };
  }
  if (s.includes("critical")) {
    return {
      icon: AlertOctagon,
      className: "text-red-500",
      bgClassName: "bg-red-500/10",
      label: status,
    };
  }
  if (s.includes("high") || s.includes("low")) {
    return {
      icon: AlertTriangle,
      className: "text-amber-500",
      bgClassName: "bg-amber-500/10",
      label: status,
    };
  }
  if (s.includes("borderline")) {
    return {
      icon: Minus,
      className: "text-amber-400",
      bgClassName: "bg-amber-400/10",
      label: status,
    };
  }
  return {
    icon: CheckCircle2,
    className: "text-muted-foreground",
    bgClassName: "bg-muted",
    label: status,
  };
};

const MedicalReportTable = ({ parameters }: MedicalReportTableProps) => {
  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full">
        <thead>
          <tr className="bg-secondary/70">
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Parameter
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Result
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Normal Range
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Status
            </th>
          </tr>
        </thead>
        <tbody>
          {parameters.map((param, index) => {
            const config = getStatusConfig(param.status);
            const StatusIcon = config.icon;
            return (
              <motion.tr
                key={param.name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={cn(
                  "border-t border-border/50 transition-colors hover:bg-secondary/30",
                  index % 2 === 0 ? "bg-card" : "bg-card/60"
                )}
              >
                <td className="px-4 py-3.5 text-sm font-semibold text-foreground">
                  {param.name}
                </td>
                <td className="px-4 py-3.5 text-sm text-foreground">
                  {param.result}
                </td>
                <td className="px-4 py-3.5 text-sm text-muted-foreground">
                  {param.normalRange}
                </td>
                <td className="px-4 py-3.5">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
                      config.bgClassName,
                      config.className
                    )}
                  >
                    <StatusIcon className="h-3.5 w-3.5" />
                    {config.label}
                  </span>
                </td>
              </motion.tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default MedicalReportTable;
