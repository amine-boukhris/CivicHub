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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapPin, Upload, Loader2, ArrowLeft } from "lucide-react";
import { motion } from "motion/react";

export default function ReportPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    latitude: "",
    longitude: "",
    address: "",
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        setError("Unable to retrieve your location. Please enter manually.");
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
        throw new Error("Please fill in all required fields");
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
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          image_url: imageUrl,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit report");
      }

      // Redirect to map view
      // Show something to congrat the user after redirecting
      router.push("/map?success=true");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative z-10">
      <div className="absolute inset-0 -z-10 h-full w-full bg-transparent [background:radial-gradient(200%_200%_at_50%_10%,#fff0_40%,#2563eb_100%)]"></div>

      <div className="absolute -z-20 inset-0 h-full w-full bg-white bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]"></div>
      {/* Header */}
      <header className="border-b border-border bg-white">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400 }}
              className="rounded flex items-center justify-center"
            >
              <MapPin className="size-6 text-[#2E5BFF]" />
            </motion.div>
            <h1 className="text-xl font-semibold text-foreground">CivicHub</h1>
          </Link>
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </header>

      {/* Form */}
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <Card className="shadow-none border border-neutral-300">
          <CardHeader>
            <CardTitle className="text-2xl">Report an Issue</CardTitle>
            <CardDescription>
              Help improve your community by reporting local infrastructure issues
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Issue Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Large pothole on Main Street"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pothole">Pothole</SelectItem>
                    <SelectItem value="streetlight">Broken Streetlight</SelectItem>
                    <SelectItem value="trash">Trash/Litter</SelectItem>
                    <SelectItem value="graffiti">Graffiti</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Provide details about the issue..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  required
                />
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label>Location *</Label>
                <Button
                  type="button"
                  variant="outline"
                  onClick={getLocation}
                  disabled={isGettingLocation}
                  className="w-full bg-transparent"
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
                </Button>

                {formData.latitude && formData.longitude && (
                  <div className="text-sm text-muted-foreground mt-2">
                    <p>
                      Coordinates: {Number.parseFloat(formData.latitude).toFixed(6)},{" "}
                      {Number.parseFloat(formData.longitude).toFixed(6)}
                    </p>
                    {formData.address && <p className="mt-1">Address: {formData.address}</p>}
                  </div>
                )}
              </div>

              {/* Manual Location Entry */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="latitude">Latitude</Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="any"
                    placeholder="e.g., 40.7128"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="longitude">Longitude</Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="any"
                    placeholder="e.g., -74.0060"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                  />
                </div>
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <Label htmlFor="image">Photo (Optional)</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="flex-1"
                  />
                  <Upload className="w-5 h-5 text-muted-foreground" />
                </div>
                {imagePreview && (
                  <div className="mt-4">
                    <img
                      src={imagePreview || "/placeholder.svg"}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg border"
                    />
                  </div>
                )}
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#2E5BFF] hover:bg-[#1E3A8A]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting Report...
                  </>
                ) : (
                  "Submit Report"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
