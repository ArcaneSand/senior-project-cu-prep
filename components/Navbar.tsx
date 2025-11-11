import Link from "next/link"

const Navbar = () => {
  return (
    <nav className="w-screen bg-black shadow-4xl h-[50px] fixed">
        <div className="flex justify-between h-full items-center p-4 text-center text-white">
            <Link href={'/'}>
                <h3 className="font-bold text-3xl">Home</h3>
            </Link>
            <div>
                <Link href={'/sign-in'}>
                    <h2>Profile</h2>
                </Link>
                
            </div>
        </div>
    </nav>
  )
}

export default Navbar