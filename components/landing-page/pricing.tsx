"use client"

import { useState } from "react";
import { Badge } from "../ui/badge";
import { Switch } from "../ui/switch";
import { Button } from "../ui/button";
import { Check } from "lucide-react";
import { PricingPlan } from "@/types/landing-page";

export default function LandingPagePricing() {
    const [isYearly, setIsYearly] = useState<boolean>(false)

    const pricingPlans: PricingPlan[] = [
        {
            name: "Starter",
            description: "Best option for personal use & for your next project.",
            monthlyPrice: 29,
            yearlyPrice: 29 * 12 * 0.8, // 20% discount
            features: [
                "Individual configuration",
                "No setup, or hidden fees",
                "Team size: 1 developer",
                "Premium support: 6 months",
                "Free updates: 6 months",
            ],
            cta: "Get Started",
        },
        {
            name: "Pro",
            description:
                "Relevant for multiple users, extended & premium support.",
            monthlyPrice: 99,
            yearlyPrice: 99 * 12 * 0.8,
            features: [
                "Individual configuration",
                "No setup, or hidden fees",
                "Team size: 10 developers",
                "Premium support: 24 months",
                "Free updates: 24 months",
            ],
            cta: "Upgrade to Pro",
            highlighted: true,
        },
        {
            name: "Enterprise",
            description:
                "Best for large scale uses and extended redistribution rights.",
            monthlyPrice: 499,
            yearlyPrice: 499 * 12 * 0.8,
            features: [
                "Individual configuration",
                "No setup, or hidden fees",
                "Team size: 100+ developers",
                "Premium support: 36 months",
                "Free updates: 36 months",
            ],
            cta: "Contact Sales",
        },
    ]

    const calculateYearlyPrice = (
        monthly: number,
        discount: number
    ) => Math.round(monthly * 12 * (1 - discount / 100))

    return (
        <div>
            <div className="mx-auto max-w-4xl text-center">
                <p className="text-primary uppercase text-sm">Pricing Plans</p>
                <h1 className="text-3xl font-bold leading-tight text-gray-900 sm:leading-tight sm:text-3xl lg:text-4xl lg:leading-tight font-pj">
                    Simple, transparent pricing
                </h1>
                <div className="max-w-xl mx-auto">
                    <p className="text-base text-gray-500 font-inter">Whether you are a solo creator or a growing enterprise, RealTime Docs scales with your team&#39;s needs. No hidden fees.</p>
                </div>
                <div className="flex items-center justify-center gap-x-3 mt-8">
                    <p className={`text-base font-inter transition-colors ${isYearly ? "text-gray-500" : "text-primary"}`}>Monthly</p>
                    <Switch id="switch-pricing-plans" checked={isYearly} onCheckedChange={setIsYearly} />
                    <p className={`text-base font-inter transition-colors ${isYearly ? "text-primary" : "text-gray-500"}`}>Yearly</p>
                    <Badge className="bg-green-50 text-primary border-primary text-sm capitalize">Save 20%</Badge>
                </div>
            </div>

            <div className="space-y-8 lg:grid lg:grid-cols-3 sm:gap-6 xl:gap-10 lg:space-y-0 px-16 mt-8">
                {pricingPlans.map((plan) => {
                    const price = isYearly ? calculateYearlyPrice(plan.monthlyPrice, 20) : plan.monthlyPrice

                    return (
                        <div
                            key={plan.name}
                            className={`flex flex-col p-6 mx-auto max-w-lg text-center bg-white rounded-xl 
                                ${plan.highlighted
                                    ? "border-2 border-primary shadow-[inset_0px_1px_1px_0px_rgba(255,255,255,0.1),0px_50px_100px_-20px_rgba(50,50,93,0.25),0px_30px_60px_-30px_rgba(0,0,0,0.3)]"
                                    : "border border-gray-100"
                                }`}
                        >
                            <h3 className="mb-4 text-2xl font-semibold">{plan.name}</h3>

                            <p className="font-light text-gray-500 sm:text-lg">{plan.description}</p>

                            <div className="flex justify-center items-baseline my-8">
                                <span className="mr-2 text-5xl font-extrabold">${price}</span>
                                <span className="text-gray-500">/{isYearly ? "year" : "month"}</span>
                            </div>

                            <ul className="mb-8 space-y-4 text-left">
                                {plan.features.map((feature, index) => (
                                    <li key={index + 1} className="flex items-center space-x-3">
                                        <Check className="shrink-0 size-5 text-primary" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <Button variant={plan.highlighted ? "default" : "outline"}>{plan.cta}</Button>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}