import React from 'react';
import { Star } from 'lucide-react';

export default function StarRating({ stars, size = 'medium' }) {
  const iconSize = size === 'large' ? 'w-8 h-8' : 'w-5 h-5';
  
  return (
    <div className="flex gap-1">
      {[1, 2, 3].map((i) => (
        <Star
          key={i}
          className={`${iconSize} ${i <= stars ? 'text-amber-400 fill-amber-400' : 'text-slate-700'}`}
        />
      ))}
    </div>
  );
}
