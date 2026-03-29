import Agent from "@/components/Agent";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { getInverviewsByID } from "@/lib/actions/general.action";
import { redirect } from "next/navigation";

const focusLabelMap: Record<string, string> = {
  behavioral: "Behavioral",
  technical: "Technical",
  mixed: "Mixed",
};

const page = async ({ params }: RouteParams) => {
  const { id } = await params;
  const user = await getCurrentUser();
  const interview = await getInverviewsByID(id);

  if (!interview) redirect("/");

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
      {/* Interview header */}
      <div className="flex items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <h1 className="text-xl font-bold text-foreground capitalize">
            {interview.role} Interview
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {interview.questions.length} questions &middot; {interview.field}
          </p>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-medium border border-border text-muted-foreground capitalize">
          {focusLabelMap[interview.focus] ?? interview.focus}
        </span>
      </div>

      <Agent
        userName={user?.name!}
        userId={user?.id!}
        interviewId={id}
        type="interview"
        questions={interview.questions}
      />
    </div>
  );
};

export default page;
