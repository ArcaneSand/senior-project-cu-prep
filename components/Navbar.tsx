import { Mic } from "lucide-react"
import Link from "next/link"

const Navbar = () => {
  return (
        <nav className="px-12 py-6 w-full shadow-2xl fixed top-0">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
            <Link href='/'>
            <div className="flex items-center gap-3">
                
                <div className="w-10 h-10 bg-linear-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <Mic className="text-white" size={24} />
                </div>
                <span className="text-2xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    CUPrep
                </span>
            </div>
            </Link>
            <div className="flex items-center gap-8">
            <a href="#" className="text-gray-600 hover:text-gray-900 font-medium">Features</a>
            <a href="#" className="text-gray-600 hover:text-gray-900 font-medium">Pricing</a>
            <a href="#" className="text-gray-600 hover:text-gray-900 font-medium">About</a>
            <Link href='/sign-in'>
            <button 
                className="px-6 py-2 bg-linear-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all"
            >
                Sign-in
            </button>
            </Link>
            </div>
            </div>
        </nav>
  )
}

export default Navbar