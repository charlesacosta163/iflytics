"use client";

import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface BlogImageBlockProps {
  images: string[];
  version: string;
}

export default function BlogImageBlock({ images, version }: BlogImageBlockProps) {
  if (images.length === 0) {
    return null;
  }

  if (images.length === 1) {
    return (
      <div className="w-full rounded-xl overflow-hidden mb-5 border border-gray-100 dark:border-gray-700">
        <Image
          src={images[0]}
          alt={`${version} screenshot`}
          width={0}
          height={0}
          sizes="100vw"
          style={{ width: "100%", height: "auto" }}
        />
      </div>
    );
  }

  return (
    <div className="mb-5">
      <Carousel className="w-full" opts={{ loop: true }}>
        <CarouselContent>
          {images.map((src, i) => (
            <CarouselItem key={i}>
              <div className="w-full rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700">
                <Image
                  src={src}
                  alt={`${version} screenshot ${i + 1}`}
                  width={0}
                  height={0}
                  sizes="100vw"
                  style={{ width: "100%", height: "auto" }}
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-2" />
        <CarouselNext className="right-2" />
      </Carousel>
      <p className="text-center text-[11px] text-gray-400 dark:text-gray-600 mt-2">
        {images.length} images
      </p>
    </div>
  );
}
