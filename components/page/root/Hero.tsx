import { ChevronRight, Mic, Sparkles, TrendingUp } from "lucide-react";
import Link from "next/link";

const Hero = () => {
  return (
    <div className="relative overflow-hidden">
      {/* Background glows */}
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-purple-600/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-[400px] h-[400px] rounded-full bg-pink-600/10 blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 py-24 grid lg:grid-cols-2 gap-16 items-center">
        {/* Left — copy */}
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-sm font-medium">
            <Sparkles size={14} />
            AI-Powered Interview Practice
          </div>

          <h1 className="text-5xl lg:text-6xl font-black leading-[1.05] -tracking-[0.5px] text-white">
            Master your next
            <br />
            <span className="grad-text">interview</span> with AI
          </h1>

          <p className="text-lg text-muted-foreground leading-relaxed max-w-lg">
            Practice real scenarios with an AI voice interviewer. Get
            structured feedback on STAR method, communication, and core
            competencies — instantly.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/interview"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg gradient-bg text-white font-semibold hover:opacity-90 transition-opacity"
            >
              Start Practicing Free
              <ChevronRight size={18} />
            </Link>
            <Link
              href="/sign-in"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors font-medium"
            >
              Sign in
            </Link>
          </div>

          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
              No credit card required
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
              Multi-judge AI evaluation
            </span>
          </div>
        </div>

        {/* Right — mock interview card */}
        <div className="relative lg:flex justify-end hidden">
          <div className="w-full max-w-sm space-y-3">
            {/* Interview card */}
            <div className="rounded-2xl border border-border bg-bgc-2 p-5 shadow-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full gradient-bg flex items-center justify-center shrink-0">
                  <Mic className="text-white" size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">AI Interviewer</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    Live session
                  </p>
                </div>
              </div>

              <div className="rounded-lg bg-bgc p-3.5 mb-4 border border-border">
                <p className="text-xs text-muted-foreground mb-1">Question 2 of 5</p>
                <p className="text-sm text-foreground leading-relaxed">
                  "Tell me about a time you led a project under a tight deadline."
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "STAR", value: "3.8/4", color: "text-purple-400" },
                  { label: "Skills", value: "3.5/4", color: "text-pink-400" },
                  { label: "Trust", value: "87%", color: "text-green-400" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="rounded-lg bg-bgc border border-border p-3 text-center">
                    <p className={`text-base font-bold ${color}`}>{value}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Feedback snippet */}
            <div className="rounded-xl border border-border bg-bgc-2 px-4 py-3 flex items-start gap-3">
              <TrendingUp size={16} className="text-purple-400 mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                Strong problem-solving demonstrated. Add specific metrics to
                strengthen your Result statement.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
