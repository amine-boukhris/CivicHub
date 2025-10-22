"use client";
import AppLogo from "@/components/app-logo";
import CommunityCard from "@/components/community-card";
import LandingPageMenu from "@/components/landing-page-menu";
import { Community } from "@/types";
import Link from "next/link";

const mockCommunities: Community[] = [
  {
    id: "1",
    name: "Besançon City",
    description:
      "Report and track infrastructure issues across the entire Besançon metropolitan area",
    slug: "besancon-city",
    center_lat: 47.2382,
    center_lng: 6.0241,
    address: "Besançon, Bourgogne-Franche-Comté, France",
    category: "city",
    member_count: 1247,
    report_count: 342,
    is_verified: true,
    distance_km: 0.5,
  },
  {
    id: "2",
    name: "Campus Universitaire",
    description: "University campus community for students and faculty to report campus issues",
    slug: "campus-universitaire",
    center_lat: 47.2485,
    center_lng: 6.035,
    address: "Campus de la Bouloie, Besançon",
    category: "campus",
    member_count: 892,
    report_count: 156,
    is_verified: true,
    distance_km: 2.3,
  },
  {
    id: "3",
    name: "Quartier Battant",
    description:
      "Historic neighborhood community focused on preserving local heritage and infrastructure",
    slug: "quartier-battant",
    center_lat: 47.2395,
    center_lng: 6.028,
    address: "Quartier Battant, Besançon",
    category: "neighborhood",
    member_count: 534,
    report_count: 89,
    is_verified: true,
    distance_km: 1.1,
  },
  {
    id: "4",
    name: "Centre-Ville",
    description: "Downtown community for residents and businesses in the city center",
    slug: "centre-ville",
    center_lat: 47.2378,
    center_lng: 6.0245,
    address: "Centre-Ville, Besançon",
    category: "district",
    member_count: 2103,
    report_count: 478,
    is_verified: true,
    distance_km: 0.8,
  },
  {
    id: "5",
    name: "Planoise",
    description: "Large residential district community working together for better infrastructure",
    slug: "planoise",
    center_lat: 47.252,
    center_lng: 6.009,
    address: "Planoise, Besançon",
    category: "neighborhood",
    member_count: 1876,
    report_count: 291,
    is_verified: false,
    distance_km: 3.2,
  },
  {
    id: "6",
    name: "Doubs Region",
    description: "Regional community covering multiple cities and towns in the Doubs department",
    slug: "doubs-region",
    center_lat: 47.25,
    center_lng: 6.03,
    address: "Doubs, Bourgogne-Franche-Comté",
    category: "region",
    member_count: 4521,
    report_count: 1243,
    is_verified: true,
    distance_km: 5.0,
  },
];

export default function LandingPage() {
  return (
    <div className="relative px-6 lg:px-8 xl:px-16 py-32 lg:py-10 xl:pt-40 min-h-screen bg-cream-lighter w-full ">
      {/* Navigation */}
      <LandingPageMenu />
      {/* End Navigation */}

      {/* Hero section */}
      <div className="container max-w-[1200px] mx-auto">
        {/* heading area */}
        <div className="space-y-4">
          <p className="px-3 py-1 bg-cream-light text-center w-fit mx-auto rounded-full text-xs tracking-tight font-manrope leading-5 font-bold">
            Civic Hub
          </p>
          <h1 className="font-manrope text-6xl font-semibold text-center leading-[1.1]">
            Find your community <br /> make it a{" "}
            <span className="font-source-serif italic">better</span> place
          </h1>
        </div>
        {/* search area */}
        <div className="mt-8 mx-auto w-full">
          <form className="flex flex-col md:flex-row gap-3 lg:gap-4 font-manrope max-w-[400px] mx-auto w-full">
            <input
              className="bg-white placeholder:text-black/50 px-4 py-3 rounded-[12px] text-sm font-medium tracking-tight flex-1"
              placeholder="Search Community"
            />
            <button className="px-4 py-3 lg:px-6 bg-black hover:bg-bluish-pink text-white hover:text-black transition-colors rounded-[12px] text-sm font-manrope font-semibold tracking-tight">
              Search
            </button>
          </form>
          <p className="text-center text-black/50 text-xs lg:text-sm font-manrope font-medium tracking-tight mt-3 lg:mt-4">
            Or{" "}
            <Link href={"/communities/new-community"} className="text-blue-600/70 underline">
              create
            </Link>{" "}
            it if you didn't find it
          </p>
        </div>
      </div>
      {/* End Hero section */}

      {/* Nearby communities section */}
      <div className="container max-w-[1200px] mx-auto mt-20">
        <div className="space-y-4">
          <p className="px-3 py-1 bg-cream-light text-center w-fit mx-auto rounded-full text-xs tracking-tight font-manrope leading-5 font-bold">
            Nearby Communities
          </p>
          <h2 className="font-manrope text-3xl lg:text-4xl font-semibold text-center leading-[1.1]">
            Discover & Join nearby Communities
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 mt-6">
          {mockCommunities.map((community) => (
            <CommunityCard key={community.id} community={community} isJoined={false} />
          ))}
        </div>
      </div>
      {/* End Nearby communities section */}

      {/* Newsletter section */}
      <div className="container max-w-[1200px] mx-auto mt-10 bg-white/50 flex flex-col items-center justify-center py-12 px-6 lg:px-12 gap-8 rounded-[8px]">
        <div className="space-y-4">
          <p className="px-3 py-1 bg-cream-light text-center w-fit mx-auto rounded-full text-xs tracking-tight font-manrope leading-5 font-bold">
            Our mission is to
          </p>
          <h1 className="font-manrope text-3xl lg:text-4xl font-semibold text-center leading-[1.1]">
            Help make <span className="font-source-serif italic">Civic</span> responsibility <br />{" "}
            Engaging and rewarding
          </h1>
        </div>
        <div className="mt-8 mx-auto w-full">
          <p className="text-center text-black/50 mb-3 text-sm font-manrope font-medium">
            Receive weekly tips on improving your community
          </p>
          <form className="flex flex-col md:flex-row gap-3 lg:gap-4 font-manrope max-w-[400px] mx-auto w-full">
            <input
              className="bg-cream-light placeholder:text-black/50 px-4 py-3 rounded-[12px] text-sm font-medium tracking-tight flex-1"
              placeholder="Your email"
            />
            <button className="px-4 py-3 bg-black hover:bg-bluish-pink text-white hover:text-black transition-colors rounded-[12px] text-sm font-manrope font-semibold tracking-tight">
              Subscribe
            </button>
          </form>
          <p className="text-center text-black/50 text-xs lg:text-sm font-manrope font-medium tracking-tight mt-3 lg:mt-4">
            No span, unsubscribe at any time
          </p>
        </div>
      </div>
      {/* End Newsletter section */}

      {/* Footer */}
      <footer className="container max-w-[1200px] mx-auto mt-10">
        <div className="text-center mb-8 flex flex-col items-center gap-3">
          <AppLogo />
          <p className="text-black max-w-md">
            Empowering communities to report, track, and resolve local issues together.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-6 mb-8 text-sm">
          <a href="#home" className="text-gray-600 hover:text-gray-900 transition-colors">
            Home
          </a>
          <a href="#about" className="text-gray-600 hover:text-gray-900 transition-colors">
            About
          </a>
          <a href="#communities" className="text-gray-600 hover:text-gray-900 transition-colors">
            Communities
          </a>
          <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">
            Features
          </a>
          <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">
            Pricing
          </a>
          <a href="#contact" className="text-gray-600 hover:text-gray-900 transition-colors">
            Contact
          </a>
        </div>
      </footer>
      {/* End Footer */}
    </div>
  );
}
