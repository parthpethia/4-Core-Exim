import React, { useEffect, useState } from 'react';
import { FiClock } from 'react-icons/fi';
import { detectMarketCountry } from '../utils/marketLocation';

/**
 * Compact top-bar clock from the visitor's device timezone + detected market.
 */
export default function VisitorLocalClock() {
  const [now, setNow] = useState(() => new Date());
  const [tz, setTz] = useState('UTC');
  const [market, setMarket] = useState('AE');

  useEffect(() => {
    try {
      setTz(Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC');
    } catch {
      setTz('UTC');
    }
    setMarket(detectMarketCountry());
  }, []);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  let timeLabel = '';
  let shortTz = tz;
  try {
    timeLabel = new Intl.DateTimeFormat(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: tz
    }).format(now);
    shortTz = tz.includes('/') ? tz.split('/').pop().replace(/_/g, ' ') : tz;
  } catch {
    timeLabel = now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  }

  return (
    <span
      className="inline-flex items-center gap-1.5 text-brand-gray-300"
      title={`Your device time (${tz}). Catalog market: ${market}`}
    >
      <FiClock className="text-xs opacity-80" aria-hidden />
      <span className="text-white font-semibold tabular-nums">{timeLabel}</span>
      <span className="text-brand-gray-500">·</span>
      <span>{shortTz}</span>
      <span className="text-brand-gray-500">·</span>
      <span className="text-emerald-400/90 font-semibold">{market}</span>
    </span>
  );
}
