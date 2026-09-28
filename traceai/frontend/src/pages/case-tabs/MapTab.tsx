import React, { useEffect, useRef } from 'react';
import { AlertTriangle } from 'lucide-react';
import type { CCTVSighting, InvestigatorTip, MissingPerson, TimelineEvent } from '../../types';

export default function MapTab({ sightings, tips, mp, timeline }: {
  sightings: CCTVSighting[];
  tips: InvestigatorTip[];
  mp: MissingPerson;
  timeline: TimelineEvent[];
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    // Dynamic import of Leaflet to avoid SSR issues
    import('leaflet').then(L => {
      import('leaflet/dist/leaflet.css');

      // Fix default icon
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });

      const allLat = [
        ...sightings.filter(s => s.lat).map(s => s.lat!),
        ...timeline.filter(t => t.lat).map(t => t.lat!),
      ];
      const allLng = [
        ...sightings.filter(s => s.lng).map(s => s.lng!),
        ...timeline.filter(t => t.lng).map(t => t.lng!),
      ];

      const centerLat = allLat.length ? allLat.reduce((a, b) => a + b, 0) / allLat.length : 21.17;
      const centerLng = allLng.length ? allLng.reduce((a, b) => a + b, 0) / allLng.length : 72.83;

      const map = L.map(mapRef.current!, {
        center: [centerLat, centerLng],
        zoom: 13,
        zoomControl: true,
      });
      mapInstance.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      // CCTV markers (purple)
      const cctv_icon = L.divIcon({
        className: '',
        html: `<div style="width:28px;height:28px;background:#7c3aed;border:2px solid #a78bfa;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;">📹</div>`,
        iconSize: [28, 28], iconAnchor: [14, 14],
      });

      sightings.filter(s => s.lat && s.lng).forEach(s => {
        L.marker([s.lat!, s.lng!], { icon: cctv_icon })
          .addTo(map)
          .bindPopup(`
            <div style="font-family:sans-serif;font-size:12px;min-width:200px;">
              <strong style="color:#7c3aed">CCTV Sighting</strong><br/>
              <strong>${s.camera_id}</strong><br/>
              ${s.location}<br/>
              <em>${s.date} ${s.time}</em><br/>
              <hr style="margin:4px 0;border-color:#334155"/>
              ${s.description.slice(0, 120)}...
              ${s.observed_clothing ? `<br/><small>Clothing: ${s.observed_clothing}</small>` : ''}
              <br/><small>Confidence: ${Math.round(s.confidence * 100)}%</small>
            </div>
          `);
      });

      // Timeline markers (blue for family, green for witness)
      timeline.filter(t => t.lat && t.lng).forEach(t => {
        const color = t.source === 'family' ? '#2563eb' : t.source === 'witness' ? '#16a34a' : '#0e7490';
        const emoji = t.source === 'family' ? '👨‍👩‍👦' : t.source === 'witness' ? '👁' : '📍';
        const icon = L.divIcon({
          className: '',
          html: `<div style="width:28px;height:28px;background:${color};border:2px solid white;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;">${emoji}</div>`,
          iconSize: [28, 28], iconAnchor: [14, 14],
        });
        L.marker([t.lat!, t.lng!], { icon })
          .addTo(map)
          .bindPopup(`
            <div style="font-family:sans-serif;font-size:12px;min-width:180px;">
              <strong style="color:${color}">${t.title}</strong><br/>
              <em>${t.date} ${t.time}</em><br/>
              <hr style="margin:4px 0;border-color:#334155"/>
              ${t.description.slice(0, 120)}
            </div>
          `);
      });

      // Movement trail
      const trailPoints = sightings
        .filter(s => s.lat && s.lng)
        .sort((a, b) => a.time.localeCompare(b.time))
        .map(s => [s.lat!, s.lng!] as [number, number]);

      if (trailPoints.length > 1) {
        L.polyline(trailPoints, {
          color: '#3b82f6', weight: 2, opacity: 0.6, dashArray: '6,4',
        }).addTo(map);
      }

      // Fit bounds
      if (allLat.length > 0) {
        const bounds = L.latLngBounds([[allLat[0], allLng[0]]]);
        allLat.forEach((lat, i) => bounds.extend([lat, allLng[i]]));
        map.fitBounds(bounds.pad(0.2));
      }
    });

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-semibold text-white">Investigation Map</h2>
          <p className="text-xs text-amber-400 flex items-center gap-1 mt-0.5">
            <AlertTriangle className="w-3 h-3" />
            Investigation Map — Mock Data — OpenStreetMap
          </p>
        </div>
        {/* Legend */}
        <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-purple-600 inline-block" /> CCTV Sightings</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-blue-600 inline-block" /> Family/Last Known</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-600 inline-block" /> Witness Tips</span>
          <span className="flex items-center gap-1"><span className="border-t-2 border-blue-400 border-dashed w-6 inline-block" /> Movement Trail</span>
        </div>
      </div>
      <div ref={mapRef} style={{ height: '500px', borderRadius: '0.75rem', overflow: 'hidden', border: '1px solid rgba(71,85,105,0.5)' }} />
    </div>
  );
}
