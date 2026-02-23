import { motion } from "framer-motion";
import { FileText, Clock, Copy, Check, User, Building2, Stethoscope, Calendar } from "lucide-react";
import { useState } from "react";
import MedicalReportTable, { type MedicalParameter } from "@/components/MedicalReportTable";

interface PatientInfo {
  name?: string | null;
  age?: string | null;
  gender?: string | null;
  date?: string | null;
  lab?: string | null;
  doctor?: string | null;
  reportType?: string | null;
}

interface SummaryCardProps {
  data: {
    patient?: PatientInfo | null;
    parameters?: MedicalParameter[];
    summary?: string;
    recommendations?: string[];
    rawText?: boolean;
  };
  fileName: string;
  timestamp: Date;
}

const SummaryCard = ({ data, fileName, timestamp }: SummaryCardProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const text = data.parameters
      ? data.parameters.map((p) => `${p.name}: ${p.result} (Range: ${p.normalRange}) - ${p.status}`).join("\n")
      : data.summary || "";
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const patient = data.patient;
  const hasPatientInfo = patient && (patient.name || patient.age || patient.lab || patient.doctor);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="rounded-xl border border-border bg-card shadow-card overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/50 px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <FileText className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              {patient?.reportType || fileName}
            </p>
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {timestamp.toLocaleTimeString()}
            </p>
          </div>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      <div className="p-6 space-y-5">
        {/* Patient Info */}
        {hasPatientInfo && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {patient?.name && (
              <div className="flex items-center gap-2 rounded-lg bg-secondary/50 px-3 py-2">
                <User className="h-3.5 w-3.5 text-primary" />
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Patient</p>
                  <p className="text-xs font-medium text-foreground">{patient.name}</p>
                </div>
              </div>
            )}
            {(patient?.age || patient?.gender) && (
              <div className="flex items-center gap-2 rounded-lg bg-secondary/50 px-3 py-2">
                <User className="h-3.5 w-3.5 text-primary" />
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Age / Gender</p>
                  <p className="text-xs font-medium text-foreground">
                    {[patient.age, patient.gender].filter(Boolean).join(" / ")}
                  </p>
                </div>
              </div>
            )}
            {patient?.lab && (
              <div className="flex items-center gap-2 rounded-lg bg-secondary/50 px-3 py-2">
                <Building2 className="h-3.5 w-3.5 text-primary" />
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Lab</p>
                  <p className="text-xs font-medium text-foreground truncate">{patient.lab}</p>
                </div>
              </div>
            )}
            {patient?.doctor && (
              <div className="flex items-center gap-2 rounded-lg bg-secondary/50 px-3 py-2">
                <Stethoscope className="h-3.5 w-3.5 text-primary" />
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Doctor</p>
                  <p className="text-xs font-medium text-foreground truncate">{patient.doctor}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Parameters Table */}
        {data.parameters && data.parameters.length > 0 && (
          <MedicalReportTable parameters={data.parameters} />
        )}

        {/* Summary */}
        {data.summary && (
          <div className="rounded-lg bg-accent/50 border border-accent p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-accent-foreground mb-1.5">
              Assessment
            </p>
            <p className="text-sm text-foreground/85 leading-relaxed">{data.summary}</p>
          </div>
        )}

        {/* Recommendations */}
        {data.recommendations && data.recommendations.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Recommendations
            </p>
            <ul className="space-y-1.5">
              {data.recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-foreground/85">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default SummaryCard;
