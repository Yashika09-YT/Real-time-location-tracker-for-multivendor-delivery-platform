"use client";
import React, { useEffect, useRef } from 'react';
import L, { LatLngExpression, Map as LeafletMap, Marker as LeafletMarker, Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';

// @ts-ignore
const iconRetinaUrl = require('leaflet/dist/images/marker-icon-2x.png');
// @ts-ignore
const iconUrl = require('leaflet/dist/images/marker-icon.png');
// @ts-ignore
const shadowUrl = require('leaflet/dist/images/marker-shadow.png');

interface MapDisplayProps {
    center: LatLngExpression;
    zoom?: number;
    markerPosition?: LatLngExpression | null;
    markerPopupText?: string;
}

const MapDisplay: React.FC<MapDisplayProps> = ({
    center,
    zoom = 13,
    markerPosition,
    markerPopupText = "Delivery Partner Location"
}) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const leafletMapRef = useRef<LeafletMap | null>(null);
    const markerRef = useRef<LeafletMarker | null>(null);

    useEffect(() => {
        // @ts-ignore
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: iconRetinaUrl.src,
            iconUrl: iconUrl.src,
            shadowUrl: shadowUrl.src,
        });
    }, []);
    
    useEffect(() => {
        if (mapRef.current && !leafletMapRef.current) {
            leafletMapRef.current = L.map(mapRef.current).setView(center, zoom);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(leafletMapRef.current);
        }

        if (leafletMapRef.current && center) {
                leafletMapRef.current.setView(center, zoom);
        }

    }, [center, zoom]);

    useEffect(() => {
        if (leafletMapRef.current && markerPosition) {
            if (!markerRef.current) {
                markerRef.current = L.marker(markerPosition).addTo(leafletMapRef.current);
                if (markerPopupText) {
                    markerRef.current.bindPopup(markerPopupText).openPopup();
                }
            } else {
                markerRef.current.setLatLng(markerPosition);
            }
        } else if (leafletMapRef.current && !markerPosition && markerRef.current) {
            leafletMapRef.current.removeLayer(markerRef.current);
            markerRef.current = null;
        }
    }, [markerPosition, markerPopupText]);

    return <div ref={mapRef} className="leaflet-container" style={{ height: '400px', width: '100%' }} />;
};

export default MapDisplay;
