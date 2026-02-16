
import LandingPageFeatures from "@/components/landing-page/features";
import LandingPageFooter from "@/components/landing-page/footer";
import LandingPageHeader from "@/components/landing-page/header";
import LandingPageHeroSection from "@/components/landing-page/hero-section";
import LandingPagePricing from "@/components/landing-page/pricing";

export default function LandingPage() {

    return (
        <div className="space-y-12">
            <LandingPageHeader />
            <LandingPageHeroSection />
            <LandingPageFeatures />
            <LandingPagePricing />
            <LandingPageFooter />
        </div>
    )
}