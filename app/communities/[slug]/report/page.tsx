"use client";

import type React from "react";

import { useState, useEffect, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    MapPin,
    Upload,
    Loader2,
    ArrowLeft,
    CheckCircle,
    Share2,
} from "lucide-react";
import { motion } from "motion/react";
import LandingPageMenu from "@/components/landing-page-menu";
import { Community } from "@/app/communities/[slug]/page";
import { shareLink } from "@/lib/utils";

export default function CommunityReportPage({
    params,
}: {
    params: { slug: string };
}) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isGettingLocation, setIsGettingLocation] = useState(false);
    const [isLoadingCommunity, setIsLoadingCommunity] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [community, setCommunity] = useState<Community | null>(null);
    const [isMember, setIsMember] = useState<boolean | null>(null);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        category: "",
        latitude: "",
        longitude: "",
        address: "",
    });

    // Fetch community data
    useEffect(() => {
        const fetchCommunity = async () => {
            try {
                const response = await fetch(`/api/communities/${params.slug}`);
                if (!response.ok) {
                    console.error("Community not found");
                    setError("Community not found");
                    return;
                }
                const data = await response.json();
                setCommunity(data.community);
                setIsMember(data.isMember);
            } catch (error) {
                setError("Failed to load community");
                console.error("Error fetching community:", error);
            } finally {
                setIsLoadingCommunity(false);
            }
        };

        fetchCommunity();
    }, [params.slug]);

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const getLocation = () => {
        setIsGettingLocation(true);
        setError(null);

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
                    latitude: lat.toString(),
                    longitude: lng.toString(),
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
                setError(
                    "Unable to retrieve your location. Please enter manually."
                );
                setIsGettingLocation(false);
            }
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            // Validate required fields
            if (
                !formData.title ||
                !formData.description ||
                !formData.category ||
                !formData.latitude ||
                !formData.longitude
            ) {
                console.error("Please fill in all required fields");
                setError("Please fill in all required fields");
                return;
            }

            let imageUrl = null;

            // Upload image if provided
            if (imageFile) {
                const uploadFormData = new FormData();
                uploadFormData.append("file", imageFile);

                const uploadResponse = await fetch("/api/upload", {
                    method: "POST",
                    body: uploadFormData,
                });

                if (!uploadResponse.ok) {
                    throw new Error("Failed to upload image");
                }

                const uploadData = await uploadResponse.json();
                imageUrl = uploadData.url;
            }

            // Submit report
            const { slug } = params;
            const response = await fetch(`/api/communities/${slug}/reports`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...formData,
                    imageUrl,
                }),
            });

            if (!response.ok) {
                console.error("Failed to submit report");
                setError("Failed to submit report");
                return;
            }

            // Redirect to community page
            router.push(`/communities/${params.slug}?success=true`);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoadingCommunity) {
        return (
            <div className="min-h-screen bg-cream-lighter flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-black/50" />
                    <p className="text-black/50 font-manrope font-medium">
                        Loading community...
                    </p>
                </div>
            </div>
        );
    }

    if (!community) {
        return (
            <div className="min-h-screen bg-cream-lighter flex items-center justify-center">
                <div className="text-center">
                    <p className="text-black/50 font-manrope font-medium mb-4">
                        Community not found
                    </p>
                    <Link href="/communities">
                        <Button className="bg-black hover:bg-bluish-pink text-white hover:text-black transition-colors">
                            Back to Communities
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-cream-lighter">
            {/* Banner */}
            <div className="relative h-[240px] lg:h-[300px] bg-cream-light">
                {community?.banner_url ? (
                    <img
                        src={community.banner_url}
                        alt={community.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="absolute inset-0 bg-cream-light" />
                )}

                {/* Verified Badge */}
                {community?.is_verified && (
                    <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1.5">
                        <CheckCircle className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-manrope font-semibold tracking-tight text-black">
                            Verified
                        </span>
                    </div>
                )}
                <div className="absolute -bottom-12 left-52 z-50 w-24 h-24 lg:w-32 lg:h-32 bg-white rounded-[20px] border-4 border-white overflow-hidden">
                    {community?.icon_url ? (
                        <img
                            src={community.icon_url}
                            alt={community.name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-5xl">
                            t
                        </div>
                    )}
                </div>
            </div>

            <LandingPageMenu />

            {/* Form */}
            <div className="container max-w-2xl mx-auto px-4 py-12">
                {/* Heading */}
                <div className="space-y-4 mb-8">
                    <p className="px-3 py-1 bg-cream-light text-center w-fit mx-auto rounded-full text-xs tracking-tight font-manrope leading-5 font-bold">
                        Report an Issue
                    </p>
                    <h1 className="font-manrope text-3xl font-semibold text-center leading-[1.1]">
                        Report an issue in{" "}
                        <span className="font-source-serif italic">
                            {community?.slug}
                        </span>
                    </h1>
                    <p className="text-black/50 text-sm font-manrope font-medium tracking-tight text-center">
                        Help improve your community by reporting local
                        infrastructure issues
                    </p>
                </div>

                <div className="bg-white rounded-[20px] p-6 lg:p-8">
                    <form
                        onSubmit={handleSubmit}
                        className="space-y-6 font-manrope"
                    >
                        {/* Title */}
                        <div>
                            <label className="block text-sm tracking-tight text-black mb-2">
                                Issue Title{" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="title"
                                placeholder="e.g., Large pothole on Main Street"
                                value={formData.title}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        title: e.target.value,
                                    })
                                }
                                className="bg-white  border  placeholder:text-black/50 px-4 py-3 rounded-[12px] text-sm font-medium tracking-tight w-full"
                                required
                            />
                        </div>

                        {/* Category */}
                        <div>
                            <label className="block text-sm tracking-tight text-black mb-2">
                                Category <span className="text-red-500">*</span>
                            </label>
                            <Select
                                value={formData.category}
                                onValueChange={(value) =>
                                    setFormData({
                                        ...formData,
                                        category: value,
                                    })
                                }
                                required
                            >
                                <SelectTrigger className="bg-white rounded-[12px] text-sm font-medium tracking-tight">
                                    <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="road">
                                        Road
                                    </SelectItem>
                                    <SelectItem value="lighting">
                                        Lighting
                                    </SelectItem>
                                    <SelectItem value="trash">Trash</SelectItem>
                                    <SelectItem value="vandalism">
                                        Vandalism
                                    </SelectItem>
                                    <SelectItem value="water">Water</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm tracking-tight text-black mb-2">
                                Description{" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                id="description"
                                placeholder="Provide details about the issue..."
                                value={formData.description}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        description: e.target.value,
                                    })
                                }
                                rows={4}
                                className="w-full bg-white border placeholder:text-black/50 px-4 py-3 rounded-[12px] text-sm font-medium tracking-tight"
                                required
                            />
                        </div>

                        {/* Location */}
                        <div>
                            <label className="block text-sm tracking-tight text-black mb-2">
                                Location <span className="text-red-500">*</span>
                            </label>
                            <button
                                type="button"
                                onClick={getLocation}
                                disabled={isGettingLocation}
                                className="w-full px-4 py-3 bg-black hover:bg-bluish-pink text-white hover:text-black transition-colors rounded-[12px] text-sm font-manrope font-semibold tracking-tight flex items-center justify-center"
                            >
                                {isGettingLocation ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Getting Location...
                                    </>
                                ) : (
                                    <>
                                        <MapPin className="w-4 h-4 mr-2" />
                                        Use My Current Location
                                    </>
                                )}
                            </button>

                            {formData.latitude && formData.longitude && (
                                <div className="text-sm text-black/50 mt-2 font-manrope font-medium">
                                    <p>
                                        Coordinates:{" "}
                                        {Number.parseFloat(
                                            formData.latitude
                                        ).toFixed(6)}
                                        ,{" "}
                                        {Number.parseFloat(
                                            formData.longitude
                                        ).toFixed(6)}
                                    </p>
                                    {formData.address && (
                                        <p className="mt-1">
                                            Address: {formData.address}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Manual Location Entry */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm tracking-tight text-black mb-2">
                                    Latitude
                                </label>
                                <input
                                    id="latitude"
                                    type="number"
                                    step="any"
                                    placeholder="e.g., 40.7128"
                                    value={formData.latitude}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            latitude: e.target.value,
                                        })
                                    }
                                    className="bg-white border placeholder:text-black/50 px-4 py-3 rounded-[12px] text-sm font-medium tracking-tight w-full"
                                />
                            </div>
                            <div>
                                <label className="block text-sm tracking-tight text-black mb-2">
                                    Longitude
                                </label>
                                <input
                                    id="longitude"
                                    type="number"
                                    step="any"
                                    placeholder="e.g., -74.0060"
                                    value={formData.longitude}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            longitude: e.target.value,
                                        })
                                    }
                                    className="bg-white border placeholder:text-black/50 px-4 py-3 rounded-[12px] text-sm font-medium tracking-tight w-full"
                                />
                            </div>
                        </div>

                        {/* Image Upload */}
                        <div>
                            <label className="block text-sm tracking-tight text-black mb-2">
                                Photo (Optional)
                            </label>
                            <div className="flex items-center gap-4">
                                <input
                                    id="image"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="flex-1 bg-white border placeholder:text-black/50 px-4 py-3 rounded-[12px] text-sm font-medium tracking-tight"
                                />
                                <Upload className="w-5 h-5 text-black/50" />
                            </div>
                            {imagePreview && (
                                <div className="mt-4">
                                    <img
                                        src={imagePreview || "/placeholder.svg"}
                                        alt="Preview"
                                        className="w-full h-48 object-cover rounded-[12px]"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-[12px]">
                                <p className="text-sm text-red-600 font-manrope font-medium">
                                    {error}
                                </p>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full px-6 py-3 bg-black hover:bg-bluish-pink text-white hover:text-black transition-colors rounded-[12px] text-sm font-manrope font-semibold tracking-tight flex items-center justify-center disabled:bg-black/50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Submitting Report...
                                </>
                            ) : (
                                "Submit Report"
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
