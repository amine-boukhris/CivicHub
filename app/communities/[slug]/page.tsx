"use client";

import { Users, AlertCircle, CheckCircle, Plus, TrendingUp, Share2, Settings } from "lucide-react";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Filter, X, List } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AnimatePresence, motion } from "motion/react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import Image from "next/image";
import { useRouter } from "next/navigation";
import LandingPageMenu from "@/components/landing-page-menu";
import { shareLink} from "@/lib/utils";

// Dynamically import the map component to avoid SSR issues
const MapView = dynamic(() => import("@/components/map-view"), { ssr: false });

export interface Report {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  lat: number;
  lng: number;
  address: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string;
  resolution_notes: string;
  upvote_count: number;
  view_count: number
}

export interface Community {
  id: string;
  name: string;
  description: string | null;
  slug: string;

  // Location
  center_lat: number;
  center_lng: number;
  location: string | unknown; // Supabase returns geography as `unknown` or `string`, can cast to { lat: number; lng: number }
  address: string | null;
  radius_km: number;

  // Metadata
  admin_id: string | null;
  icon_url: string | null;
  banner_url: string | null;
  category: "city" | "neighborhood" | "district" | "campus" | "region" | null;

  // Statistics
  member_count: number;
  report_count: number;

  // Status
  is_verified: boolean;
  is_active: boolean;

  // Timestamps
  created_at: string;
  updated_at: string;
}

export default function CommunityPage({ params }: { params: { slug: string } }) {
  const router = useRouter();

  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [view, setView] = useState<"map" | "feed">("feed");
  const [isMember, setIsMember] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  const [community, setCommunity] = useState<Community>();

  useEffect(() => {
    fetchCommunity();
  }, []);

  useEffect(() => {
    if (community) {
      fetchReports();
      const storedView = localStorage.getItem("view");
      if (storedView && (storedView == "map" || storedView == "feed")) {
        setView(storedView);
      }
    }
  }, [community]);

  useEffect(() => {
    filterReports();
  }, [reports, statusFilter, categoryFilter]);

  const fetchReports = async () => {
    try {
      const { slug } = params;
      const response = await fetch(`/api/communities/${slug}/reports`);
      const data = await response.json();
      setReports(data.reports);
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCommunity = async () => {
    setIsLoading(true);
    try {
      const { slug } = params;
      const response = await fetch(`/api/communities/${slug}`);
      const data: { community: Community; isMember: boolean; isAdmin: boolean } =
        await response.json();
      if (!data.community) {
        console.error("Community not found");
        return;
      }
      setCommunity(data.community);
      setIsMember(data.isMember);
      // setIsAdmin(data.isAdmin)
    } catch (error) {
      console.error("Error fetching community:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterReports = () => {
    let filtered = reports;

    if (statusFilter !== "all") {
      filtered = filtered.filter((report) => report.status === statusFilter);
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter((report) => report.category === categoryFilter);
    }

    setFilteredReports(filtered);
  };

  const handleJoin = async () => {
    try {
      setIsJoining(true);
      const res = await fetch(`/api/communities/${params.slug}/join`, { method: "POST" });
      if (!res.ok) {
        return;
      }
      const json = await res.json();
      if (json?.joined) {
        setIsMember(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsJoining(false);
    }
  };



  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-red-500";
      case "in-progress":
        return "bg-orange-500";
      case "resolved":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "Pending";
      case "in-progress":
        return "In Progress";
      case "resolved":
        return "Resolved";
      default:
        return status;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "pothole":
        return "Pothole";
      case "streetlight":
        return "Streetlight";
      case "trash":
        return "Trash";
      case "graffiti":
        return "Graffiti";
      case "other":
        return "Other";
      default:
        return category;
    }
  };

  if (!community) return null;

  return (
    <div className="relative min-h-screen bg-cream-lighter flex flex-col">
      {/* Banner */}
      <div className="relative h-[240px] lg:h-[300px] bg-cream-light overflow-hidden">
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

        {/* Share Button */}
        <button
          onClick={() => shareLink(window.location.href, community.name, community.description || "")}
          className="absolute top-6 right-6 p-2.5 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
        >
          <Share2 className="w-5 h-5 text-black" />
        </button>
      </div>

      <LandingPageMenu />

      {/* Main Content */}
      <div className="container max-w-[1200px] mx-auto px-4">
        {/* Community Header */}
        <div className="relative -mt-16 mb-8">
          <div className="bg-white rounded-[20px] p-6 lg:p-8">
            <div className="flex flex-col lg:flex-row lg:items-start gap-6">
              {/* Icon */}
              <div className="flex-shrink-0">
                <div className="w-24 h-24 lg:w-32 lg:h-32 bg-white rounded-[20px] border-4 border-white overflow-hidden">
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

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-end gap-3 mb-3">
                  <h1 className="text-3xl lg:text-4xl font-manrope font-bold tracking-tight text-black">
                    {community?.name}
                  </h1>
                  <p className="px-3 py-1 bg-cream-light text-center  rounded-full text-xs tracking-tight font-manrope leading-5 font-bold">
                    {community?.category}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-sm text-black/60 font-manrope font-medium mb-4">
                  <MapPin className="w-4 h-4" />
                  <span>{community.address}</span>
                </div>

                <p className="text-black/70 text-base font-manrope font-medium leading-relaxed mb-6">
                  {community.description}
                </p>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                  <div className="bg-cream-lighter rounded-[12px] p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="w-4 h-4 text-black/40" />
                      <span className="text-xs text-black/50 font-manrope font-semibold tracking-tight">
                        Members
                      </span>
                    </div>
                    <div className="text-2xl font-manrope font-bold text-black">
                      {community.member_count}
                    </div>
                  </div>

                  <div className="bg-cream-lighter rounded-[12px] p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertCircle className="w-4 h-4 text-black/40" />
                      <span className="text-xs text-black/50 font-manrope font-semibold tracking-tight">
                        Reports
                      </span>
                    </div>
                    <div className="text-2xl font-manrope font-bold text-black">
                      {community.report_count}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                  {!isMember ? (
                    <button
                      onClick={handleJoin}
                      disabled={isJoining}
                      className={`px-6 py-3 rounded-[12px] text-sm font-manrope font-semibold tracking-tight transition-all  ${
                        isJoining
                          ? "bg-black/50 text-white cursor-not-allowed"
                          : "bg-black hover:bg-bluish-pink text-white hover:text-black"
                      }`}
                    >
                      {isJoining ? "Joining..." : "Join Community"}
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => router.push(`/communities/${community?.slug}/report`)}
                        className="px-6 py-3 bg-black text-white rounded-[12px] text-sm font-manrope font-semibold tracking-tight hover:bg-black/90 transition-all flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Create Report
                      </button>
                      <button className="px-4 py-3 bg-cream-lighter text-black rounded-[12px] text-sm font-manrope font-semibold tracking-tight hover:bg-black/5 transition-all">
                        <Settings className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white relative z-30">
        <div className="container max-w-[1200px] mx-auto px-4 py-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filters:</span>
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="pothole">Pothole</SelectItem>
                <SelectItem value="streetlight">Streetlight</SelectItem>
                <SelectItem value="trash">Trash</SelectItem>
                <SelectItem value="graffiti">Graffiti</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>

            <div className="text-sm text-muted-foreground">
              Showing {filteredReports.length} of {reports.length} reports
            </div>

            <div className="ml-auto flex items-center gap-2">
              <span className="text-sm text-muted-foreground">View:</span>
              <div className="inline-flex rounded-md border p-1 bg-muted/40">
                <Button
                  variant={view === "map" ? "default" : "ghost"}
                  size="sm"
                  className="gap-1"
                  onClick={() => {
                    setView("map");
                    localStorage.setItem("view", "map");
                  }}
                >
                  <MapPin className="w-4 h-4" />
                  Map
                </Button>
                <Button
                  variant={view === "feed" ? "default" : "ghost"}
                  size="sm"
                  className="gap-1"
                  onClick={() => {
                    setView("feed");
                    localStorage.setItem("view", "feed");
                  }}
                >
                  <List className="w-4 h-4" />
                  Feed
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Map / Feed and Details */}
      {view === "map" ? (
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
          {/* Map */}
          <div className="flex-1 relative z-10">
            {isLoading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-secondary/30">
                <p className="text-muted-foreground">Loading map...</p>
              </div>
            ) : (
              <MapView reports={filteredReports} onMarkerClick={setSelectedReport} />
            )}
          </div>

          {/* Report Details Sidebar */}
          <AnimatePresence>
            {selectedReport && (
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className="lg:w-96 bg-white overflow-y-auto absolute z-50 right-0 top-0 bottom-0"
              >
                <div className="p-4">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold text-foreground">
                      {selectedReport.title}
                    </h3>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedReport(null)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  {selectedReport.image_url && (
                    <img
                      src={selectedReport.image_url || "/placeholder.svg"}
                      alt={selectedReport.title}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                  )}

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge className={`${getStatusColor(selectedReport.status)} text-white`}>
                        {getStatusLabel(selectedReport.status)}
                      </Badge>
                      <Badge variant="outline">{getCategoryLabel(selectedReport.category)}</Badge>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-foreground mb-1">Description</p>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {selectedReport.description}
                      </p>
                    </div>

                    {selectedReport.address && (
                      <div>
                        <p className="text-sm font-medium text-foreground mb-1">Location</p>
                        <p className="text-sm text-muted-foreground">{selectedReport.address}</p>
                      </div>
                    )}

                    <div>
                      <p className="text-sm font-medium text-foreground mb-1">Coordinates</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedReport.latitude.toFixed(6)}, {selectedReport.longitude.toFixed(6)}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-foreground mb-1">Reported</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(selectedReport.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto bg-cream-lighter">
          <div className="container max-w-[1200px] mx-auto px-4 py-6 grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {isLoading ? (
              <div className="col-span-full flex items-center justify-center py-16">
                <p className="text-muted-foreground">Loading feed...</p>
              </div>
            ) : filteredReports.length === 0 ? (
              <div className="col-span-full text-center text-muted-foreground py-16">
                No reports match the selected filters.
              </div>
            ) : (
              filteredReports.map((report) => (
                <Card key={report.id} className="overflow-hidden pt-0 bg-white rounded-[20px]">
                  {report.image_url && (
                    <Image
                      src={report.image_url || "/placeholder.svg"}
                      alt={report.title}
                      className="w-full h-64 object-cover"
                      width={400}
                      height={160}
                      unoptimized={!report.image_url}
                    />
                  )}
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{report.title}</CardTitle>
                    <CardDescription>
                      {new Date(report.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge className={`${getStatusColor(report.status)} text-white`}>
                        {getStatusLabel(report.status)}
                      </Badge>
                      <Badge variant="outline">{getCategoryLabel(report.category)}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {report.description}
                    </p>
                  </CardContent>
                  <CardFooter className="justify-between">
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span>
                        {report.latitude.toFixed(4)}, {report.longitude.toFixed(4)}
                      </span>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => setView("map")}>
                      View on Map
                    </Button>
                  </CardFooter>
                </Card>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
