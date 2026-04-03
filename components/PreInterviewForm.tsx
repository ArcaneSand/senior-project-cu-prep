"use client";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import FormField from "./FormField";
import { LoadingOverlay } from "./LoadingOverlay";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { toast } from "sonner";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { useRouter } from "next/navigation";
import { generateQuestions } from "@/lib/actions/general.action";

// ─────────────────────────────────────────────────────────────────────────────
// Schema
// ─────────────────────────────────────────────────────────────────────────────

const preInterviewFormSchema = z.object({
  context: z.string().min(1, "Please select an interview context"),
  focus:   z.string().min(1, "Please select an interview focus"),
  role:    z.string().min(2, "Position must be at least 2 characters").max(100),
  field:   z.string().min(2, "Industry / field must be at least 2 characters").max(100),
  stage:   z.string().min(1, "Please select your applicant stage"),
  amount:  z.number().min(1).max(20, "Maximum 20 questions allowed"),
  additionalInfo: z.string().max(1000).optional(),
  userid:  z.string().optional(),
});

export type PreInterviewFormValues = z.infer<typeof preInterviewFormSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

const PreInterviewForm = () => {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);

  const form = useForm<PreInterviewFormValues>({
    resolver: zodResolver(preInterviewFormSchema),
    defaultValues: {
      context:        "",
      focus:          "",
      role:           "",
      field:          "",
      stage:          "",
      amount:         5,
      additionalInfo: "",
      userid:         "",
    },
  });

  async function onSubmit(values: PreInterviewFormValues) {
    setIsGenerating(true);
    try {
      const user = await getCurrentUser();
      if (!user) {
        toast.error("User not found. Please log in again.");
        router.push("/auth/sign-in");
        return;
      }

      const result = await generateQuestions({
        ...values,
        userid: user.id,
      });

      if (!result) {
        toast.error("There was an error generating questions. Please try again.");
        router.refresh();
        return;
      }

      toast.success("Interview session created!");
      router.push("/");
    } catch (error) {
      console.error(error);
      toast.error(`Something went wrong: ${error}`);
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <>
      <LoadingOverlay
        isOpen={isGenerating}
        title="Generating Interview Questions"
        description="Our AI is crafting personalized questions for you..."
      />
    <div className="flex justify-center lg:min-w-[566px]">
      <div className="flex flex-col gap-6 px-10 max-w-[646px] w-full">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full space-y-6 mt-4 form"
          >

            {/* Interview Context */}
            <FormField
              control={form.control}
              name="context"
              label="Interview Context"
              type="context"
              variant="radio"
              options={[
                { value: "job",        label: "Job Application" },
                { value: "internship", label: "Internship Application" },
              ]}
            />

            {/* Interview Focus */}
            <FormField
              control={form.control}
              name="focus"
              label="Interview Focus"
              type="focus"
              variant="radio"
              options={[
                { value: "behavioral", label: "Behavioral" },
                { value: "technical",  label: "Technical" },
                { value: "mixed",      label: "Mixed" },
              ]}
            />

            {/* Position / Role */}
            <FormField
              control={form.control}
              name="role"
              label="Position or Role"
              placeholder="e.g. Marketing Manager, Software Engineer, Financial Analyst"
              type="role"
            />

            {/* Industry / Field */}
            <FormField
              control={form.control}
              name="field"
              label="Industry / Field"
              placeholder="e.g. Finance, Healthcare, Software Engineering, Education"
              type="field"
            />

            {/* Applicant Stage */}
            <FormField
              control={form.control}
              name="stage"
              label="Applicant Stage"
              type="stage"
              variant="radio"
              options={[
                { value: "student",    label: "Student" },
                { value: "freshgrad",  label: "Fresh Graduate" },
                { value: "experienced", label: "Experienced" },
              ]}
            />

            {/* Number of Questions */}
            <FormField
              control={form.control}
              name="amount"
              label="Number of Questions"
              placeholder="How many questions do you want? (max 20)"
              type="number"
            />

            {/* Additional Information */}
            <FormField
              control={form.control}
              name="additionalInfo"
              label="Additional Information"
              placeholder={
                "Optional — helps generate sharper, more relevant questions.\n" +
                "e.g. The company you are applying to, your background or experience, " +
                "a specific area you want to practise, or anything the interviewer is likely to ask about."
              }
              type="additionalInfo"
              variant="textarea"
            />

            <Button className="gradient-bg" type="submit">
              Generate Interview
            </Button>

          </form>
        </Form>
      </div>
    </div>
    </>
  );
};

export default PreInterviewForm;