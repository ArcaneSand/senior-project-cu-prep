import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/actions/auth.action";

export default async function Layout({ children }: { children: React.ReactNode }){
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  return (
    <>
        {children}
    </>
  );
};
