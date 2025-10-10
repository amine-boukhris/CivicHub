"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface Report {
  id: string
  title: string
  description: string
  category: string
  status: string
  latitude: number
  longitude: number
  address: string | null
  image_url: string | null
  created_at: string
}

interface ReportsTableProps {
  reports: Report[]
}

export function ReportsTable({ reports }: ReportsTableProps) {
  const router = useRouter()
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-red-500"
      case "in-progress":
        return "bg-orange-500"
      case "resolved":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "Pending"
      case "in-progress":
        return "In Progress"
      case "resolved":
        return "Resolved"
      default:
        return status
    }
  }

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "pothole":
        return "Pothole"
      case "streetlight":
        return "Streetlight"
      case "trash":
        return "Trash"
      case "graffiti":
        return "Graffiti"
      case "other":
        return "Other"
      default:
        return category
    }
  }

  const handleStatusUpdate = async (reportId: string, newStatus: string) => {
    setIsUpdating(true)
    try {
      const response = await fetch(`/api/reports/${reportId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error("Failed to update status")
      }

      router.refresh()
    } catch (error) {
      console.error("Error updating status:", error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDelete = async (reportId: string) => {
    if (!confirm("Are you sure you want to delete this report?")) return

    setIsUpdating(true)
    try {
      const response = await fetch(`/api/reports/${reportId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete report")
      }

      setSelectedReport(null)
      router.refresh()
    } catch (error) {
      console.error("Error deleting report:", error)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reports.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">
                No reports found
              </TableCell>
            </TableRow>
          ) : (
            reports.map((report) => (
              <TableRow key={report.id}>
                <TableCell className="font-medium">{report.title}</TableCell>
                <TableCell>
                  <Badge variant="outline">{getCategoryLabel(report.category)}</Badge>
                </TableCell>
                <TableCell>
                  <Badge className={`${getStatusColor(report.status)} text-white`}>
                    {getStatusLabel(report.status)}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(report.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedReport(report)}>
                    <Eye className="w-4 h-4 mr-2" />
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Report Details Dialog */}
      <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedReport?.title}</DialogTitle>
            <DialogDescription>Report details and status management</DialogDescription>
          </DialogHeader>

          {selectedReport && (
            <div className="space-y-4">
              {selectedReport.image_url && (
                <img
                  src={selectedReport.image_url || "/placeholder.svg"}
                  alt={selectedReport.title}
                  className="w-full h-64 object-cover rounded-lg"
                />
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">Category</p>
                  <Badge variant="outline">{getCategoryLabel(selectedReport.category)}</Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">Current Status</p>
                  <Badge className={`${getStatusColor(selectedReport.status)} text-white`}>
                    {getStatusLabel(selectedReport.status)}
                  </Badge>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-foreground mb-1">Description</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{selectedReport.description}</p>
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
                <p className="text-sm font-medium text-foreground mb-1">Reported On</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(selectedReport.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-foreground mb-2">Update Status</p>
                <Select
                  value={selectedReport.status}
                  onValueChange={(value) => handleStatusUpdate(selectedReport.id, value)}
                  disabled={isUpdating}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  variant="destructive"
                  onClick={() => handleDelete(selectedReport.id)}
                  disabled={isUpdating}
                  className="flex-1"
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    "Delete Report"
                  )}
                </Button>
                <Button variant="outline" onClick={() => setSelectedReport(null)} className="flex-1">
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
