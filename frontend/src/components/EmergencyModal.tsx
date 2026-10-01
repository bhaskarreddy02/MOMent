import React, { useState, useEffect, useRef } from 'react';
import {
  X, PhoneCall, ShieldAlert, Navigation, Hospital, MapPin,
  Share2, Clock, LocateFixed, Compass, ExternalLink, AlertTriangle,
  RotateCw, Layers, CheckCircle2, PhoneForwarded
} from 'lucide-react';
import L from 'leaflet';
import { PregnancyProfile, HospitalFacility } from '../types';
import { api } from '../services/api';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: PregnancyProfile;
  onOpenDoctorSummary: () => void;
}

// Default fallback location: Bengaluru, Karnataka (Ananya's clinic area)
const DEFAULT_COORDS = { lat: 12.9602, lng: 77.6484 };

export const EmergencyModal: React.FC<EmergencyModalProps> = ({
  isOpen,
  onClose,
  profile,
  onOpenDoctorSummary
}) => {
  const [hospitals, setHospitals] = useState<HospitalFacility[]>([]);
  const [selectedHospital, setSelectedHospital] = useState<HospitalFacility | null>(null);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [callInitiated, setCallInitiated] = useState<string | null>(null);

  // Live Map & Geolocation States
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number }>(DEFAULT_COORDS);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'requesting' | 'granted' | 'denied' | 'simulated'>('idle');
  const [locationError, setLocationError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'map' | 'list'>('map');

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);

  // 1. Fetch hospitals on open or coords change
  const loadHospitals = async (lat: number, lng: number) => {
    try {
      const data = await api.getNearbyHospitals(lat, lng);
      setHospitals(data);
      if (data.length > 0 && !selectedHospital) {
        setSelectedHospital(data[0]);
      }
    } catch {
      // Fallback handled in api
    }
  };

  // 2. Request Live Geolocation
  const requestLiveLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('denied');
      setLocationError("Geolocation is not supported by your browser.");
      return;
    }

    setLocationStatus('requesting');
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        };
        setUserCoords(coords);
        setLocationStatus('granted');
        loadHospitals(coords.lat, coords.lng);
      },
      (err) => {
        console.warn("Geolocation permission denied or timed out:", err.message);
        setLocationStatus('denied');
        setLocationError("Location access was denied or timed out. Showing default maternity hospital network.");
        // Still load default hospitals
        loadHospitals(DEFAULT_COORDS.lat, DEFAULT_COORDS.lng);
      },
      { timeout: 10000, enableHighAccuracy: true, maximumAge: 60000 }
    );
  };

  // On open, trigger location request and load initial facilities
  useEffect(() => {
    if (isOpen) {
      requestLiveLocation();
    }
  }, [isOpen]);

  // 3. Initialize & Update Leaflet Live Map
  useEffect(() => {
    if (!isOpen || activeTab !== 'map' || !mapContainerRef.current) return;

    // Small delay to ensure modal transition and DOM dimensions are ready
    const timer = setTimeout(() => {
      if (!mapContainerRef.current) return;

      // Clean existing instance if any
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      // Initialize Leaflet map
      const map = L.map(mapContainerRef.current, {
        center: [userCoords.lat, userCoords.lng],
        zoom: 13,
        zoomControl: true,
        attributionControl: false
      });
      mapInstanceRef.current = map;

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19
      }).addTo(map);

      // Create LayerGroup for markers
      const markerGroup = L.layerGroup().addTo(map);
      markersGroupRef.current = markerGroup;

      // A) User Location Marker (Pulsing Blue Pin)
      const userIcon = L.divIcon({
        className: 'custom-user-marker',
        html: `
          <div style="position: relative; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 28px; height: 28px; border-radius: 50%; background: rgba(59, 130, 246, 0.35); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="width: 16px; height: 16px; border-radius: 50%; background: #2563eb; border: 3px solid #ffffff; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      const userMarker = L.marker([userCoords.lat, userCoords.lng], { icon: userIcon }).addTo(markerGroup);
      userMarker.bindPopup(`
        <div style="font-family: inherit; font-size: 12px; padding: 4px;">
          <b style="color: #1e3a8a;">📍 Your Live Location</b><br/>
          <span style="color: #64748b;">${locationStatus === 'granted' ? 'High-accuracy GPS active' : 'Default patient vicinity'}</span>
        </div>
      `);

      // B) Hospital Markers
      const bounds = L.latLngBounds([[userCoords.lat, userCoords.lng]]);

      hospitals.forEach((hosp) => {
        const isSelected = selectedHospital?.id === hosp.id;
        const isSaved = hosp.is_saved_hospital;

        bounds.extend([hosp.coordinates.lat, hosp.coordinates.lng]);

        const hospIcon = L.divIcon({
          className: 'custom-hosp-marker',
          html: `
            <div style="
              background: ${isSaved ? '#b91c1c' : '#2563eb'};
              color: white;
              border-radius: 12px;
              padding: 4px 8px;
              box-shadow: 0 4px 10px rgba(0,0,0,0.25);
              border: 2px solid ${isSelected ? '#facc15' : '#ffffff'};
              display: flex;
              align-items: center;
              gap: 4px;
              font-size: 11px;
              font-weight: 700;
              cursor: pointer;
              transform: ${isSelected ? 'scale(1.12)' : 'scale(1)'};
              transition: transform 0.2s;
              white-space: nowrap;
            ">
              <span>🏥</span>
              <span>${hosp.name.split('-')[0].trim()}</span>
            </div>
          `,
          iconSize: [120, 32],
          iconAnchor: [60, 16]
        });

        const marker = L.marker([hosp.coordinates.lat, hosp.coordinates.lng], { icon: hospIcon }).addTo(markerGroup);

        marker.on('click', () => {
          setSelectedHospital(hosp);
        });

        marker.bindPopup(`
          <div style="font-family: inherit; font-size: 12px; min-width: 180px; padding: 2px;">
            <div style="font-weight: 800; color: #0f172a; margin-bottom: 2px;">${hosp.name}</div>
            <div style="font-size: 10px; color: #059669; font-weight: 700; margin-bottom: 4px;">● ${hosp.status}</div>
            <div style="font-size: 11px; color: #475569; margin-bottom: 6px;">${hosp.address}</div>
            <div style="font-size: 11px; font-weight: 700; color: #b91c1c;">Distance: ${hosp.distance_miles} km</div>
          </div>
        `);
      });

      if (hospitals.length > 0) {
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
      }

      // Invalidate size in case modal layout animated
      map.invalidateSize();
    }, 150);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isOpen, activeTab, userCoords, hospitals, selectedHospital?.id]);

  if (!isOpen) return null;

  const handleSimulateCall = (title: string, phone: string) => {
    setCallInitiated(`${title} (${phone})`);
    setTimeout(() => setCallInitiated(null), 4500);
  };

  const handleShareSummary = () => {
    const summaryText = `MOMENT EMERGENCY OBSTETRIC BRIEF
Patient: ${profile.user_name} (29 yrs, G1P0)
Gestational Age: Week ${profile.gestational_week} + ${profile.gestational_days}d (Due: ${profile.due_date})
Known Risk Factors: ${profile.relevant_conditions.join('; ')}
Allergies: ${profile.allergies.join('; ')}
Active Prescriptions: ${profile.current_medications.join('; ')}
Supervising OB-GYN: ${profile.ob_gyn_name} (${profile.clinic_name})
Primary Triage Center: ${profile.hospital_name} (${profile.hospital_triage_phone})
Emergency Contact: ${profile.emergency_contact.name} (${profile.emergency_contact.phone})`;

    navigator.clipboard.writeText(summaryText);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 3000);
  };

  const handleGetDirections = (hosp: HospitalFacility) => {
    const origin = `${userCoords.lat},${userCoords.lng}`;
    const destination = encodeURIComponent(hosp.address);
    const gmapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`;
    window.open(gmapsUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[94vh] flex flex-col shadow-2xl border-2 border-red-500 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Urgent Emergency Banner */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-red-600 via-clinical-red to-red-700 text-white flex items-start justify-between">
          <div className="flex items-start space-x-3.5">
            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
              <ShieldAlert className="w-6 h-6 text-amber-300 animate-pulse" />
            </div>
            <div>
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-[10px] font-bold uppercase tracking-wider mb-1">
                <span>Emergency Obstetric Care Pathway</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                Obstetric Emergency & Live Triage
              </h2>
              <p className="text-xs sm:text-sm text-red-100 mt-0.5 max-w-2xl">
                At {profile.gestational_week} weeks with {profile.relevant_conditions[0]}, 
                acute symptoms require immediate Level III/IV obstetric evaluation.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl text-white/80 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Call Simulator Toast */}
        {callInitiated && (
          <div className="bg-amber-400 text-slate-950 font-bold px-4 py-2 text-xs flex items-center justify-center space-x-2 animate-bounce">
            <PhoneCall className="w-4 h-4 animate-spin" />
            <span>Simulating Call: {callInitiated} (Native dialer ready)</span>
          </div>
        )}

        {/* Action Buttons Grid */}
        <div className="p-4 sm:p-5 space-y-5 flex-1 overflow-y-auto bg-stone-50/60">
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            
            {/* 1. National Emergency */}
            <button
              onClick={() => handleSimulateCall("National Emergency Services (112 / 108)", "112")}
              className="p-3.5 rounded-2xl bg-clinical-red hover:bg-red-700 text-white shadow-md flex flex-col justify-between text-left transition-all group"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <PhoneCall className="w-4 h-4 text-white" />
                </div>
                <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-white text-clinical-red">
                  URGENT
                </span>
              </div>
              <div>
                <span className="text-[10px] text-red-200 block">Immediate Ambulance</span>
                <span className="font-extrabold text-base text-white">Call 112 / 108</span>
                <p className="text-[10px] text-red-100 mt-0.5">Maternity Emergency Line</p>
              </div>
            </button>

            {/* 2. Call Saved Doctor */}
            <button
              onClick={() => handleSimulateCall(profile.ob_gyn_name, "+91 80 4969 4400")}
              className="p-3.5 rounded-2xl bg-white hover:bg-stone-50 text-stone-900 border border-stone-200 shadow-xs flex flex-col justify-between text-left transition-all group"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-lg bg-moment-50 text-moment-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Hospital className="w-4 h-4" />
                </div>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-moment-100 text-moment-700">
                  OB-GYN
                </span>
              </div>
              <div>
                <span className="text-[10px] text-stone-400 block">Personal Doctor</span>
                <span className="font-bold text-xs text-stone-900 line-clamp-1">{profile.ob_gyn_name}</span>
                <p className="text-[10px] text-stone-500 mt-0.5 truncate">{profile.clinic_name}</p>
              </div>
            </button>

            {/* 3. Call Saved Hospital Triage */}
            <button
              onClick={() => handleSimulateCall(profile.hospital_name, profile.hospital_triage_phone)}
              className="p-3.5 rounded-2xl bg-white hover:bg-stone-50 text-stone-900 border border-stone-200 shadow-xs flex flex-col justify-between text-left transition-all group"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <PhoneForwarded className="w-4 h-4" />
                </div>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">
                  24/7 L&D
                </span>
              </div>
              <div>
                <span className="text-[10px] text-stone-400 block">Hospital Triage</span>
                <span className="font-bold text-xs text-stone-900 line-clamp-1">{profile.hospital_name}</span>
                <p className="text-[10px] text-stone-500 mt-0.5">{profile.hospital_triage_phone}</p>
              </div>
            </button>

            {/* 4. Share Health Summary */}
            <button
              onClick={handleShareSummary}
              className="p-3.5 rounded-2xl bg-white hover:bg-stone-50 text-stone-900 border border-stone-200 shadow-xs flex flex-col justify-between text-left transition-all group"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Share2 className="w-4 h-4" />
                </div>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">
                  {copiedSummary ? 'COPIED!' : 'ONE-CLICK'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-stone-400 block">Triage Handoff</span>
                <span className="font-bold text-xs text-stone-900">
                  {copiedSummary ? 'Copied to Clipboard!' : 'Copy Clinical Brief'}
                </span>
                <p className="text-[10px] text-stone-500 mt-0.5">Quick data for ER doctor</p>
              </div>
            </button>

          </div>

          {/* ── LIVE MAP VIEW & NEARBY HOSPITALS ─────────────────── */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-stone-200 shadow-xs space-y-4">
            
            {/* Header with GPS Location Request Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
              <div>
                <h3 className="font-bold text-stone-900 text-base flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-clinical-red" />
                  <span>Live Map View: 24/7 Maternity Emergency Centers</span>
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Real-time GPS proximity, Level III Neonatal ICUs & round-the-clock labor triage
                </p>
              </div>

              <div className="flex items-center gap-2">
                {/* Geolocation Button */}
                <button
                  onClick={requestLiveLocation}
                  disabled={locationStatus === 'requesting'}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                    locationStatus === 'granted'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                      : 'bg-stone-100 text-stone-700 border-stone-200 hover:bg-stone-200'
                  }`}
                  title="Detect your exact live coordinates via browser GPS"
                >
                  <LocateFixed className={`w-3.5 h-3.5 ${locationStatus === 'requesting' ? 'animate-spin text-moment-500' : 'text-stone-600'}`} />
                  <span>
                    {locationStatus === 'requesting'
                      ? 'Acquiring GPS...'
                      : locationStatus === 'granted'
                      ? 'Live GPS Active'
                      : 'Use My Live GPS'}
                  </span>
                </button>

                {/* View Switcher */}
                <div className="flex items-center bg-stone-100 p-0.5 rounded-xl border border-stone-200">
                  <button
                    onClick={() => setActiveTab('map')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                      activeTab === 'map' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    🗺️ Map
                  </button>
                  <button
                    onClick={() => setActiveTab('list')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                      activeTab === 'list' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    📋 List
                  </button>
                </div>
              </div>
            </div>

            {/* Location Notice / Error */}
            {locationError && (
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{locationError}</span>
              </div>
            )}

            {/* LIVE MAP CONTAINER */}
            {activeTab === 'map' && (
              <div className="space-y-3">
                <div className="relative w-full h-72 sm:h-80 rounded-2xl overflow-hidden border border-stone-200 shadow-inner">
                  <div ref={mapContainerRef} className="w-full h-full" />
                  
                  {/* Floating Map Legend */}
                  <div className="absolute bottom-3 left-3 z-[400] bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-stone-200 text-[11px] font-medium text-stone-700 flex items-center gap-3 shadow-xs">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span> You (GPS)
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-clinical-red"></span> Saved Hospital
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Level III/IV OB
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-stone-400 text-center">
                  💡 Click any hospital marker on the map to view instant drive times and launch turn-by-turn navigation.
                </p>
              </div>
            )}

            {/* HOSPITAL FACILITY CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
              {hospitals.slice(0, 3).map((hosp) => {
                const isSelected = selectedHospital?.id === hosp.id;
                return (
                  <div
                    key={hosp.id}
                    onClick={() => setSelectedHospital(hosp)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-moment-500 bg-[#FDF8F5] shadow-xs'
                        : 'border-stone-200 bg-white hover:border-stone-300'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        {hosp.is_saved_hospital ? (
                          <span className="px-2 py-0.5 rounded-md bg-rose-100 text-moment-700 font-bold text-[10px]">
                            PRIMARY SAVED
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 font-medium text-[10px]">
                            Nearby Triage
                          </span>
                        )}
                        <span className="font-extrabold text-moment-600 text-xs">
                          {hosp.distance_miles} km
                        </span>
                      </div>

                      <h4 className="font-bold text-stone-900 text-sm leading-snug">{hosp.name}</h4>
                      <p className="text-[11px] text-stone-500 font-medium">{hosp.level}</p>
                      <p className="text-[11px] text-stone-600 flex items-center space-x-1">
                        <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
                        <span className="truncate">{hosp.address}</span>
                      </p>
                    </div>

                    <div className="pt-2.5 mt-2.5 border-t border-stone-100 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-emerald-700 flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-emerald-600" />
                        <span>{hosp.status}</span>
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSimulateCall(hosp.name, hosp.triage_phone);
                        }}
                        className="text-xs font-bold text-clinical-red hover:text-red-800 flex items-center gap-1"
                      >
                        <PhoneCall className="w-3 h-3" />
                        <span>Call</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Interactive Directions Preview for Selected Hospital */}
            {selectedHospital && (
              <div className="p-4 rounded-2xl bg-stone-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-center sm:text-left">
                  <div className="text-[11px] text-moment-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Navigation className="w-3.5 h-3.5 text-moment-300" />
                    <span>Fastest Route to {selectedHospital.name}</span>
                  </div>
                  <div className="text-sm font-semibold text-white">
                    Estimated Transit: <span className="text-emerald-400 font-bold">~{Math.round(selectedHospital.distance_miles * 2.5 + 4)} mins</span> ({selectedHospital.distance_miles} km away)
                  </div>
                  <p className="text-xs text-stone-400">
                    24/7 dedicated Obstetric High-Dependency Unit & Emergency Triage. Direct paramedic access.
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleGetDirections(selectedHospital)}
                    className="px-4 py-2.5 rounded-xl bg-moment-500 hover:bg-moment-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Open Live Google Maps</span>
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* Quick Doctor Summary Button */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-stone-200">
            <div>
              <h4 className="font-bold text-stone-900 text-sm">Need a complete clinical record for triage staff?</h4>
              <p className="text-xs text-stone-500">
                Generate the structured "Since Your Last Visit" doctor handoff document.
              </p>
            </div>
            <button
              onClick={() => {
                onClose();
                onOpenDoctorSummary();
              }}
              className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <span>Open Doctor Summary</span>
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="p-3 bg-stone-100 border-t border-stone-200 text-center text-xs text-stone-500">
          MOMENT Emergency SOS • In an acute crisis, dial 112 / 108 immediately or proceed to the nearest emergency labor ward.
        </div>

      </div>
    </div>
  );
};
