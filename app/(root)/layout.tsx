import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/actions/auth.action";

const layout = async ({children}:{children: React.ReactNode}) => {


    return (
    <div>
        <div className="pt-[2px]">
            {children}
        </div>
    </div>
  )
}

export default layout