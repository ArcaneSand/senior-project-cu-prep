import Hero from "@/components/page/root/Hero";
import Dashboard from "@/components/page/root/Dashboard";
import { getCurrentUser } from "@/lib/actions/auth.action";

const page = async()=> {
  const user = await getCurrentUser();

  return (
    <>
      {!user && <Hero />}
      {user && <Dashboard userId={user.id} />}
    </>
  );
}
export default page