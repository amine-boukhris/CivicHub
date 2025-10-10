"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Report } from "@/app/map/page";

interface MapViewProps {
  reports: Report[];
  onMarkerClick: (report: Report) => void;
}

export default function MapView({ reports, onMarkerClick }: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const [mapError, setMapError] = useState<boolean>(false);
  const [isMapReady, setIsMapReady] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      if (!mapContainerRef.current || mapRef.current) return;

      const initializeMap = (lat: number, lon: number) => {
        if (!isMounted || !mapContainerRef.current || mapRef.current) return;

        // check if container already contains a map
        if (mapContainerRef.current.hasOwnProperty("_leaflet_id")) return;

        const map = L.map(mapContainerRef.current!).setView([lat, lon], 13);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map);
        mapRef.current = map;
        setMapError(false);
        setIsMapReady(true);
      };

      const handleMapError = () => {
        if (!isMounted) return;
        setMapError(true);
        if (mapRef.current) {
          mapRef.current.remove();
          mapRef.current = null;
        }
      };

      const guessLocation = async () => {
        if (!isMounted) return;
        try {
          const response = await fetch("https://ipapi.co/json/");
          if (!response.ok) {
            throw new Error("Failed to approximate location");
          }
          const data = await response.json();
          if (data.latitude && data.longitude) {
            initializeMap(data.latitude, data.longitude);
          } else {
            throw new Error("Bad Ip API Response Data. Missing Coordinates");
          }
        } catch (error: unknown) {
          console.error(error instanceof Error ? error.message : "Something went wrong");
          handleMapError();
        }
      };

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          if (!isMounted) return;
          initializeMap(position.coords.latitude, position.coords.longitude);
        }, guessLocation);
      } else {
        guessLocation();
      }
    };

    init();
    // Clean up function
    return () => {
      isMounted = false;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!isMapReady || !mapRef.current) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    if (reports.length === 0) return;

    // Create custom icons based on status
    const getMarkerIcon = (status: string) => {
      const color =
        status === "pending" ? "#EF4444" : status === "in-progress" ? "#F59E0B" : "#10B981";

      return L.divIcon({
        className: "custom-marker",
        html: `
          <div style="
            background-color: ${color};
            width: 24px;
            height: 24px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          "></div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });
    };

    // Add markers for each report
    const newMarkers = reports.map((report) => {
      const marker = L.marker([report.latitude, report.longitude], {
        icon: getMarkerIcon(report.status),
      }).addTo(mapRef.current!);

      marker.on("click", () => {
        onMarkerClick(report);
      });

      return marker;
    });

    markersRef.current = newMarkers;

    // Fit map to show all markers
    if (newMarkers.length > 0) {
      const group = L.featureGroup(newMarkers);
      mapRef.current.fitBounds(group.getBounds().pad(0.1));
    }
  }, [reports, onMarkerClick, isMapReady, mapRef, mapContainerRef]);

  if (mapError) {
    return (
      <div>
        <p className="text-red-500 text-xl text-center m-2">
          Unable to determine your location. Please enable geolocation to use the map features.
        </p>
      </div>
    );
  }

  return <div ref={mapContainerRef} className="w-full h-full min-h-[500px]" />;
}
