import Link from "next/link";

export default function LandingPageFooter() {
    return (


        <footer className="bg-neutral-primary-soft rounded-base shadow-xs m-4">
            <div className="w-full mx-auto max-w-7xl p-4 md:flex md:items-center md:justify-between">
                <span className="text-sm text-body sm:text-center">© {new Date().getFullYear()} <span>RealTime Docs</span>. All Rights Reserved.
                </span>
                <ul className="flex flex-wrap items-center mt-3 text-sm font-medium text-body sm:mt-0">
                    <li>
                        <Link href="#" className="hover:underline me-4 md:me-6">About</Link>
                    </li>
                    <li>
                        <Link href="#" className="hover:underline me-4 md:me-6">Privacy Policy</Link>
                    </li>
                    <li>
                        <Link href="#" className="hover:underline me-4 md:me-6">Licensing</Link>
                    </li>
                    <li>
                        <Link href="#" className="hover:underline">Contact</Link>
                    </li>
                </ul>
            </div>
        </footer>

    )
}