"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ProductGalleryProps {
    images: string[];
    alt: string;
}

export function ProductGallery({ images, alt }: ProductGalleryProps) {
    const [active, setActive] = useState(0);

    if (images.length === 0) {
        return (
            <div className="flex aspect-[3/4] w-full items-center justify-center bg-neutral-100">
                <span className="eyebrow text-subtle">StapleHaus</span>
            </div>
        );
    }

    const step = (direction: 1 | -1) => {
        setActive((current) => (current + direction + images.length) % images.length);
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="group/gallery relative aspect-[3/4] w-full overflow-hidden bg-neutral-100">
                <Image
                    src={images[active]}
                    alt={alt}
                    fill
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="object-cover"
                />

                {images.length > 1 ? (
                    <>
                        <button
                            type="button"
                            aria-label="Previous image"
                            onClick={() => step(-1)}
                            className="absolute left-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center border border-border bg-paper/90 text-ink opacity-0 backdrop-blur transition hover:bg-ink hover:text-paper group-hover/gallery:opacity-100 md:flex"
                        >
                            <ChevronLeft size={18} strokeWidth={1.5} />
                        </button>
                        <button
                            type="button"
                            aria-label="Next image"
                            onClick={() => step(1)}
                            className="absolute right-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center border border-border bg-paper/90 text-ink opacity-0 backdrop-blur transition hover:bg-ink hover:text-paper group-hover/gallery:opacity-100 md:flex"
                        >
                            <ChevronRight size={18} strokeWidth={1.5} />
                        </button>
                        <span className="numeric absolute bottom-3 right-3 bg-paper/80 px-2 py-1 text-xs text-ink backdrop-blur">
                            {active + 1} / {images.length}
                        </span>
                    </>
                ) : null}
            </div>
            {images.length > 1 ? (
                <div className="grid grid-cols-5 gap-3">
                    {images.map((image, index) => (
                        <button
                            key={image}
                            type="button"
                            onClick={() => setActive(index)}
                            className={`relative aspect-square overflow-hidden bg-neutral-100 transition ${
                                index === active ? "ring-1 ring-ink ring-offset-2" : "opacity-70 hover:opacity-100"
                            }`}
                            aria-label={`View image ${index + 1}`}
                        >
                            <Image
                                src={image}
                                alt=""
                                fill
                                sizes="96px"
                                className="object-cover"
                            />
                        </button>
                    ))}
                </div>
            ) : null}
        </div>
    );
}
