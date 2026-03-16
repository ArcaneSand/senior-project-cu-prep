"use client";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import FormField from "./FormField";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { useRouter } from "next/navigation";
import { generateQuestions } from "@/lib/actions/general.action";


const preInterviewFormSchema = z.object({
  type: z.string().min(1, "Please select an interview type"),
  role: z.string().min(2, "Role must be at least 2 characters").max(100),
  level: z.string().min(1, "Please select a level"),
  techstack: z.string().min(2, "Tech stack must be at least 2 characters").max(100),
  amount: z.number().min(1, "Amount must be at least 1").max(50, "Maximum 50 questions allowed"),
  userid: z.string().optional(),
});

const PreInterviewForm = () => {
    const rounter = useRouter();
    const formSchema = preInterviewFormSchema;
      // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "",
      role: "",
      level: "",
      techstack: "",
      amount: 5,
      userid: "",
    },
  })
 
  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log("Form Values:", values);
    try{
        const { type, role, level, techstack, amount} = values;
        const userid = await getCurrentUser();
        if(!userid){
            toast.error("User not found. Please log in again.");
            rounter.push('/auth/sign-in');
            return;
        }
        const result = await generateQuestions({
            type,
            role,
            level,
            techstack,
            amount,
            userid: userid.id
        });
        if(!result){
            toast.error("There was an error generating questions. Please try again.");
            rounter.refresh();
            return;
        }
        toast.success("Questions generated successfully!");
        rounter.push('/');

    }catch(error){
        console.log(error);
        toast.error(`There was an error: ${error}`);
    }
  }
  return (
    <div className="flex justify-center lg:min-w-[566px] ">
      <div className="flex flex-col gap-6 px-10 max-w-[646px] w-full">

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full space-y-6 mt-4 form"
          >

            <FormField
              control={form.control}
              name="type"
              label="Type"
              placeholder="type of interview"
              type="type"
              variant="radio"
              options={[{ value: 'Behavioral', label: 'Behavioral' }, { value: 'Technical', label: 'Technical' }]}
            />

            <FormField
              control={form.control}
              name="role"
              label="role"
              placeholder="Ex : Frontend Developer, Backend Developer, Data Scientist etc"
              type="role"
            />

            <FormField
              control={form.control}
              name="level"
              label="Level"
              placeholder="Enter your level here"
              type="level"
              variant="radio"
              options={[{ value: 'junior', label: 'Junior' }, { value: 'middle', label: 'Middle' }, { value: 'senior', label: 'Senior' }]}
            />
            <FormField
              control={form.control}
              name="techstack"
              label="Tech Stack"
              placeholder="Ex: React, Node.js, Python etc"
              type="techstack"
            />
            <FormField
              control={form.control}
              name="amount"
              label="Amount"
              placeholder="How many questions do you want to generate?"
              type="number"
            />

            <Button className="gradiant-bg" type="submit">
              Submit
            </Button>
          </form>
        </Form>
      </div>
    </div>
  )
}

export default PreInterviewForm 