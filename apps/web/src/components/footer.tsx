import Link from "next/link";
import { Building2 } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black py-12">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-blue-600 text-white">
              <Building2 className="size-4" />
            </div>
            <span className="text-xl font-bold tracking-tight">eMakao</span>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-400">
            <Link href="http://localhost:3000" className="hover:text-white transition-colors">
              Agency Login
            </Link>
            <Link href="http://localhost:3002" className="hover:text-white transition-colors">
              Resident Portal
            </Link>
            <Link href="#" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
        
        <div className="mt-8 text-center text-sm text-gray-600">
          &copy; {new Date().getFullYear()} eMakao. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
