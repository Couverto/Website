import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";

interface ImageViewerProps {
  images: string[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
}

export const ImageViewer = ({ images, initialIndex = 0, isOpen, onClose }: ImageViewerProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, initialIndex]);

  const handleNext = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      setCurrentIndex((prev) => (prev + 1) % images.length);
    },
    [images.length],
  );

  const handlePrev = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    },
    [images.length],
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, handleNext, handlePrev]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={onClose}
        >
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white hover:bg-white/20 z-50 rounded-full"
            onClick={onClose}
          >
            <X className="h-6 w-6" />
          </Button>

          {/* Navigation Buttons */}
          {images.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 z-50 rounded-full h-12 w-12"
                onClick={handlePrev}
              >
                <ChevronLeft className="h-8 w-8" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 z-50 rounded-full h-12 w-12"
                onClick={handleNext}
              >
                <ChevronRight className="h-8 w-8" />
              </Button>
            </>
          )}

          {/* Image Counter */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/80 text-sm font-medium px-3 py-1 bg-black/50 rounded-full">
            {currentIndex + 1} / {images.length}
          </div>

          {/* Main Image */}
          <div className="relative w-full h-full p-4 md:p-12 flex items-center justify-center">
            <motion.img
              key={currentIndex}
              src={images[currentIndex]}
              alt={`Gallery image ${currentIndex + 1}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="max-w-full max-h-full object-contain shadow-2xl rounded-sm"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

import { useState } from "react";
