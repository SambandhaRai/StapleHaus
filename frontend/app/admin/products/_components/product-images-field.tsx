import type { ChangeEvent } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { getUploadUrl } from "@/lib/uploads";
import type { NewImageFile } from "./product-admin-types";

interface ProductImagesFieldProps {
    existingImages: string[];
    newFiles: NewImageFile[];
    onSelectFiles: (event: ChangeEvent<HTMLInputElement>) => void;
    onRemoveExisting: (image: string) => void;
    onRemoveNew: (index: number) => void;
}

export function ProductImagesField({
    existingImages,
    newFiles,
    onSelectFiles,
    onRemoveExisting,
    onRemoveNew,
}: ProductImagesFieldProps) {
    return (
        <div>
            <span className="label-caps mb-2 block text-neutral-700">Images</span>
            {(existingImages.length > 0 || newFiles.length > 0) && (
                <div className="mb-3 flex flex-wrap gap-2">
                    {existingImages.map((url) => (
                        <div key={url} className="relative h-16 w-16 overflow-hidden border border-border">
                            <Image
                                src={getUploadUrl(url)}
                                alt="Product image"
                                fill
                                sizes="64px"
                                unoptimized
                                className="object-cover"
                            />
                            <button
                                type="button"
                                onClick={() => onRemoveExisting(url)}
                                aria-label="Remove image"
                                className="absolute right-0 top-0 bg-ink/70 p-0.5 text-paper"
                            >
                                <X size={12} />
                            </button>
                        </div>
                    ))}
                    {newFiles.map(({ previewUrl }, index) => (
                        <div key={`${previewUrl}-${index}`} className="relative h-16 w-16 overflow-hidden border border-border">
                            <Image
                                src={previewUrl}
                                alt="New product image"
                                fill
                                sizes="64px"
                                unoptimized
                                className="object-cover"
                            />
                            <button
                                type="button"
                                onClick={() => onRemoveNew(index)}
                                aria-label="Remove image"
                                className="absolute right-0 top-0 bg-ink/70 p-0.5 text-paper"
                            >
                                <X size={12} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
            <label className="label-caps inline-flex cursor-pointer items-center gap-2 border border-border px-4 py-2.5 text-neutral-600 transition hover:border-ink hover:text-ink">
                Upload images
                <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={onSelectFiles}
                    className="hidden"
                />
            </label>
        </div>
    );
}
