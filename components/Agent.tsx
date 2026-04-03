'use client'

import { getInterviewById, saveTranscript } from '@/lib/actions/general.action';
import { buildVapiAssistantConfig } from '@/lib/vapi-action/interview-formatter';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import { cn } from '@/lib/utils';
import { vapi } from '@/lib/vapi.sdk';
import Image from 'next/image';
import { Mic } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

enum CallStatus {
  INACTIVE   = 'INACTIVE',
  CONNECTING = 'CONNECTING',
  ACTIVE     = 'ACTIVE',
  FINISHED   = 'FINISHED',
}

interface SavedMessage {
  role: 'user' | 'system' | 'assistant';
  content: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Agent
// ─────────────────────────────────────────────────────────────────────────────

const Agent = ({
  userName,
  userId,
  type,
  feedbackId,
  interviewId,
  questions,
}: AgentProps) => {
  const router = useRouter();

  const FEEDBACK_STEPS = [
    'Saving your interview transcript...',
    'STAR Method Judge is evaluating your responses...',
    'Competency Judge is evaluating your responses...',
    'Panel is aggregating all verdicts...',
    'Synthesizing personalized feedback...',
    'Finalizing your results...',
  ];

  const [isSpeaking,           setIsSpeaking]           = useState(false);
  const [aiVolume,             setAiVolume]             = useState(0);
  const [callStatus,           setCallStatus]           = useState<CallStatus>(CallStatus.INACTIVE);
  const [messages,             setMessages]             = useState<SavedMessage[]>([]);
  const [error,                setError]                = useState<string | null>(null);
  const [isProcessingFeedback, setIsProcessingFeedback] = useState(false);
  const [feedbackStep,         setFeedbackStep]         = useState(0);

  // ref so the call-end effect always sees the latest messages array
  const messagesRef = useRef<SavedMessage[]>([]);
  messagesRef.current = messages;

  useEffect(() => {
    if (!isProcessingFeedback) {
      setFeedbackStep(0);
      return;
    }
    setFeedbackStep(0);
    const interval = setInterval(() => {
      setFeedbackStep(prev => {
        if (prev < FEEDBACK_STEPS.length - 1) return prev + 1;
        clearInterval(interval);
        return prev;
      });
    }, 2500);
    return () => clearInterval(interval);
  }, [isProcessingFeedback]);

  // ── VAPI event listeners ────────────────────────────────────────────────

  useEffect(() => {
    const onCallStart  = () => { setCallStatus(CallStatus.ACTIVE); setError(null); };
    const onCallEnd    = () => setCallStatus(CallStatus.FINISHED);

    const onMessage = (message: Message) => {
      if (
        message.type === 'transcript' &&
        message.transcriptType === 'final' &&
        typeof message.transcript === 'string'
      ) {
        setMessages(prev => [...prev, { role: message.role, content: message.transcript }]);
      }
    };

    const onSpeechStart  = () => setIsSpeaking(true);
    const onSpeechEnd    = () => setIsSpeaking(false);
    const onVolumeLevel  = (vol: number) => setAiVolume(vol);

    const onError = (error: Error) => {
      console.error('VAPI error:', error);
      setError('Connection issue. Please try again.');
      setCallStatus(CallStatus.INACTIVE);
    };

    vapi.on('call-start',    onCallStart);
    vapi.on('call-end',      onCallEnd);
    vapi.on('message',       onMessage);
    vapi.on('speech-start',  onSpeechStart);
    vapi.on('speech-end',    onSpeechEnd);
    vapi.on('volume-level',  onVolumeLevel);
    vapi.on('error',         onError);

    return () => {
      vapi.off('call-start',    onCallStart);
      vapi.off('call-end',      onCallEnd);
      vapi.off('message',       onMessage);
      vapi.off('speech-start',  onSpeechStart);
      vapi.off('speech-end',    onSpeechEnd);
      vapi.off('volume-level',  onVolumeLevel);
      vapi.off('error',         onError);
    };
  }, []);

  // ── Post-call: route or generate feedback ───────────────────────────────

  useEffect(() => {



    const handleGenerateFeedback = async (messages: SavedMessage[]) => {
      console.log('[Agent] handleGenerateFeedback');
      setIsProcessingFeedback(true);

      try {
        // Build full transcript
        const fullTranscript = messages
          .map(m => `${m.role}: ${m.content}`)
          .join('\n');

        console.log('[Agent] Building transcript:', fullTranscript.length, 'chars');

        // Fetch interview to get context (role, field, stage)
        const interview = await getInterviewById(interviewId!);
        if (!interview) throw new Error('Interview not found');

        // Persist transcript so reevaluation is possible from feedback page
        await saveTranscript(interviewId!, fullTranscript);

        const interviewContext = {
          role:  interview.role  || 'Candidate',
          field: interview.field || 'General',
          stage: (interview.stage as 'student' | 'freshgrad' | 'experienced') || 'experienced',
        };

        console.log('[Agent] Calling /api/evaluate-interview...');

        const response = await fetch('/api/evaluate-interview', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            interviewId:      interview.id ?? interviewId,
            userId:           userId!,
            fullTranscript,
            questions:        interview.questions,
            interviewContext,
          }),
        });

        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.error || 'Evaluation failed');
        }

        const result = await response.json();
        console.log('[Agent] Evaluation complete:', result.evaluationId);
        console.log('[Agent] Overall score:', result.preview.overallScore, '/5.0');

        router.push(`/interview/${interviewId}/feedback`);
      } catch (error) {
        console.error('[Agent] Evaluation error:', error);
        const message = error instanceof Error ? error.message : 'Evaluation failed';
        setError(`Evaluation failed: ${message}. Please try again.`);
      } finally {
        setIsProcessingFeedback(false);
      }
    };

    if (callStatus === CallStatus.FINISHED) {
      if (type === 'generate') {
        router.push('/');
      } else {
        handleGenerateFeedback(messagesRef.current);
      }
    }
  }, [callStatus, feedbackId, interviewId, questions, router, type, userId]);

  // ── Start call ──────────────────────────────────────────────────────────

  const handleCall = async () => {
    setCallStatus(CallStatus.CONNECTING);
    setError(null);

    // Explicitly request mic permission before handing off to Vapi.
    // If the browser has previously blocked the mic, Vapi fails silently —
    // the user can hear the interviewer but their audio is never captured.
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Immediately release — Vapi will open its own stream.
      stream.getTracks().forEach(t => t.stop());
    } catch {
      setError('Microphone access is required. Please allow microphone permission in your browser and try again.');
      setCallStatus(CallStatus.INACTIVE);
      return;
    }

    try {
      if (type === 'generate') {
        // ── "Generate interview" flow — unchanged from original ────────────
        await vapi.start(
          undefined,
          undefined,
          undefined,
          process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID!,
          {
            variableValues: {
              username: userName,
              userid:   userId,
            },
          }
        );
      } else {
        // ── Interview flow — transient assistant ───────────────────────────
        // jobRole and interviewType are left as placeholders here.
        // Wire them in when you expand AgentProps for the full interview feature.
        const assistantConfig = buildVapiAssistantConfig({
          candidateName: userName ?? 'there',
          jobRole:       'the role',
          interviewType: 'behavioral',
          questions:     questions ?? [],
        });

        await vapi.start(assistantConfig as any);
      }
    } catch (err) {
      console.error('Failed to start call:', err);
      setError('Failed to connect. Please check your connection and try again.');
      setCallStatus(CallStatus.INACTIVE);
    }
  };

  // ── End call ────────────────────────────────────────────────────────────

  const handleDisconnect = () => {
    setCallStatus(CallStatus.FINISHED);
    vapi.stop();
  };

  // ── Derived ─────────────────────────────────────────────────────────────

  const latestMessage            = messages[messages.length - 1]?.content;
  const latestRole               = messages[messages.length - 1]?.role;
  const latestSpeaker            = latestRole === 'user' ? (userName ?? 'You') : 'Interviewer';
  const isCallInactiveOrFinished = callStatus === CallStatus.INACTIVE || callStatus === CallStatus.FINISHED;

  // ── Render ──────────────────────────────────────────────────────────────

  const isCallActive = callStatus === CallStatus.ACTIVE;

  return (
    <>
      <LoadingOverlay
        isOpen={isProcessingFeedback}
        title="Analyzing Your Interview"
        description={FEEDBACK_STEPS[feedbackStep]}
      />

    <div className="space-y-6">

      {/* Error banner */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Video Call Section */}
      <div className="relative">
        <div className="grid md:grid-cols-2 gap-6">

          {/* AI Interviewer */}
          <div className="relative group">
            <div className="absolute inset-0 gradient-bg opacity-20 blur-2xl rounded-3xl group-hover:opacity-30 transition-opacity" />
            <div className="relative rounded-2xl border-2 border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 p-8 overflow-hidden">
              <div className="flex flex-col items-center justify-center space-y-4 min-h-[280px]">
                <div className="relative">
                  <div className={cn(
                    "absolute -inset-4 rounded-full transition-all duration-300",
                    isSpeaking ? "bg-purple-400/30 animate-pulse" : "bg-transparent"
                  )} />
                  <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white dark:border-gray-800 shadow-2xl">
                    <Image
                      src="/ai-interviewer.png"
                      alt="AI Interviewer"
                      fill
                      className="object-cover"
                    />
                  </div>
                  {isSpeaking && (
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-0.5">Interviewer</p>
                  <h3 className="text-xl font-bold gradient-bg bg-clip-text text-transparent">
                    AI Interviewer
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {callStatus === CallStatus.ACTIVE
                      ? (isSpeaking ? 'Speaking...' : 'Listening...')
                      : 'Ready to start'}
                  </p>
                </div>

                {/* AI audio level — visible during active call */}
                {isCallActive && (
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex gap-0.5 items-end h-5">
                      {[0.2, 0.4, 0.6, 0.8, 1.0].map((threshold, i) => (
                        <div
                          key={i}
                          className={`w-1 rounded-full transition-all duration-75 ${aiVolume > threshold ? 'bg-purple-500' : 'bg-gray-600'}`}
                          style={{ height: aiVolume > threshold ? `${60 + i * 10}%` : '20%' }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* User */}
          <div className="relative group">
            <div className="absolute inset-0 bg-blue-400/20 blur-2xl rounded-3xl group-hover:opacity-30 transition-opacity opacity-20" />
            <div className="relative rounded-2xl border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 p-8 overflow-hidden">
              <div className="flex flex-col items-center justify-center space-y-4 min-h-[280px]">
                <div className="relative">
                  <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white dark:border-gray-800 shadow-2xl">
                    <div className="bg-black w-full h-full" />
                  </div>
                  {callStatus === CallStatus.ACTIVE && (
                    <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 rounded-full border-2 border-white dark:border-gray-800">
                      <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75" />
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-0.5">Interviewee</p>
                  <h3 className="text-xl font-bold">{userName}</h3>
                  <p className="text-sm text-muted-foreground">
                    {callStatus === CallStatus.ACTIVE ? 'In interview' : 'Candidate'}
                  </p>
                </div>

                {/* User speaking indicator — visible when user's turn (AI not speaking) */}
                {isCallActive && (
                  <div className="flex items-center gap-2 mt-1">
                    <Mic
                      className={`w-4 h-4 transition-all ${!isSpeaking ? 'text-green-500' : 'text-gray-400'}`}
                    />
                    <span className="text-xs text-gray-400">
                      {!isSpeaking ? 'Speaking' : 'Listening'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Live Transcript */}
      {messages.length > 0 && (
        <div className="rounded-xl border bg-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
            <h3 className="font-semibold">Live Transcript</h3>
          </div>
          <div className="min-h-[80px] p-4 rounded-lg bg-secondary/50">
            {latestMessage && (
              <p className="text-xs font-semibold text-muted-foreground mb-1">
                {latestSpeaker}:
              </p>
            )}
            <p className={cn(
              'text-sm leading-relaxed transition-opacity duration-500',
              latestMessage ? 'opacity-100' : 'opacity-50'
            )}>
              {latestMessage || 'Waiting for conversation...'}
            </p>
          </div>
        </div>
      )}

      {/* Call Controls */}
      <div className="flex flex-col items-center gap-4">
        {callStatus !== CallStatus.ACTIVE ? (
          <button
            className="relative group"
            onClick={handleCall}
            disabled={callStatus === CallStatus.CONNECTING}
          >
            <div className="absolute -inset-1 gradient-bg rounded-full blur opacity-75 group-hover:opacity-100 transition" />
            <div className={cn(
              'relative px-12 py-6 rounded-full font-semibold text-white text-lg shadow-xl transition-all',
              'bg-gradient-to-r from-purple-500 to-pink-500',
              'hover:scale-105 active:scale-95',
              callStatus === CallStatus.CONNECTING && 'cursor-wait opacity-80'
            )}>
              {callStatus === CallStatus.CONNECTING && (
                <span className="absolute inset-0 rounded-full bg-white/30 animate-ping" />
              )}
              <span className="relative">
                {isCallInactiveOrFinished ? '🎙️ Start Interview' : 'Connecting...'}
              </span>
            </div>
          </button>
        ) : (
          <button
            className="relative group"
            onClick={handleDisconnect}
          >
            <div className="absolute -inset-1 bg-red-500 rounded-full blur opacity-75 group-hover:opacity-100 transition" />
            <div className={cn(
              'relative px-12 py-6 rounded-full bg-red-500 font-semibold text-white text-lg shadow-xl',
              'hover:bg-red-600 hover:scale-105 active:scale-95 transition-all'
            )}>
              ⏹️ End Interview
            </div>
          </button>
        )}

        <p className="text-sm text-muted-foreground text-center max-w-md">
          {callStatus === CallStatus.INACTIVE   && 'Click the button above to begin your interview session'}
          {callStatus === CallStatus.CONNECTING && 'Connecting to AI interviewer...'}
          {callStatus === CallStatus.ACTIVE     && 'Interview in progress — speak clearly and confidently'}
          {callStatus === CallStatus.FINISHED   && 'Generating your feedback...'}
        </p>
      </div>

    </div>
    </>
  );
};

export default Agent;