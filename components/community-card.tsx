import React from "react";
import { MapPin, Users, AlertCircle, TrendingUp, CheckCircle, Clock } from "lucide-react";
import { Community } from "@/types";

interface CommunityCardProps {
  community: Community;
  onJoin?: (communityId: string) => void;
  isJoined?: boolean;
}

export default function CommunityCard({ community, onJoin, isJoined = false }: CommunityCardProps) {
  const getCategoryColor = (category: string) => {
    const colors = {
      city: "bg-blue-100 text-blue-700",
      neighborhood: "bg-green-100 text-green-700",
      district: "bg-purple-100 text-purple-700",
      campus: "bg-orange-100 text-orange-700",
      region: "bg-pink-100 text-pink-700",
    };
    return colors[category as keyof typeof colors] || colors.city;
  };

  const getCategoryEmoji = (category: string) => {
    const emojis = {
      city: "🏙️",
      neighborhood: "🏘️",
      district: "🏛️",
      campus: "🎓",
      region: "🗺️",
    };
    return emojis[category as keyof typeof emojis] || "📍";
  };

  const handleJoinClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onJoin && !isJoined) {
      onJoin(community.id);
    }
  };

  return (
    <div className="group relative bg-white rounded-2xl hover:shadow-xl shadow-cream-light transition-all duration-300 overflow-hidden border cursor-pointer font-manrope tracking-tight">
      {/* Banner Image */}
      <div className="relative h-32 bg-cream-light overflow-hidden">
        {community.banner_url ? (
          <img
            src={community.banner_url}
            alt={community.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        ) : (
          <div className="absolute inset-0 bg-cream-light opacity-80" />
        )}

        {/* Verified Badge */}
        {community.is_verified && (
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center space-x-1">
            <CheckCircle className="w-3 h-3 text-blue-600" />
            <span className="text-xs font-medium text-blue-700">Verified</span>
          </div>
        )}

        {/* Distance Badge */}
        {community.distance_km !== undefined && (
          <div className="absolute top-3 left-3 flex items-center justify-center bg-black/50 backdrop-blur-sm rounded-full px-3 py-1 text-center w-fit">
            <span className="text-xs tracking-tight font-manrope leading-5 font-medium text-white">
              📍 {community.distance_km} km away
            </span>
          </div>
        )}
      </div>

      {/* Community Icon/Avatar */}
      <div className="absolute top-20 left-4 w-16 h-16  rounded-[14px] border-4 shadow-lg shadow-cream-light border-white overflow-hidden group-hover:scale-110 transition-transform duration-300">
        {community.icon_url ? (
          <img
            src={community.icon_url}
            alt={community.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-cream-light flex items-center justify-center text-2xl">
            {getCategoryEmoji(community.category)}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 pt-8 bg-white">
        {/* Category Badge */}
        <div className="mb-2">
          <span
            className={`inline-block px-2 py-1 rounded-lg text-xs font-medium ${getCategoryColor(
              community.category
            )}`}
          >
            {community.category.charAt(0).toUpperCase() + community.category.slice(1)}
          </span>
        </div>

        {/* Community Name */}
        <h3 className="text-lg font-bold text-black line-clamp-1 transition-colors mb-1">
          {community.name}
        </h3>

        {/* Location */}
        <div className="flex items-center text-xs lg:text-sm text-black/50 mb-3">
          <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
          <span className="line-clamp-1">{community.address}</span>
        </div>

        {/* Description */}
        {community.description && (
          <p className="text-sm text-black mb-4 line-clamp-2 tracking-normal font-medium">
            {community.description}
          </p>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* Members */}
          <div className="flex items-center space-x-2 bg-cream-lighter rounded-lg px-3 py-2">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <div className="min-w-0">
              <div className="text-xs text-black/50">Members</div>
              <div className="text-sm font-semibold text-black">
                {community.member_count.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Reports */}
          <div className="flex items-center space-x-2 bg-cream-lighter rounded-lg px-3 py-2">
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-4 h-4 text-orange-600" />
            </div>
            <div className="min-w-0">
              <div className="text-xs text-black/50">Reports</div>
              <div className="text-sm font-semibold text-black">
                {community.report_count.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleJoinClick}
          disabled={isJoined}
          className={`w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-200 ${
            true
              ? "bg-green-100 text-green-700 border border-green-200 cursor-default"
              : "bg-black text-white transform hover:scale-[1.02] active:scale-[0.98]"
          }`}
        >
          {true ? (
            <span className="flex items-center justify-center space-x-2">
              <CheckCircle className="w-4 h-4" />
              <span>Joined</span>
            </span>
          ) : (
            "Join Community"
          )}
        </button>

        {/* Activity Indicator */}
        {community.report_count > 0 && (
          <div className="mt-3 flex items-center justify-center space-x-2 text-xs text-black/50">
            <TrendingUp className="w-3 h-3 text-green-500" />
            <span>Active community</span>
          </div>
        )}
      </div>
    </div>
  );
}
