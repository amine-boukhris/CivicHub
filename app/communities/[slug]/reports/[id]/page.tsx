"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  ArrowLeft, 
  Calendar, 
  User, 
  Eye, 
  ThumbsUp, 
  Share2, 
  Edit, 
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle,
  Clock,
  X
} from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";

interface Report {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  priority: string;
  lat: number;
  lng: number;
  address: string | null;
  image_url: string | null;
  upvote_count: number;
  view_count: number;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  resolution_notes: string | null;
  user_id: string;
}

interface Community {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  address: string;
}

export default function ReportDetailPage({ 
  params 
}: { 
  params: { slug: string; id: string } 
}) {
  const router = useRouter();
  const [report, setReport] = useState<Report | null>(null);
  const [community, setCommunity] = useState<Community | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpvoting, setIsUpvoting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch report and community data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch report
        const reportResponse = await fetch(`/api/communities/${params.slug}/reports/${params.id}`);
        if (!reportResponse.ok) {
          throw new Error("Report not found");
        }
        const reportData = await reportResponse.json();
        setReport(reportData.report);

        // Fetch community
        const communityResponse = await fetch(`/api/communities/${params.slug}`);
        if (!communityResponse.ok) {
          throw new Error("Community not found");
        }
        const communityData = await communityResponse.json();
        setCommunity(communityData.community);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load report");
        console.error("Error fetching data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [params.slug, params.id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-red-500";
      case "acknowledged":
        return "bg-orange-500";
      case "in_progress":
        return "bg-blue-500";
      case "resolved":
        return "bg-green-500";
      case "closed":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "Pending";
      case "acknowledged":
        return "Acknowledged";
      case "in_progress":
        return "In Progress";
      case "resolved":
        return "Resolved";
      case "closed":
        return "Closed";
      default:
        return status;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "road":
        return "Road Issue";
      case "lighting":
        return "Lighting";
      case "trash":
        return "Trash/Litter";
      case "vandalism":
        return "Vandalism";
      case "water":
        return "Water Issue";
      case "other":
        return "Other";
      default:
        return category;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      case "normal":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "urgent":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const handleUpvote = async () => {
    if (!report) return;
    
    setIsUpvoting(true);
    try {
      // TODO: Implement upvote API call
      // For now, just simulate the action
      await new Promise(resolve => setTimeout(resolve, 500));
      setReport(prev => prev ? { ...prev, upvote_count: prev.upvote_count + 1 } : null);
    } catch (err) {
      console.error("Error upvoting:", err);
    } finally {
      setIsUpvoting(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: report?.title,
          text: report?.description,
          url: window.location.href,
        });
      } catch (err) {
        console.log("Share cancelled");
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  const handleDelete = async () => {
    if (!report) return;
    
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/communities/${params.slug}/reports/${params.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete report");
      }

      // Redirect to community page
      router.push(`/communities/${params.slug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete report");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream-lighter flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-black/50" />
          <p className="text-black/50 font-manrope font-medium">Loading report...</p>
        </div>
      </div>
    );
  }

  if (error || !report || !community) {
    return (
      <div className="min-h-screen bg-cream-lighter flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <p className="text-black/50 font-manrope font-medium mb-4">
            {error || "Report not found"}
          </p>
          <Link href={`/communities/${params.slug}`}>
            <Button className="bg-black hover:bg-bluish-pink text-white hover:text-black transition-colors">
              Back to Community
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-lighter">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container max-w-[1200px] mx-auto px-4 py-4 flex items-center justify-between">
          <Link href={`/communities/${params.slug}`} className="flex items-center gap-2">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400 }}
              className="rounded flex items-center justify-center"
            >
              <MapPin className="size-6 text-[#2E5BFF]" />
            </motion.div>
            <div>
              <h1 className="text-xl font-semibold text-black font-manrope">{community.name}</h1>
              <p className="text-sm text-black/50 font-manrope">Community Report</p>
            </div>
          </Link>
          <Link href={`/communities/${params.slug}`}>
            <Button variant="ghost" size="sm" className="text-black hover:bg-black/5">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Community
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="container max-w-[1200px] mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Report Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Report Header */}
            <div className="bg-white rounded-[20px] p-6 lg:p-8">
              <div className="flex flex-wrap items-start gap-3 mb-4">
                <Badge className={`${getStatusColor(report.status)} text-white`}>
                  {getStatusLabel(report.status)}
                </Badge>
                <Badge variant="outline">{getCategoryLabel(report.category)}</Badge>
                <Badge className={getPriorityColor(report.priority)}>
                  {report.priority.charAt(0).toUpperCase() + report.priority.slice(1)} Priority
                </Badge>
              </div>

              <h1 className="text-3xl lg:text-4xl font-manrope font-bold tracking-tight text-black mb-4">
                {report.title}
              </h1>

              <div className="flex items-center gap-4 text-sm text-black/60 font-manrope font-medium mb-6">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {new Date(report.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  <span>Reported by user</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  <span>{report.view_count} views</span>
                </div>
              </div>

              <p className="text-black/70 text-base font-manrope font-medium leading-relaxed">
                {report.description}
              </p>
            </div>

            {/* Report Image */}
            {report.image_url && (
              <div className="bg-white rounded-[20px] p-6 lg:p-8">
                <h2 className="text-xl font-manrope font-semibold text-black mb-4">Photo</h2>
                <div className="relative">
                  <Image
                    src={report.image_url}
                    alt={report.title}
                    width={800}
                    height={400}
                    className="w-full h-64 lg:h-80 object-cover rounded-[12px]"
                    unoptimized
                  />
                </div>
              </div>
            )}

            {/* Location Details */}
            <div className="bg-white rounded-[20px] p-6 lg:p-8">
              <h2 className="text-xl font-manrope font-semibold text-black mb-4">Location</h2>
              <div className="space-y-3">
                {report.address && (
                  <div className="flex items-start gap-2">
                    <MapPin className="w-5 h-5 text-black/60 mt-0.5" />
                    <span className="text-black/70 font-manrope font-medium">{report.address}</span>
                  </div>
                )}
                <div className="flex items-start gap-2">
                  <MapPin className="w-5 h-5 text-black/60 mt-0.5" />
                  <span className="text-black/70 font-manrope font-medium">
                    Coordinates: {report.lat.toFixed(6)}, {report.lng.toFixed(6)}
                  </span>
                </div>
              </div>
            </div>

            {/* Resolution Notes */}
            {report.resolution_notes && (
              <div className="bg-white rounded-[20px] p-6 lg:p-8">
                <h2 className="text-xl font-manrope font-semibold text-black mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Resolution Notes
                </h2>
                <p className="text-black/70 text-base font-manrope font-medium leading-relaxed">
                  {report.resolution_notes}
                </p>
                {report.resolved_at && (
                  <p className="text-sm text-black/50 font-manrope font-medium mt-3">
                    Resolved on {new Date(report.resolved_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            <div className="bg-white rounded-[20px] p-6">
              <h3 className="text-lg font-manrope font-semibold text-black mb-4">Actions</h3>
              <div className="space-y-3">
                <Button
                  onClick={handleUpvote}
                  disabled={isUpvoting}
                  className="w-full bg-black hover:bg-bluish-pink text-white hover:text-black transition-colors flex items-center gap-2"
                >
                  <ThumbsUp className="w-4 h-4" />
                  {isUpvoting ? "Upvoting..." : `Upvote (${report.upvote_count})`}
                </Button>
                
                <Button
                  onClick={handleShare}
                  variant="outline"
                  className="w-full flex items-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  Share Report
                </Button>

                <Button
                  onClick={() => setShowDeleteConfirm(true)}
                  variant="outline"
                  className="w-full flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Report
                </Button>
              </div>
            </div>

            {/* Report Stats */}
            <div className="bg-white rounded-[20px] p-6">
              <h3 className="text-lg font-manrope font-semibold text-black mb-4">Report Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-black/60 font-manrope font-medium">Status</span>
                  <Badge className={`${getStatusColor(report.status)} text-white`}>
                    {getStatusLabel(report.status)}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-black/60 font-manrope font-medium">Priority</span>
                  <Badge className={getPriorityColor(report.priority)}>
                    {report.priority.charAt(0).toUpperCase() + report.priority.slice(1)}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-black/60 font-manrope font-medium">Upvotes</span>
                  <span className="text-black font-manrope font-semibold">{report.upvote_count}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-black/60 font-manrope font-medium">Views</span>
                  <span className="text-black font-manrope font-semibold">{report.view_count}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-black/60 font-manrope font-medium">Created</span>
                  <span className="text-black font-manrope font-semibold">
                    {new Date(report.created_at).toLocaleDateString()}
                  </span>
                </div>
                {report.updated_at !== report.created_at && (
                  <div className="flex justify-between items-center">
                    <span className="text-black/60 font-manrope font-medium">Updated</span>
                    <span className="text-black font-manrope font-semibold">
                      {new Date(report.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-[20px] p-6 max-w-md w-full"
          >
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-red-500" />
              <h3 className="text-lg font-manrope font-semibold text-black">Delete Report</h3>
            </div>
            <p className="text-black/70 font-manrope font-medium mb-6">
              Are you sure you want to delete this report? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button
                onClick={() => setShowDeleteConfirm(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete Report"
                )}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
