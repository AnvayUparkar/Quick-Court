"use client"

import { useState, useEffect } from "react"
import {
  UserPlusIcon,
  ChatBubbleLeftIcon,
  MapPinIcon,
  StarIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline"
import { useData } from "../contexts/DataContext"

const PlayerProfiles = () => {
  const { players, searchPlayers } = useData()
  const [following, setFollowing] = useState<number[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState({
    sport: "All Sports",
    level: "All Levels",
    location: "All Locations",
  })
  const [filteredPlayers, setFilteredPlayers] = useState(players)

  useEffect(() => {
    const results = searchPlayers(searchQuery, filters)
    setFilteredPlayers(results)
  }, [searchQuery, filters, searchPlayers])

  const handleFollow = (playerId: number) => {
    setFollowing((prev) => (prev.includes(playerId) ? prev.filter((id) => id !== playerId) : [...prev, playerId]))
  }

  const handleFilterChange = (filterType: string, value: string) => {
    setFilters((prev) => ({ ...prev, [filterType]: value }))
  }

  const clearFilters = () => {
    setFilters({
      sport: "All Sports",
      level: "All Levels",
      location: "All Locations",
    })
    setSearchQuery("")
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Professional":
        return "bg-purple-100 text-purple-800"
      case "Advanced":
        return "bg-emerald-100 text-emerald-800"
      case "Intermediate":
        return "bg-blue-100 text-blue-800"
      case "Beginner":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getSportIcon = (sport: string) => {
    const icons: { [key: string]: string } = {
      Badminton: "🏸",
      Tennis: "🎾",
      Football: "⚽",
      Swimming: "🏊",
      Cricket: "🏏",
      "Table Tennis": "🏓",
    }
    return icons[sport] || "🏃"
  }

  const uniqueLocations = Array.from(new Set(players.map((p) => p.location.split(",")[0])))

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Connect with Sports Community</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover and connect with fellow sports enthusiasts in your area. Find practice partners, join teams, and
            build lasting friendships through sports.
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Search */}
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search players by name, sport, or bio..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4">
              <select
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                value={filters.sport}
                onChange={(e) => handleFilterChange("sport", e.target.value)}
              >
                <option>All Sports</option>
                <option>Badminton</option>
                <option>Tennis</option>
                <option>Football</option>
                <option>Swimming</option>
                <option>Cricket</option>
                <option>Table Tennis</option>
              </select>

              <select
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                value={filters.level}
                onChange={(e) => handleFilterChange("level", e.target.value)}
              >
                <option>All Levels</option>
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
                <option>Professional</option>
              </select>

              <select
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                value={filters.location}
                onChange={(e) => handleFilterChange("location", e.target.value)}
              >
                <option>All Locations</option>
                {uniqueLocations.map((location) => (
                  <option key={location}>{location}</option>
                ))}
              </select>

              {(searchQuery ||
                filters.sport !== "All Sports" ||
                filters.level !== "All Levels" ||
                filters.location !== "All Locations") && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition duration-200"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredPlayers.length} player{filteredPlayers.length !== 1 ? "s" : ""}
          </div>
        </div>

        {/* Players Grid */}
        {filteredPlayers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlayers.map((player) => (
              <div
                key={player.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-200"
              >
                <div className="p-6">
                  {/* Player Header */}
                  <div className="flex items-center space-x-4 mb-4">
                    <img
                      src={player.image || "/placeholder.svg"}
                      alt={player.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{player.name}</h3>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <span>{getSportIcon(player.sport)}</span>
                        <span>{player.sport}</span>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(player.level)}`}>
                      {player.level}
                    </span>
                  </div>

                  {/* Player Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <StarIcon className="h-4 w-4 text-yellow-400" />
                        <span className="font-semibold text-gray-900">{player.rating}</span>
                      </div>
                      <p className="text-xs text-gray-600">Rating</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-gray-900">{player.matches}</p>
                      <p className="text-xs text-gray-600">Matches</p>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-center space-x-1 text-sm text-gray-600 mb-4">
                    <MapPinIcon className="h-4 w-4" />
                    <span>{player.location}</span>
                  </div>

                  {/* Bio */}
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{player.bio}</p>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleFollow(player.id)}
                      className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-lg font-medium transition duration-200 ${
                        following.includes(player.id)
                          ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                          : "bg-emerald-600 text-white hover:bg-emerald-700"
                      }`}
                    >
                      <UserPlusIcon className="h-4 w-4" />
                      <span>{following.includes(player.id) ? "Following" : "Connect"}</span>
                    </button>

                    <button className="flex items-center justify-center p-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition duration-200">
                      <ChatBubbleLeftIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-xl mb-4">No players found matching your criteria</p>
            <p className="text-gray-400 mb-6">Try adjusting your search or filters</p>
            <button
              onClick={clearFilters}
              className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition duration-200"
            >
              Clear All Filters
            </button>
          </div>
        )}

        {/* Load More */}
        {filteredPlayers.length > 0 && filteredPlayers.length >= 6 && (
          <div className="text-center mt-12">
            <button className="bg-emerald-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-emerald-700 transition duration-200">
              Load More Players
            </button>
          </div>
        )}

        {/* Community Features */}
        <div className="bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-2xl p-8 mt-12 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Join the Sports Community</h2>
          <p className="text-lg mb-6 opacity-90">
            Create your profile, showcase your skills, and connect with players who share your passion
          </p>
          <button className="bg-white text-emerald-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition duration-200">
            Create Your Profile
          </button>
        </div>
      </div>
    </div>
  )
}

export default PlayerProfiles
