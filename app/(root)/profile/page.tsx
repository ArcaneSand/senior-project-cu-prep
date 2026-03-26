import { getCurrentUser, signOut } from "@/lib/actions/auth.action";
import { redirect } from "next/navigation";
import { LogOut } from "lucide-react";

const ProfilePage = async () => {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const handleSignOut = async () => {
    "use server";
    await signOut();
    redirect("/sign-in");
  };

  return (
    <div className="max-w-md mx-auto mt-20 px-6">
      <h1 className="text-2xl font-bold mb-2">Profile</h1>
      <p className="text-muted-foreground mb-8">{user.email}</p>

      <form action={handleSignOut}>
        <button
          type="submit"
          className="flex button items-center gap-2 px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </form>
    </div>
  );
};

export default ProfilePage;
