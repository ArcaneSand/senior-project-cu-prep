import Hero from "@/components/ui/page/root/Hero";
import { getCurrentUser } from "@/lib/actions/auth.action";
import Image from "next/image";

const page = async()=> {
  const user = await getCurrentUser();

  return (
    <>
      <div className="w-full max-w-6xl mx-auto h-[480px] flex text-white">
        <Hero />
      </div>
    </>
  );
}
export default page