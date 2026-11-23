import {useState} from 'react';
import {Recycle} from 'lucide-react';

interface ResilientImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackLabel?: string;
}

export function ResilientImage({
  src,
  alt,
  className = '',
  fallbackLabel,
}: ResilientImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-emerald-50 via-stone-100 to-emerald-100/70 text-emerald-900 p-6 text-center ${className}`}
      >
        <Recycle className="w-8 h-8 text-emerald-700 mb-2" strokeWidth={1.5} />
        <span className="text-xs font-medium text-emerald-950/80 max-w-[180px] leading-relaxed">
          {fallbackLabel || alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={className}
    />
  );
}
