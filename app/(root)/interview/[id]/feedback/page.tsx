import dayjs from "dayjs";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Calendar, Star, TrendingUp, Sparkles, CheckCircle, AlertCircle, Home, RotateCcw } from "lucide-react";

import {
  getFeedbackByInterviewId,
  getInterviewById,
} from "@/lib/actions/general.action";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/actions/auth.action";

const Feedback = async ({ params }: RouteParams) => {
  const { id } = await params;
  const user = await getCurrentUser();

  const interview = await getInterviewById(id);
  if (!interview) redirect("/");

  const feedback = await getFeedbackByInterviewId({
    interviewId: id,
    userId: user?.id!,
  });

  // Calculate color based on score
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-green-100 dark:bg-green-900/30";
    if (score >= 60) return "bg-yellow-100 dark:bg-yellow-900/30";
    return "bg-red-100 dark:bg-red-900/30";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className="mx-auto max-w-5xl px-6 py-12 space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 dark:bg-purple-900/30 mb-4">
            <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
              Interview Complete
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold">
            Interview Feedback
          </h1>
          <p className="text-xl text-muted-foreground">
            <span className="capitalize">{interview.role}</span> Position
          </p>
        </div>

        {/* Score Overview Card */}
        <div className="rounded-2xl border bg-card shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 p-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              {/* Overall Score */}
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full gradiant-bg opacity-20 blur-xl absolute" />
                  <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full bg-background flex items-center justify-center">
                      <span className="text-3xl font-bold gradiant-bg bg-clip-text text-transparent">
                        {feedback?.totalScore}
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Star className="w-5 h-5 text-purple-600 dark:text-purple-400 fill-purple-600 dark:fill-purple-400" />
                    <h2 className="text-2xl font-bold">Overall Score</h2>
                  </div>
                  <p className="text-muted-foreground">Out of 100 points</p>
                </div>
              </div>

              {/* Date */}
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-background/50">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm">
                  {feedback?.createdAt
                    ? dayjs(feedback.createdAt).format("MMM D, YYYY h:mm A")
                    : "N/A"}
                </span>
              </div>
            </div>
          </div>

          {/* Final Assessment */}
          <div className="p-8 border-t">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              Final Assessment
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              {feedback?.finalAssessment}
            </p>
          </div>
        </div>

        {/* Category Scores Grid */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Performance Breakdown</h2>
          <div className="grid gap-4">
            {feedback?.categoryScores?.map((category, index) => (
              <div
                key={index}
                className="rounded-xl border bg-card hover:shadow-md transition-all duration-300 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold">{category.name}</h3>
                    <div className={`px-4 py-1.5 rounded-full ${getScoreBg(category.score)}`}>
                      <span className={`text-lg font-bold ${getScoreColor(category.score)}`}>
                        {category.score}/100
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2 bg-secondary rounded-full overflow-hidden mb-3">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                      style={{ width: `${category.score}%` }}
                    />
                  </div>

                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {category.comment}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Strengths and Areas for Improvement */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Strengths */}
          <div className="rounded-xl border bg-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-bold">Strengths</h3>
            </div>
            <ul className="space-y-3">
              {feedback?.strengths?.map((strength, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                  <span className="text-sm text-muted-foreground leading-relaxed">
                    {strength}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Areas for Improvement */}
          <div className="rounded-xl border bg-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-xl font-bold">Areas for Improvement</h3>
            </div>
            <ul className="space-y-3">
              {feedback?.areasForImprovement?.map((area, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2 flex-shrink-0" />
                  <span className="text-sm text-muted-foreground leading-relaxed">
                    {area}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <Button asChild variant="outline" className="flex-1">
            <Link href="/" className="flex items-center justify-center gap-2">
              <Home className="w-4 h-4" />
              Back to Dashboard
            </Link>
          </Button>

          <Button asChild className="flex-1 relative group">
            <Link href={`/interview/${id}`} className="flex items-center justify-center gap-2">
              <div className="absolute -inset-0.5 gradiant-bg rounded-lg blur opacity-30 group-hover:opacity-50 transition" />
              <span className="relative flex items-center gap-2">
                <RotateCcw className="w-4 h-4" />
                Retake Interview
              </span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Feedback;
