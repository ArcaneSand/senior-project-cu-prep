import InterviewCard from '@/components/InterviewCard'
import { Button } from '@/components/ui/button'
import { getCurrentUser } from '@/lib/actions/auth.action'
import { getInterviewsByUserId, getInverviewsByID} from '@/lib/actions/general.action'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'



const page = async () => {

  const user = await getCurrentUser();

  const [userInterviewsRaw] = await Promise.all([
    getInterviewsByUserId(user?.id!)
  ]);

  const userInterviews = userInterviewsRaw ?? [];
  const hasPastInterviews = userInterviews.length > 0;

  const testInterview = await getInverviewsByID('getInverviewsByID');
  console.log(testInterview);


  return (
<div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-6 py-20 md:py-20">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-purple-950/20 dark:via-pink-950/20 dark:to-blue-950/20" />

        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
            {/* Text Content */}
            <div className="flex flex-col gap-8 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 dark:bg-purple-900/30 w-fit">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                </span>
                <span className="text-sm font-medium text-purple-700 dark:text-purple-300">AI-Powered Interview Practice</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild className="gradiant-bg text-white hover:opacity-90 transition-opacity px-8 py-6 text-lg">
                  <Link href="/interview">Start Interview Now</Link>
                </Button>
                <Button asChild variant="outline" className="px-8 py-6 text-lg border-2">
                  <Link href="#your-interviews">View My Progress</Link>
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8 border-t">
                <div>
                  <div className="text-3xl font-bold gradiant-bg bg-clip-text text-transparent">Mock</div>
                  <div className="text-sm text-muted-foreground">Questions</div>
                </div>
                <div>
                  <div className="text-3xl font-bold gradiant-bg bg-clip-text text-transparent">AI</div>
                  <div className="text-sm text-muted-foreground">Feedback</div>
                </div>
                <div>
                  <div className="text-3xl font-bold gradiant-bg bg-clip-text text-transparent">24/7</div>
                  <div className="text-sm text-muted-foreground">Available</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Your Interviews Section */}
      <section id="your-interviews" className="px-6 py-16 bg-background">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-8">
            <div className="space-y-2">
              <h2 className="text-4xl font-bold tracking-tight">Your Interviews</h2>
              <p className="text-muted-foreground text-lg">
                Track your progress and review past interview sessions
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {hasPastInterviews ? (
                userInterviews?.map((interview) => (
                  <InterviewCard  {...interview} key={interview.id} interviewId={interview.id} />
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-16 px-6 text-center border-2 border-dashed rounded-xl">
                  <div className="gradiant-bg rounded-full p-6 mb-4 opacity-20">
                    <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No interviews yet</h3>
                  <p className="text-muted-foreground mb-6 max-w-md">
                    Start your first AI-powered interview practice session and track your progress here.
                  </p>
                  <Button asChild className="gradiant-bg text-white">
                    <Link href="/interview">Start Your First Interview</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div> 
      </section>
    </div>
  )
}

export default page