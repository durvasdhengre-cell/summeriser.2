import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, FileText, ShieldCheck, Zap } from "lucide-react";
import { toast } from "sonner";
import heroImage from "@/assets/hero-medical.jpg";
import FileUpload from "@/components/FileUpload";
import SummaryCard from "@/components/SummaryCard";
import LoadingIndicator from "@/components/LoadingIndicator";

interface MedicalReport {
  data: any;
  fileName: string;
  timestamp: Date;
}

const SUMMARIZE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/summarize-medical`;

const Index = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [reports, setReports] = useState<MedicalReport[]>([]);

  const handleFileContent = async (content: string, fileName: string) => {
    setIsProcessing(true);
    const isImage = content.startsWith("data:image");

    try {
      const resp = await fetch(SUMMARIZE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ content, fileName, isImage }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: "Failed to analyze document" }));
        throw new Error(err.error || "Failed to analyze document");
      }

      const data = await resp.json();
      setReports((prev) => [
        { data, fileName, timestamp: new Date() },
        ...prev,
      ]);
    } catch (err: any) {
      toast.error(err.message || "Failed to analyze document");
    } finally {
      setIsProcessing(false);
    }
  };

  const features = [
    { icon: Sparkles, title: "AI-Powered", desc: "Advanced AI analyzes your medical documents" },
    { icon: ShieldCheck, title: "Private & Secure", desc: "Your medical data stays confidential" },
    { icon: Zap, title: "Instant Results", desc: "Get summaries in seconds, not minutes" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
              <FileText className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-lg font-bold text-foreground">MedSummarize</span>
          </div>
          <span className="rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">AI-Powered</span>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <img src={heroImage} alt="" className="h-full w-full object-cover" />
        </div>
        <div className="relative container mx-auto px-4 py-16 md:py-24">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-2xl">
            <h1 className="font-display text-4xl font-bold leading-tight text-foreground md:text-5xl">
              Medical Document <span className="text-gradient">Summarizer</span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
              Upload your medical reports, prescriptions, or clinical notes and get instant AI-powered summaries with key findings highlighted.
            </p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="mt-8 flex flex-wrap gap-3">
            {features.map((f) => (
              <div key={f.title} className="flex items-center gap-2 rounded-full bg-card/80 backdrop-blur-sm border border-border px-4 py-2 shadow-card">
                <f.icon className="h-4 w-4 text-primary" />
                <div>
                  <span className="text-xs font-semibold text-foreground">{f.title}</span>
                  <span className="ml-1.5 text-xs text-muted-foreground hidden sm:inline">— {f.desc}</span>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-10">
        <div className="mx-auto max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
            <h2 className="font-display text-xl font-semibold text-foreground mb-4">Upload Document</h2>
            <FileUpload onFileContent={handleFileContent} isProcessing={isProcessing} />
          </motion.div>

          {isProcessing && <LoadingIndicator />}

          {reports.length > 0 && (
            <div className="mt-10">
              <h2 className="font-display text-xl font-semibold text-foreground mb-4">Analysis Results</h2>
              <div className="space-y-6">
                {reports.map((r, i) => (
                  <SummaryCard
                    key={`${r.fileName}-${r.timestamp.getTime()}`}
                    data={r.data}
                    fileName={r.fileName}
                    timestamp={r.timestamp}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-border/50 py-6 text-center text-xs text-muted-foreground">
        MedSummarize — AI-Powered Medical Document Analysis
      </footer>
    </div>
  );
};

export default Index;
