'use client'; import { useState } from 'react';
export default function CheckoutMapPin() {
  const [coords, setCoords] = useState({ lat: 5.6679, lng: -0.1685 });
  return (
    <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-white max-w-sm">
      <div className="text-cyan-400 font-bold uppercase mb-2">Delivery Destination Matrix Pin</div>
      <div className="bg-slate-900 p-2 rounded border border-slate-850 mb-3 text-slate-400 text-[11px]">
        ?? Coordinates Latitude: {coords.lat.toFixed(6)} | Longitude: {coords.lng.toFixed(6)}
      </div>
      <button onClick={() => setCoords({ lat: 5.6685 + Math.random() * 0.01, lng: -0.1691 - Math.random() * 0.01 })} className="w-full py-2 bg-cyan-950 border border-cyan-500 rounded text-cyan-400 font-bold uppercase hover:bg-cyan-900 transition-colors">Pin Current Geolocation</button>
    </div>
  );
}
