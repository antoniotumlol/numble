import React from 'react';
import { Button } from '@/components/ui/button';
import { Twitter, Linkedin, MessageCircle } from 'lucide-react';

export default function ShareDialog({ open, onOpenChange, stars, title = "Share your result", icon = null }) {
  if (!open) return null;

  const date = new Date().toLocaleDateString();
  const text = `Numble Daily ${date}\n🎯 Result: ${stars}/15\nPlay here: https://gamenumble.site\n#DigitsAltenative`;
  
  const shareLinks = {
    whatsapp: `https://wa.me/?text=${encodeURIComponent(text)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=https://gamenumble.site&summary=${encodeURIComponent(text)}`
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-sm w-full">
        <h2 className="text-xl font-bold text-white mb-4 text-center flex items-center justify-center gap-2">
            {icon}
            {title}
        </h2>
        <div className="flex justify-center gap-4 py-4">
          <a href={shareLinks.whatsapp} target="_blank" rel="noopener noreferrer" className="p-3 rounded-full bg-green-600 text-white hover:bg-green-700">
            <MessageCircle className="w-6 h-6" />
          </a>
          <a href={shareLinks.twitter} target="_blank" rel="noopener noreferrer" className="p-3 rounded-full bg-black text-white hover:bg-gray-800">
            <Twitter className="w-6 h-6" />
          </a>
          <a href={shareLinks.linkedin} target="_blank" rel="noopener noreferrer" className="p-3 rounded-full bg-blue-700 text-white hover:bg-blue-800">
            <Linkedin className="w-6 h-6" />
          </a>
        </div>
        <Button className="w-full mt-4" variant="secondary" onClick={() => onOpenChange(false)}>Close</Button>
      </div>
    </div>
  );
}
