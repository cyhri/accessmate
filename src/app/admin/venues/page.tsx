"use client";

import React, { useState, useEffect } from "react";
import { Plus, Search, MapPin, Building2, Check, Trash2, Edit2, X, ExternalLink } from "lucide-react";
import { venuesRepository, type Venue, type VenueCategory, type VenuePublicationStatus } from "@/features/venues";
import { assessmentRepository } from "@/features/assessment";

export default function AdminVenuesPage() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingVenue, setEditingVenue] = useState<Venue | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [category, setCategory] = useState<VenueCategory>("civic");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [lat, setLat] = useState("52.5200");
  const [lon, setLon] = useState("13.3700");
  const [status, setStatus] = useState<VenuePublicationStatus>("published");

  useEffect(() => {
    const handleUpdate = () => {
      setVenues(venuesRepository.getVenues());
    };
    handleUpdate();
    window.addEventListener("accessmate:venues-updated", handleUpdate);
    return () => window.removeEventListener("accessmate:venues-updated", handleUpdate);
  }, []);

  const handleOpenCreate = () => {
    setEditingVenue(null);
    setName("");
    setCategory("civic");
    setDescription("");
    setAddress("");
    setLat("52.5200");
    setLon("13.3700");
    setStatus("published");
    setShowCreateModal(true);
  };

  const handleOpenEdit = (v: Venue) => {
    setEditingVenue(v);
    setName(v.name);
    setCategory(v.category);
    setDescription(v.description);
    setAddress(v.address);
    setLat(v.coordinates.latitude.toString());
    setLon(v.coordinates.longitude.toString());
    setStatus(v.publicationStatus);
    setShowCreateModal(true);
  };

  const handleSaveVenue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const parsedLat = parseFloat(lat) || 52.5200;
    const parsedLon = parseFloat(lon) || 13.3700;
    const now = new Date().toISOString();

    const venueRecord: Venue = {
      id: editingVenue?.id ?? `ven-${Date.now()}`,
      name: name.trim(),
      slug: name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      category,
      description: description.trim(),
      address: address.trim(),
      coordinates: { latitude: parsedLat, longitude: parsedLon },
      publicationStatus: status,
      buildingAssessmentIds: editingVenue?.buildingAssessmentIds ?? [],
      createdAt: editingVenue?.createdAt ?? now,
      updatedAt: now,
    };

    venuesRepository.saveVenue(venueRecord);
    setVenues(venuesRepository.getVenues());
    setShowCreateModal(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this venue?")) {
      venuesRepository.deleteVenue(id);
      setVenues(venuesRepository.getVenues());
    }
  };

  const filtered = venues.filter((v) =>
    v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 font-display">
            Venues Registry
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Maintain verified public destinations, transit stations, and geographic points of interest.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-900 text-white text-xs font-semibold hover:bg-zinc-800 transition-all shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add New Venue</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search venues by name, category, or address..."
          className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-zinc-200 bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900 shadow-2xs"
        />
      </div>

      {/* Venues Table */}
      <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs divide-y divide-zinc-200">
          <thead className="bg-zinc-50 text-zinc-500 font-semibold font-mono text-[10px] uppercase tracking-wider">
            <tr>
              <th className="px-5 py-3">Venue Name &amp; Description</th>
              <th className="px-5 py-3">Category</th>
              <th className="px-5 py-3">Coordinates</th>
              <th className="px-5 py-3">Audits Linked</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {filtered.map((venue) => {
              const auditCount = venue.buildingAssessmentIds?.length ?? 0;
              return (
                <tr key={venue.id} className="hover:bg-zinc-50/70 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="font-bold text-zinc-900">{venue.name}</div>
                    <div className="text-[11px] text-zinc-500 mt-0.5">{venue.address}</div>
                    {venue.description && (
                      <div className="text-[10px] text-zinc-400 italic mt-0.5 truncate max-w-md">
                        {venue.description}
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="capitalize px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700 font-mono text-[10px]">
                      {venue.category}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-mono text-[11px] text-zinc-600">
                    {venue.coordinates.latitude.toFixed(4)}, {venue.coordinates.longitude.toFixed(4)}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="font-semibold text-zinc-800 tabular-nums">
                      {auditCount} {auditCount === 1 ? "audit" : "audits"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-semibold ${
                        venue.publicationStatus === "published"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-zinc-100 text-zinc-600"
                      }`}
                    >
                      {venue.publicationStatus}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right space-x-2">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(venue)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 transition-colors cursor-pointer"
                      title="Edit venue"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(venue.id)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Delete venue"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-zinc-400 text-xs">
                  No venues found matching &quot;{searchQuery}&quot;.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Venue Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="max-w-lg w-full bg-white rounded-3xl border border-zinc-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
              <h2 className="text-base font-bold text-zinc-900 font-display">
                {editingVenue ? "Edit Venue Record" : "Register New Venue"}
              </h2>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-1 text-zinc-400 hover:text-zinc-700 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveVenue} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-zinc-700 block">Venue Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Humboldt Forum Museum"
                  className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-xs bg-zinc-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-zinc-700 block">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as VenueCategory)}
                    className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-xs bg-zinc-50 focus:bg-white"
                  >
                    <option value="transport">Transport</option>
                    <option value="culture">Culture</option>
                    <option value="healthcare">Healthcare</option>
                    <option value="civic">Civic</option>
                    <option value="commercial">Commercial</option>
                    <option value="education">Education</option>
                    <option value="recreation">Recreation</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-zinc-700 block">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as VenuePublicationStatus)}
                    className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-xs bg-zinc-50 focus:bg-white"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-zinc-700 block">Address</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Schloßplatz 1, 10178 Berlin"
                  className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-xs bg-zinc-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-zinc-700 block">Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={lat}
                    onChange={(e) => setLat(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-xs bg-zinc-50 focus:bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-zinc-700 block">Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={lon}
                    onChange={(e) => setLon(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-xs bg-zinc-50 focus:bg-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-zinc-700 block">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Summary of accessibility features, transit lines, and entrance orientation..."
                  className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-xs bg-zinc-50 focus:bg-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-zinc-600 hover:bg-zinc-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-semibold shadow-xs cursor-pointer"
                >
                  Save Venue Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
