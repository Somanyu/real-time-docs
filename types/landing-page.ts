export type NavItem = {
    label: string;
    href: string;
};

export type PricingPlan = {
    name: string
    description: string
    monthlyPrice: number
    yearlyPrice: number
    features: string[]
    cta: string
    highlighted?: boolean
}