"use client";

import { useState } from "react";
import { ModalOverlay } from "@/components/ModalOverlay";
import { deriveOriginalImagePath } from "../../_lib/imageUpload";

interface ImageLightboxProps {
  alt: string;
  url: string;
  onClose: () => void;
}

/** 고해상도 원본 경로를 먼저 시도하고, 존재하지 않으면(리사이즈가 생략된 이미지, GIF, 업로드
 * 실패, 이 기능 이전에 저장된 이미지) 리사이즈본으로 자동 폴백한다. */
export const ImageLightbox = ({ alt, url, onClose }: ImageLightboxProps) => {
  const [highResFailed, setHighResFailed] = useState(false);
  const src = highResFailed ? url : deriveOriginalImagePath(url);

  return (
    <ModalOverlay className="z-[300] p-5" onClose={onClose}>
      <div className="relative">
        <img
          alt={alt}
          className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain"
          src={src}
          onError={() => setHighResFailed(true)}
        />
        <button
          aria-label="닫기"
          className="absolute right-2 top-2 flex size-6 items-center justify-center rounded-md bg-black/50 text-white hover:bg-black/70"
          type="button"
          onClick={onClose}
        >
          ✕
        </button>
      </div>
    </ModalOverlay>
  );
};
