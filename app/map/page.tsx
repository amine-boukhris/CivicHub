"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, ArrowLeft, Filter, X, List } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AnimatePresence, motion } from "motion/react";
import AppLogo from "@/components/app-logo";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import Image from "next/image";

// Dynamically import the map component to avoid SSR issues
const MapView = dynamic(() => import("@/components/map-view"), { ssr: false });

export interface Report {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  latitude: number;
  longitude: number;
  address: string | null;
  image_url: string | null;
  created_at: string;
}

export default function MapPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [view, setView] = useState<"map" | "feed">("feed");

  useEffect(() => {
    fetchReports();
    const storedView = localStorage.getItem("view");
    if (storedView && (storedView == "map" || storedView == "feed")) {
      setView(storedView);
    }
  }, []);

  useEffect(() => {
    filterReports();
  }, [reports, statusFilter, categoryFilter]);

  const fetchReports = async () => {
    try {
      const response = await fetch("/api/reports");
      const data = await response.json();
      setReports(data.data || []);
    } catch (error) {
      console.error("Error fetching reports:", error);
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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-white z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AppLogo />
          </div>
          <div className="flex items-center gap-2">
            <Link href="/report">
              <Button size="sm" className="bg-[#2E5BFF] hover:bg-[#1E3A8A]">
                Report Issue
              </Button>
            </Link>
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Home
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="bg-white border-b border-border relative z-30">
        <div className="container mx-auto px-4 py-4">
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
                className="lg:w-96 bg-white border-l border-border overflow-y-auto absolute z-50 right-0 top-0 bottom-0"
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
        <div className="flex-1 overflow-y-auto bg-secondary/20">
          <div className="container mx-auto px-4 py-6 grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
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
                <Card key={report.id} className="overflow-hidden pt-0">
                  {report.image_url && (
                    <Image
                      src={report.image_url || "/placeholder.svg"}
                      alt={report.title}
                      className="w-full h-64 object-cover"
                      width={400}
                      height={160}
                      unoptimized={report.image_url ? false : true}
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
