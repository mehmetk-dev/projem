'use client';

import { useEffect, useState } from 'react';

const formatter = new Intl.DateTimeFormat('tr-TR', {
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'Europe/Istanbul',
});

// Sunucu ve istemci saati farklı olacağı için yalnızca mount sonrası render edilir
export default function IstanbulClock() {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const update = () => setTime(formatter.format(new Date()));
    const first = setTimeout(update, 0);
    const timer = setInterval(update, 30_000);
    return () => {
      clearTimeout(first);
      clearInterval(timer);
    };
  }, []);

  return <span className="tabular-nums">{time ?? '--:--'}</span>;
}
