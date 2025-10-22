"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  MapPin,
  ArrowLeft,
  Loader2Icon,
  MapPinIcon,
  UploadIcon,
  XIcon,
  AlertCircleIcon,
  CheckIcon,
} from "lucide-react";
import { motion } from "motion/react";

type CommunityCategory = "city" | "neighborhood" | "district" | "campus" | "region";

interface CommunityInsert {
  name: string;
  address?: string;
  description: string;
  centerLat: string;
  centerLng: string;
  category: CommunityCategory;
  radiusKm: number;
  slug: string;
}

export default function CreateCommunityPage() {
  const router = useRouter();
  // const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CommunityInsert>({
    name: "",
    address: "",
    description: "",
    centerLat: "",
    centerLng: "",
    category: "city" as CommunityCategory,
    radiusKm: 5,
    slug: "",
  });

  // Icon and banner files and previews
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);

  const categories = [
    { value: "city", label: "City", emoji: "🏙️" },
    { value: "neighborhood", label: "Neighborhood", emoji: "🏘️" },
    { value: "district", label: "District", emoji: "🏛️" },
    { value: "campus", label: "Campus", emoji: "🎓" },
    { value: "region", label: "Region", emoji: "🗺️" },
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === "icon") {
          setIconFile(file);
          setIconPreview(reader.result as string);
        } else {
          setBannerFile(file);
          setBannerPreview(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (type: string) => {
    if (type === "icon") {
      setIconPreview(null);
    } else {
      setBannerPreview(null);
    }
  };

  const getLocation = async () => {
    setIsGettingLocation(true);
    setError("");

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setIsGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        setFormData((prev) => ({
          ...prev,
          centerLat: lat.toString(),
          centerLng: lng.toString(),
        }));

        // Try to get address from coordinates using reverse geocoding
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
          );
          const data = await response.json();
          if (data.display_name) {
            setFormData((prev) => ({
              ...prev,
              address: data.display_name,
            }));
          }
        } catch (err) {
          console.error("Error getting address:", err);
        }

        setIsGettingLocation(false);
      },
      (error) => {
        setError("Unable to retrieve your location. Please enter manually.");
        setIsGettingLocation(false);
      }
    );
  };

  const validate = (): boolean => {
    if (!formData.name.trim()) {
      setError("Community name is required");
      return false;
    }

    if (!formData.description.trim()) {
      setError("Description is required");
      return false;
    }

    if (!formData.centerLat || !formData.centerLng) {
      setError("Location coordinates are required");
      return false;
    }

    // TODO: Check if slug is unique

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (!validate()) {
      setIsSubmitting(false);
      return;
    }

    try {
      // upload icon and banner if they exist
      let iconUrl = null;
      let bannerUrl = null;
      if (iconFile) {
        const uploadFormData = new FormData();
        uploadFormData.append("file", iconFile);

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: uploadFormData,
        });

        if (!uploadResponse.ok) {
          throw new Error("Failed to upload Community Icon");
        }

        const uploadData = await uploadResponse.json();
        iconUrl = uploadData.url;
      }
      if (bannerFile) {
        const uploadFormData = new FormData();
        uploadFormData.append("file", bannerFile);

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: uploadFormData,
        });

        if (!uploadResponse.ok) {
          throw new Error("Failed to upload Community Banner");
        }

        const uploadData = await uploadResponse.json();
        bannerUrl = uploadData.url;
      }

      const response = await fetch("/api/communities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          center_lat: parseFloat(formData.centerLat),
          center_lng: parseFloat(formData.centerLng),
          address: formData.address,
          radius_km: formData.radiusKm,
          category: formData.category,
          slug: formData.slug,
          iconUrl: iconUrl,
          bannerUrl: bannerUrl,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create community");
      }

      const community = await response.json();
      console.log(community);
      setTimeout(() => {
        router.push(`/communities/${community.slug}`);
      }, 2000);
    } catch (error) {
      console.error("Error creating community:", error);
      setError("Failed to create community");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative px-6 lg:px-8 xl:px-16 py-32 lg:py-10 xl:pt-40 min-h-screen bg-cream-lighter w-full ">
      <div className="container max-w-[1200px] mx-auto">
        {/* heading area */}
        <div className="space-y-4">
          <p className="px-3 py-1 bg-cream-light text-center w-fit mx-auto rounded-full text-xs tracking-tight font-manrope leading-5 font-bold">
            Civic Hub
          </p>
          <h1 className="font-manrope text-3xl font-semibold text-center leading-[1.1]">
            Create a new <span className="font-source-serif italic">community</span>
          </h1>
          <p className="text-black/50 text-sm font-manrope font-semibold tracking-tight text-center">
            Start managing civic issues in your area
          </p>
        </div>
        {/* Form section */}
        <div className="mt-8 mx-auto w-full">
          <form
            className="flex flex-col gap-6 font-manrope max-w-[800px] mx-auto w-full"
            onSubmit={handleSubmit}
          >
            {/* Banner and Icon Section */}
            <div className="bg-cream-light rounded-[20px] p-6 lg:p-8">
              <h2 className="text-xl font-manrope font-semibold text-black mb-6">
                Community Visuals
              </h2>

              {/* Banner Upload */}
              <div className="mb-6">
                <label className="block text-sm font-semibold tracking-tight text-black mb-3">
                  Banner Image
                </label>
                {bannerPreview ? (
                  <div className="relative bg-cream-lighter rounded-[12px] h-48 flex items-center justify-center overflow-hidden">
                    <img
                      src={bannerPreview}
                      alt="Banner preview"
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage("banner")}
                      className="absolute top-3 right-3 p-1.5 bg-black/80 text-white rounded-full hover:bg-black transition-colors"
                    >
                      <XIcon className="size-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center bg-cream-lighter rounded-[12px] p-8 h-48 cursor-pointer hover:bg-black/5 transition-colors border-2 border-dashed border-black/10">
                    <UploadIcon className="size-8 text-black/30 mb-3" />
                    <span className="text-sm text-black/50 font-medium text-center">
                      Upload banner image (recommended: 1200x300px)
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, "banner")}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Icon Upload - positioned to overlay banner */}
              <div className="relative -mt-16 ml-6">
                <div className="w-24 h-24 bg-white rounded-[20px] border-2 border-white shadow-lg">
                  {iconPreview ? (
                    <div className="relative w-full h-full rounded-[16px]">
                      <img
                        src={iconPreview}
                        alt="Icon preview"
                        className="w-full h-full object-cover rounded-[20px]"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage("icon")}
                        className="absolute -top-1 -right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      >
                        <XIcon className="size-3" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-full rounded-[16px] cursor-pointer hover:bg-black/5 transition-colors border-2 border-dashed border-black/10">
                      <UploadIcon className="size-6 text-black/30 mb-1" />
                      <span className="text-xs text-black/50 font-medium text-center">Icon</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, "icon")}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>

            {/* Community Details */}
            <div className="bg-cream-light rounded-[20px] p-6 lg:p-8">
              <h2 className="text-xl font-manrope font-semibold text-black mb-6">
                Community Details
              </h2>

              {/* Community Name Field */}
              <div className="mb-6">
                <label className="block text-sm tracking-tight text-black mb-2">
                  Community Name <span className="text-red-500">*</span>
                </label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      name: e.target.value,
                      slug: e.target.value
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, "-")
                        .replace(/(^-|-$)/g, ""),
                    }));
                  }}
                  className="bg-white placeholder:text-black/50 px-4 py-3 rounded-[12px] text-sm font-medium tracking-tight w-full"
                  placeholder="Enter community name"
                />
              </div>
              {/* Slug Field */}
              <div className="mb-6">
                <label className="block text-sm tracking-tight text-black/50 mb-2">
                  URL Slug <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-black/50">civichub.com/c/</span>
                  <input
                    name="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                    className="bg-white placeholder:text-black/50 px-4 py-3 rounded-[12px] text-sm font-medium tracking-tight w-full"
                    placeholder="Community Slug"
                  />
                </div>
                <p className="mt-1 text-xs text-black/50">Auto-generated from community name</p>
              </div>

              {/* Description */}
              <div className="mb-6">
                <label className="block text-sm font-semibold tracking-tight text-black mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Describe your community and what makes it special..."
                  rows={4}
                  className="w-full bg-white placeholder:text-black/50 px-4 py-3 rounded-[12px] text-sm font-medium tracking-tight"
                />
              </div>

              {/* Category */}
              <div className="mb-6">
                <label className="block text-sm font-semibold tracking-tight text-black mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  {categories.map((category) => (
                    <button
                      key={category.value}
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          category: category.value as CommunityCategory,
                        }))
                      }
                      className={`px-4 py-3 lg:px-6 rounded-[12px] text-sm font-semibold tracking-tight transition-all ${
                        formData.category === category.value
                          ? "bg-bluish-pink text-black"
                          : "bg-white text-black/70 hover:bg-black/5"
                      }`}
                    >
                      <div className="text-lg mb-1">{category.emoji}</div>
                      <div className="text-xs">{category.label}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Location Section */}
            <div className="bg-cream-light rounded-[20px] p-6 lg:p-8">
              <h2 className="text-xl font-manrope font-semibold text-black mb-6">
                Location & Coverage
              </h2>
              {/* Location */}
              <div className="space-y-4 mb-6">
                <label className="block text-sm font-semibold tracking-tight text-black mb-2">
                  Location <span className="text-red-500">*</span>
                </label>
                <button
                  className="px-4 py-3 lg:px-6 bg-black hover:bg-bluish-pink text-white hover:text-black transition-colors rounded-[12px] text-sm font-manrope font-semibold tracking-tight flex items-center"
                  type="button"
                  onClick={getLocation}
                  disabled={isGettingLocation}
                >
                  {isGettingLocation ? (
                    <>
                      <Loader2Icon className="size-4 mr-2 animate-spin" />
                      Getting Location...
                    </>
                  ) : (
                    <>
                      <MapPinIcon className="size-4 mr-2" />
                      Use My Current Location
                    </>
                  )}
                </button>

                {formData.centerLat && formData.centerLng && (
                  <div className="text-sm text-muted-foreground mt-2">
                    <p>
                      Center Coordinates: {Number.parseFloat(formData.centerLat).toFixed(6)},{" "}
                      {Number.parseFloat(formData.centerLng).toFixed(6)}
                    </p>
                    {formData.address && <p className="mt-1">Address: {formData.address}</p>}
                  </div>
                )}
              </div>

              {/* Manual Location Entry */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold tracking-tight text-black mb-2">
                    Latitude
                  </label>
                  <input
                    id="latitude"
                    type="number"
                    step="any"
                    placeholder="e.g., 40.7128"
                    value={formData.centerLat}
                    onChange={(e) => setFormData({ ...formData, centerLat: e.target.value })}
                    className="bg-white placeholder:text-black/50 px-4 py-3 rounded-[12px] text-sm font-medium tracking-tight w-full"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold tracking-tight text-black mb-2">
                    Longitude
                  </label>
                  <input
                    id="longitude"
                    type="number"
                    step="any"
                    placeholder="e.g., -74.0060"
                    value={formData.centerLng}
                    onChange={(e) => setFormData({ ...formData, centerLng: e.target.value })}
                    className="bg-white placeholder:text-black/50 px-4 py-3 rounded-[12px] text-sm font-medium tracking-tight w-full"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold tracking-tight text-black mb-2">
                    Manual Address Entry
                  </label>
                  <input
                    name="address"
                    value={formData.address || ""}
                    onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                    className="bg-white placeholder:text-black/50 px-4 py-3 rounded-[12px] text-sm font-medium tracking-tight w-full"
                    placeholder="Community Address"
                  />
                </div>
              </div>

              {/* Area Radius */}
              <div>
                <label className="block text-sm font-semibold tracking-tight text-black mb-2">
                  Area Radius (km) <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    name="radiusKm"
                    value={formData.radiusKm}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, radiusKm: Number(e.target.value) }))
                    }
                    min="1"
                    max="100"
                    className="flex-1"
                  />
                  <span className="px-3 py-2 bg-cream-lighter rounded-[8px] text-sm font-semibold tracking-tight min-w-[60px] text-center">
                    {formData.radiusKm} km
                  </span>
                </div>
                <p className="mt-1 text-xs text-black/50">
                  How far from the center should reports be allowed?
                </p>
              </div>
            </div>
            {/* Info Box */}
            <div className="bg-white/50 border border-blue-200/50 rounded-[12px] p-4 flex gap-3">
              <AlertCircleIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-manrope font-semibold tracking-tight text-black mb-1">
                  You'll be the admin
                </h4>
                <p className="text-xs text-black/70 font-manrope font-medium leading-relaxed">
                  As the creator, you'll have full control over this community. You can invite
                  moderators, manage members, and update settings anytime.
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-[12px] text-sm font-semibold tracking-tight transition-all bg-black hover:bg-bluish-pink text-white hover:text-black"
            >
              {isSubmitting ? "Creating Community" : "Create Community"}
            </button>
          </form>
        </div>
        {/* End Form section */}
      </div>
    </div>
  );
}
