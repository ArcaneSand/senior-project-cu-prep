# UI IMPROVEMENTS - Focused Task List

## Context
Project: CU-Prep mock interview platform
Current state: Dark theme, functional but buttons aren't obvious, missing feedback indicators
Designer: @.claude/PROJECT_STATE.md has full architecture

---

## Task 1: Button Design Overhaul (HIGH PRIORITY)

**Problem:** Buttons don't look clickable enough

**Files to Update:**
- `components/ui/button.tsx` (primary component)
- All pages using buttons (scan for `<Button>` or `<button>`)

**Requirements:**
1. **Visual Hierarchy:**
   - Primary actions: Bright gradient or solid color, obvious hover state
   - Secondary: Outlined, clear hover
   - Danger/destructive: Red tint, clear distinction

2. **Hover States:**
   - Smooth scale transform: `hover:scale-105 transition-transform`
   - Color shift or brightness increase
   - Cursor always `cursor-pointer`

3. **Active States:**
   - Pressed effect: `active:scale-95`
   - Feedback that click registered

4. **Focus States:**
   - Visible ring for keyboard navigation: `focus-visible:ring-2`

**Design Pattern:**
```tsx
// Example primary button style
className="
  bg-gradient-to-r from-blue-600 to-indigo-600
  hover:from-blue-500 hover:to-indigo-500
  active:scale-95
  transition-all duration-200
  cursor-pointer
  shadow-lg hover:shadow-xl
  rounded-lg px-6 py-3
  font-semibold text-white
  focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2
"
```

**Shadcn Button Variants to Update:**
```tsx
// In components/ui/button.tsx
const buttonVariants = cva(
  "inline-flex items-center justify-center ... cursor-pointer transition-all", // Add these
  {
    variants: {
      variant: {
        default: "bg-primary hover:bg-primary/90 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg",
        secondary: "bg-secondary hover:bg-secondary/80 hover:scale-105 active:scale-95",
        outline: "border-2 hover:bg-accent hover:scale-105 active:scale-95",
        // ... update all variants
      }
    }
  }
)
```

**Testing:**
- [ ] All buttons have visible hover state
- [ ] Cursor changes to pointer on hover
- [ ] Scale or color shift is obvious
- [ ] Mobile: buttons are large enough (min 44x44px)
- [ ] Keyboard: focus ring visible

---

## Task 2: Voice Activity Indicator (VAPI Feedback)

**Problem:** Users don't know if Vapi is hearing them

**File:** `components/Agent.tsx`

**Requirements:**

1. **Add voice activity state:**
```tsx
const [isSpeaking, setIsSpeaking] = useState(false);
const [isListening, setIsListening] = useState(false);
```

2. **Hook into Vapi events:**
```tsx
useEffect(() => {
  if (!vapi) return;
  
  // User is speaking
  vapi.on('speech-start', () => setIsSpeaking(true));
  vapi.on('speech-end', () => setIsSpeaking(false));
  
  // AI is listening
  vapi.on('call-start', () => setIsListening(true));
  vapi.on('call-end', () => setIsListening(false));
  
  return () => {
    vapi.off('speech-start');
    vapi.off('speech-end');
    vapi.off('call-start');
    vapi.off('call-end');
  };
}, [vapi]);
```

3. **Add visual indicator:**
```tsx
{/* Voice Activity Indicator */}
{isListening && (
  <div className="fixed bottom-24 right-6 z-50">
    <div className="bg-gray-900/90 backdrop-blur-sm rounded-full px-6 py-3 shadow-xl border border-gray-700">
      <div className="flex items-center gap-3">
        {/* Microphone Icon with Animation */}
        <div className={`relative ${isSpeaking ? 'animate-pulse' : ''}`}>
          <Mic className={`w-5 h-5 ${isSpeaking ? 'text-green-500' : 'text-gray-400'}`} />
          
          {/* Pulsing ring when speaking */}
          {isSpeaking && (
            <span className="absolute inset-0 animate-ping">
              <Mic className="w-5 h-5 text-green-500 opacity-75" />
            </span>
          )}
        </div>
        
        {/* Status Text */}
        <span className={`text-sm font-medium ${isSpeaking ? 'text-green-500' : 'text-gray-400'}`}>
          {isSpeaking ? 'Speaking...' : 'Listening'}
        </span>
        
        {/* Audio Bars Animation */}
        {isSpeaking && (
          <div className="flex items-center gap-1">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-1 bg-green-500 rounded-full animate-audio-bar"
                style={{
                  height: '16px',
                  animationDelay: `${i * 0.1}s`
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  </div>
)}
```

4. **Add audio bar animation to globals.css:**
```css
@keyframes audio-bar {
  0%, 100% { height: 8px; }
  50% { height: 20px; }
}

.animate-audio-bar {
  animation: audio-bar 0.6s ease-in-out infinite;
}
```

**Testing:**
- [ ] Indicator appears when call starts
- [ ] Shows "Listening" when idle
- [ ] Shows "Speaking..." with green pulse when user talks
- [ ] Audio bars animate when speaking
- [ ] Disappears when call ends

---

## Task 3: Sonner Toast Styling (Match Dark Theme)

**Problem:** Toast notifications don't match app vibe

**File:** `app/layout.tsx` or create `components/CustomToaster.tsx`

**Requirements:**

1. **Override Sonner default styles:**
```tsx
// In layout.tsx, update Toaster component
<Toaster
  theme="dark"
  position="top-right"
  toastOptions={{
    style: {
      background: 'rgb(23, 23, 23)', // Very dark bg
      border: '1px solid rgb(38, 38, 38)', // Subtle border
      color: 'rgb(250, 250, 250)', // Light text
      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
    },
    className: 'backdrop-blur-sm',
    duration: 4000,
  }}
  richColors
/>
```

2. **Custom toast variants:**
```tsx
// In files that use toast (e.g., AuthForm.tsx, PreInterviewForm.tsx)
import { toast } from 'sonner';

// Success
toast.success('Interview created!', {
  description: 'Starting your session...',
  icon: '✨',
});

// Error
toast.error('Generation failed', {
  description: error.message,
  icon: '⚠️',
});

// Loading (for API calls)
const toastId = toast.loading('Generating questions...', {
  description: 'This may take a few seconds',
});

// Update when done
toast.success('Questions ready!', { id: toastId });
```

**Testing:**
- [ ] Toasts are dark themed
- [ ] Text is readable (high contrast)
- [ ] Icons and colors match success/error/info states
- [ ] Backdrop blur adds depth
- [ ] Position doesn't overlap with other UI

---

## Task 4: Loading Popup for AI Generation

**Problem:** No feedback during `generateQuestions` API call

**Files:**
- `components/PreInterviewForm.tsx` (where generateQuestions is called)
- Create `components/LoadingOverlay.tsx` (reusable)

**Requirements:**

1. **Create reusable LoadingOverlay component:**
```tsx
// components/LoadingOverlay.tsx
'use client';

import { Loader2 } from 'lucide-react';

interface LoadingOverlayProps {
  isOpen: boolean;
  title?: string;
  description?: string;
}

export function LoadingOverlay({
  isOpen,
  title = 'Processing...',
  description = 'Please wait while we work on your request'
}: LoadingOverlayProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 max-w-sm w-full mx-4 shadow-2xl">
        <div className="flex flex-col items-center text-center space-y-4">
          {/* Spinning loader */}
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
          
          {/* Title */}
          <h3 className="text-xl font-semibold text-white">
            {title}
          </h3>
          
          {/* Description */}
          <p className="text-sm text-gray-400">
            {description}
          </p>
          
          {/* Progress dots animation */}
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
```

2. **Integrate into PreInterviewForm:**
```tsx
// In PreInterviewForm.tsx
import { LoadingOverlay } from './LoadingOverlay';

const [isGenerating, setIsGenerating] = useState(false);

async function onSubmit(values: z.infer<typeof interviewFormSchema>) {
  setIsGenerating(true); // Show overlay
  
  try {
    await generateQuestions({...values});
    toast.success('Interview created successfully!');
    router.push('/');
  } catch (error) {
    toast.error('Failed to generate questions', {
      description: error.message
    });
  } finally {
    setIsGenerating(false); // Hide overlay
  }
}

// In render:
return (
  <>
    <LoadingOverlay
      isOpen={isGenerating}
      title="Generating Interview Questions"
      description="Our AI is crafting personalized questions for you..."
    />
    
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* form fields */}
    </form>
  </>
);
```

3. **Also add to feedback generation:**
```tsx
// In Agent.tsx, when calling createFeedback
const [isProcessingFeedback, setIsProcessingFeedback] = useState(false);

const handleEndCall = async () => {
  setIsProcessingFeedback(true);
  
  try {
    await createFeedback({...});
    router.push(`/interview/${id}/feedback`);
  } finally {
    setIsProcessingFeedback(false);
  }
};

// In render:
<LoadingOverlay
  isOpen={isProcessingFeedback}
  title="Analyzing Your Interview"
  description="Our AI judges are evaluating your performance..."
/>
```

**Testing:**
- [ ] Overlay appears immediately on submit
- [ ] Blocks interaction with form behind it
- [ ] Spinner animates smoothly
- [ ] Message is encouraging, not technical
- [ ] Disappears when API call completes/fails
- [ ] Works on mobile (overlay is responsive)

---

## Implementation Order

1. **LoadingOverlay** (20 min) - Create reusable component first
2. **Integrate LoadingOverlay** (10 min) - Add to PreInterviewForm and Agent
3. **Button redesign** (45 min) - Update button variants, scan all buttons
4. **Voice indicator** (30 min) - Add to Agent.tsx with Vapi events
5. **Sonner styling** (15 min) - Update Toaster config

**Total time:** ~2 hours

---

## Quality Gates

Before marking complete:
- [ ] All buttons have obvious hover states (test by hovering without reading code)
- [ ] Voice indicator shows when speaking to Vapi
- [ ] Loading overlay blocks interaction during API calls
- [ ] Toasts match dark theme
- [ ] No console errors
- [ ] Mobile: all elements responsive

---

## Files Summary

**Create new:**
- `components/LoadingOverlay.tsx`

**Modify:**
- `components/ui/button.tsx` (button variants)
- `components/Agent.tsx` (voice indicator)
- `components/PreInterviewForm.tsx` (loading overlay)
- `app/layout.tsx` (Sonner config)
- `app/globals.css` (audio-bar animation)

**Scan and update:**
- All files with `<Button>` components (ensure consistent styling)