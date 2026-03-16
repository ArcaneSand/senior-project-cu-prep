import React from 'react'
import Link from 'next/link'
import { Button } from './ui/button'
import { Calendar, Clock, Code, Briefcase, TrendingUp } from 'lucide-react'
import { getFeedbackByInterviewId } from '@/lib/actions/general.action'

interface InterviewCardProps {
  interviewId: string
  id: string
  userId: string
  role: string
  type: string
  level: string
  techstack: string[]
  questions: string[]
  createAt: string
  finalized?: boolean
}

const InterviewCard = async ({
  interviewId,
  id,
  userId,
  role,
  type,
  level,
  techstack,
  questions,
  createAt,
}: InterviewCardProps) => {
  const formattedDate = new Date(createAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })

  const feedback = id && userId
    ? await getFeedbackByInterviewId({
        interviewId: id,
        userId: userId,
      })
    : null;
  return (
    <div className="group relative overflow-hidden rounded-xl border bg-card hover:shadow-lg transition-all duration-300">
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 gradiant-bg opacity-0 group-hover:opacity-5 transition-opacity duration-300" />

      <div className="relative p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-1">
            <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
              {role}
            </h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>{formattedDate}</span>
            </div>
          </div>

          {feedback && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
              Completed
            </span>
          )}
        </div>

        {/* Details */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Briefcase className="w-4 h-4 text-purple-500" />
            <span className="font-medium">{type}</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground capitalize">{level}</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-pink-500" />
            <span className="text-muted-foreground">{questions.length} Questions</span>
          </div>

          {/* Tech Stack */}
          <div className="flex items-start gap-2">
            <Code className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
            <div className="flex flex-wrap gap-1.5">
              {techstack.slice(0, 3).map((tech, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-secondary text-secondary-foreground"
                >
                  {tech.trim()}
                </span>
              ))}
              {techstack.length > 3 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-secondary text-secondary-foreground">
                  +{techstack.length - 3} more
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-4 border-t">
          <Button
            asChild
            variant="outline"
            className="w-full group-hover:border-purple-500 group-hover:text-purple-600 dark:group-hover:border-purple-400 dark:group-hover:text-purple-400 transition-colors"
          >
            <Link href={feedback
                  ? `/interview/${interviewId}/feedback`
                  : `/interview/${interviewId}`
              } className="flex items-center justify-center gap-2">
              <TrendingUp className="w-4 h-4" />
              {feedback ? "Check Feedback" : "Take Interview"}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default InterviewCard