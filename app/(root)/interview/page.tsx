import PreInterviewForm from "@/components/PreInterviewForm";

const page = () => {
  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Set Up Your Interview</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Tell us about the role and your background — we&apos;ll generate a tailored question set.
        </p>
      </div>
      <PreInterviewForm />
    </div>
  );
};

export default page;
