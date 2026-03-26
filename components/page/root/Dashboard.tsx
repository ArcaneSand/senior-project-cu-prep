import React from 'react'
import Link from 'next/link'
import InterviewCard from '@/components/InterviewCard'
import { getInterviewsByUserId, getFeedbackByInterviewId } from '@/lib/actions/general.action'

interface DashboardProps {
  userId: string
}

const Dashboard = async ({ userId }: DashboardProps) => {
  const interviews = await getInterviewsByUserId(userId)

  if (!interviews || interviews.length === 0) {
    return (
      <section className="w-full max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-semibold mb-6">Your Interviews</h2>
        <p className="text-muted-foreground">No interviews yet. Create one to get started!</p>
      </section>
    )
  }

  const feedbackResults = await Promise.all(
    interviews.map((interview) =>
      getFeedbackByInterviewId({ interviewId: interview.id, userId })
    )
  )

  return (
    <section className="w-full max-w-6xl mx-auto px-4">
      <div className="py-[30px]">
        <Link href="/interview" className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-700 transition-colors">
          Schedule New Interview
        </Link>
      </div>
      <h2 className="text-2xl font-semibold mb-6">Your Interviews</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
    </section>
  )
}

export default Dashboard
