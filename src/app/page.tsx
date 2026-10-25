import { Hero } from "@/components/home/hero";
import { FeaturedStays } from "@/components/home/featured-stays";
import { PopularAreas } from "@/components/home/popular-areas";
import { HowItWorks } from "@/components/home/how-it-works";
import { WhyOffk } from "@/components/home/why-offk";
import { PricingCalendarDemo } from "@/components/home/pricing-calendar-demo";
import { LandlordCta } from "@/components/home/landlord-cta";

export default function Home() {
  return (
    <>
      <Hero />
      <FeaturedStays />
      <PopularAreas />
      <HowItWorks />
      <WhyOffk />
      <PricingCalendarDemo />
      <LandlordCta />
    </>
  );
}
