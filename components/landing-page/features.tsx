import { Puzzle, Shield, Zap } from "lucide-react";

export default function LandingPageFeatures() {
    return (
        <section className="">
            <div className="py-8 px-4 mx-auto max-w-7xl sm:py-16 lg:px-6">
                <div className="space-y-8 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-12 md:space-y-0">
                    <div>
                        <div className="flex justify-center items-center mb-4 w-10 h-10 rounded-full bg-primary lg:h-12 lg:w-12">
                            <Zap className="size-5 text-primary-foreground" />
                        </div>
                        <h3 className="mb-2 text-xl font-bold">Lightning Fast</h3>
                        <p className="text-gray-500">Built on popular engine that ensures your team sees every keystroke under 50ms. No more sync conflicts.</p>
                    </div>
                    <div>
                        <div className="flex justify-center items-center mb-4 w-10 h-10 rounded-full bg-primary lg:h-12 lg:w-12">
                            <Shield className="size-5 text-primary-foreground" />
                        </div>
                        <h3 className="mb-2 text-xl font-bold">Enterprise Security</h3>
                        <p className="text-gray-500">Protect your documents with our structured workflows and custom permissions made for you.</p>
                    </div>
                    <div>
                        <div className="flex justify-center items-center mb-4 w-10 h-10 rounded-full bg-primary lg:h-12 lg:w-12">
                            <Puzzle className="size-5 text-primary-foreground" />
                        </div>
                        <h3 className="mb-2 text-xl font-bold">Modular Workflow</h3>
                        <p className="text-gray-500">Connect with Slack and embed live data widgets directly into your shared documents seamlessly.</p>
                    </div>
                </div>
            </div>
        </section>
    )
}