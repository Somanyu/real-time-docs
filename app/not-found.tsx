// Global 404

import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function GlobalNotFound() {
    return (
        <div className="h-screen w-screen flex items-center justify-center">
            <div className="container flex flex-col md:flex-row items-center justify-center px-5 text-gray-700">
                <div className="max-w-md">
                    <div className="text-5xl font-dark font-bold">404</div>
                    <p className="text-2xl md:text-3xl font-light leading-normal">Sorry we couldn&#39;t find this page. </p>
                    <p className="mb-8">But don&#39;t worry, you can find plenty of other things on our homepage.</p>

                    {/* <button className="px-4 inline py-2 text-sm font-medium leading-5 shadow text-white transition-colors duration-150 border border-transparent rounded-lg focus:outline-none focus:shadow-outline-blue bg-blue-600 active:bg-blue-600 hover:bg-blue-700">back to homepage</button> */}
                    <Button>Back to homepage</Button>
                </div>
                <div className="max-w-lg">
                    <Image src="/404.svg" width={400} height={400} alt="Not found illustration" />

                </div>

            </div>
        </div>
    )
}
