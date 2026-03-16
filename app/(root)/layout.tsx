import { isAuthenticated } from '@/lib/actions/auth.action';
import { redirect } from 'next/navigation';
import React from 'react'
import Navbar from '@/components/Navbar';

const layout = async ({children}:{children: React.ReactNode}) => {
    const isUserAuthenticated = await isAuthenticated();
    if(!isUserAuthenticated) redirect('/sign-in'); // Replace with actual authentication check
    return (
    <div>
        <Navbar />
        <div className="pt-[85px]">
            {children}
        </div>
    </div>
  )
}

export default layout