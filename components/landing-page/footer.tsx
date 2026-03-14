export default function LandingPageFooter() {
    return (
        <footer className="m-4 mx-auto">
            <div className="w-full max-w-7xl mx-auto p-4 md:py-8">
                <hr className="my-6 border-default sm:mx-auto lg:my-8" />
                <span className="block text-sm text-body text-center">© {new Date().getFullYear()} RealTime Docs. All Rights Reserved.</span>
            </div>
        </footer>
    )
}