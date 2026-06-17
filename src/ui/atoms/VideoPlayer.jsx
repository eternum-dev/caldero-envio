import { useState } from 'react';

export default function VideoPlayer({
  src,
  poster,
  className = 'w-full rounded-sm',
  loop = true,
  muted = true,
  autoPlay = true,
  playsInline = true,
  fallback,
  ...props
}) {
  const [error, setError] = useState(false);

  if (error || !src) {
    return (
      fallback || (
        <div className={`${className} bg-surface border border-gold/18 flex items-center justify-center aspect-video`}>
          <p className="font-sans text-xs text-muted">Video próximamente</p>
        </div>
      )
    );
  }

  return (
    <video
      className={className}
      loop={loop}
      muted={muted}
      autoPlay={autoPlay}
      playsInline={playsInline}
      poster={poster}
      onError={() => setError(true)}
      {...props}
    >
      <source src={src} type="video/mp4" />
    </video>
  );
}
