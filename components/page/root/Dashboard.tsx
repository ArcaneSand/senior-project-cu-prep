import React from "react";
import Link from "next/link";
import { Plus, Mic } from "lucide-react";
import InterviewCard from "@/components/InterviewCard";
import {
  getInterviewsByUserId,
  getFeedbackByInterviewId,
} from "@/lib/actions/general.action";

interface DashboardProps {
  userId: string;
}

const Dashboard = async ({ userId }: DashboardProps) => {
  const interviews = await getInterviewsByUserId(userId);

  return (
    <section className="max-w-6xl mx-auto px-6 py-10 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Your Interviews</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {interviews?.length
              ? `${interviews.length} session${interviews.length !== 1 ? "s" : ""} total`
              : "No sessions yet"}
          </p>
        </div>

        <Link
          href="/interview"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg gradient-bg text-white text-sm font-medium hover:opacity-90 transition-opacity shrink-0"
        >
          <Plus size={16} />
          New Interview
        </Link>
      </div>

      {/* Empty state */}
      {(!interviews || interviews.length === 0) && (
        <div className="rounded-2xl border border-border bg-bgc-2 p-12 flex flex-col items-center text-center gap-4">
          <div className="w-14 h-14 rounded-2xl gradient-bg flex items-center justify-center">
            <Mic size={24} className="text-white" />
          </div>
          <div>
            <p className="font-semibold text-foreground">No interviews yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Set up your first AI voice interview to get started.
            </p>
          </div>
          <Link
            href="/interview"
            className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg gradient-bg text-white text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Plus size={15} />
            Create Interview
          </Link>
        </div>
      )}

      {/* Grid */}
      {interviews && interviews.length > 0 && (
        <InterviewGrid interviews={interviews} userId={userId} />
      )}
    </section>
  );
};

// Separate async component to allow parallel feedback fetching
const InterviewGrid = async ({
  interviews,
  userId,
}: {
  interviews: Interview[];
  userId: string;
}) => {
  const feedbackResults = await Promise.all(
    interviews.map((interview) =>
      getFeedbackByInterviewId({ interviewId: interview.id, userId })
    )
    
  );
  
  console.log('[Dashboard] feedbackResults:', feedbackResults.map(
    (f, i) => ({ interviewId: interviews[i].id, hasFeedback: f !== null })
  ));

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {interviews.map((interview, i) => (
        <InterviewCard
          key={interview.id}
          interviewId={interview.id}
          role={interview.role}
          context={interview.context}
          focus={interview.focus}
          field={interview.field}
          stage={interview.stage}
          questions={interview.questions}
          createAt={interview.createAt}
          hasFeedback={feedbackResults[i] !== null}
        />
      ))}
    </div>
  );
};

export default Dashboard;
