import React from 'react'
import Link from 'next/link'
import { Button } from './ui/button'
import { Calendar, Clock, Briefcase, TrendingUp, GraduationCap } from 'lucide-react'

interface InterviewCardProps {
  interviewId: string
  role: string
  context: string
  focus: string
  field: string
  stage: string
  questions: string[]
  createAt: string
  hasFeedback: boolean
}

const stageLabelMap: Record<string, string> = {
  student:     'Student',
  freshgrad:   'Fresh Graduate',
  experienced: 'Experienced',
}

const contextLabelMap: Record<string, string> = {
  job:        'Job Application',
  internship: 'Internship Application',
}

const InterviewCard = ({
  interviewId,
  role,
  context,
  focus,
  field,
  stage,
  questions,
  createAt,
  hasFeedback,
}: InterviewCardProps) => {
  const formattedDate = new Date(createAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  })

  return (
    <div className="group relative overflow-hidden rounded-xl border bg-card hover:shadow-lg transition-all duration-300">
      <div className="absolute inset-0 gradient-bg opacity-0 group-hover:opacity-5 transition-opacity duration-300" />

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

          {hasFeedback && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
              Completed
            </span>
          )}
        </div>

        {/* Details */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Briefcase className="w-4 h-4 text-purple-500" />
            <span className="font-medium capitalize">
              {contextLabelMap[context] ?? context ?? '—'}
            </span>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground capitalize">{focus ?? '—'}</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <GraduationCap className="w-4 h-4 text-pink-500" />
            <span className="text-muted-foreground">{field ?? '—'}</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">{stageLabelMap[stage] ?? stage ?? '—'}</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-blue-500" />
            <span className="text-muted-foreground">{questions.length} Questions</span>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-4 border-t">
          <Button
            asChild
            variant="outline"
            className="w-full group-hover:border-purple-500 group-hover:text-purple-600 dark:group-hover:border-purple-400 dark:group-hover:text-purple-400 transition-colors"
          >
            <Link
              href={hasFeedback ? `/interview/${interviewId}/feedback` : `/interview/${interviewId}`}
              className="flex items-center justify-center gap-2"
            >
              <TrendingUp className="w-4 h-4" />
              {hasFeedback ? 'Check Feedback' : 'Take Interview'}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default InterviewCard
