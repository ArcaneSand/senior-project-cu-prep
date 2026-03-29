import { getCurrentUser } from "@/lib/actions/auth.action";
import { Mic } from "lucide-react";
import Link from "next/link";

const Navbar = async () => {
  const user = await getCurrentUser();
  const isLoggedIn = !!user;

  return (
    <nav className="fixed top-0 inset-x-0 z-50 h-[72px] flex items-center border-b border-border bg-bgc/80 backdrop-blur-md">
      <div className="w-full max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
            <Mic className="text-white" size={16} />
          </div>
          <span className="text-lg font-bold text-foreground tracking-tight">
            CU<span className="gradient-bg bg-clip-text text-transparent">Prep</span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href={isLoggedIn ? "/profile" : "/sign-in"}
            className="px-4 py-1.5 text-sm font-medium rounded-lg gradient-bg text-white hover:opacity-90 transition-opacity"
          >
            {isLoggedIn ? "Profile" : "Sign in"}
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
