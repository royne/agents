import React from 'react';
import { FaTimes } from 'react-icons/fa';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  title: string;
}

const VideoModal: React.FC<VideoModalProps> = ({ isOpen, onClose, videoUrl, title }) => {
  if (!isOpen) return null;

  // Extract video ID from YouTube URL if needed, or assume it's the embed URL
  const getEmbedUrl = (url: string) => {
    if (url.includes('youtube.com/embed/')) return url;
    const videoId = url.split('v=')[1]?.split('&')[0];
    return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-full max-w-5xl bg-[#0d0e12] rounded-3xl border border-white/10 shadow-2xl overflow-hidden aspect-video">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-white/10 transition-colors"
        >
          <FaTimes className="w-5 h-5" />
        </button>

        <div className="absolute top-4 left-4 z-10">
          <h3 className="text-white font-bold text-lg drop-shadow-md">{title}</h3>
        </div>

        <iframe
          src={getEmbedUrl(videoUrl)}
          title={title}
          className="w-full h-full border-none"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
    </div>
  );
};

export default VideoModal;
