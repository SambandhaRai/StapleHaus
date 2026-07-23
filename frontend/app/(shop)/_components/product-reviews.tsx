"use client";

import { type FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Star, Trash2 } from "lucide-react";
import { Button } from "@/app/_components/button";
import { Textarea } from "@/app/_components/textarea";
import { handleCreateReview, handleDeleteReview } from "@/lib/actions/reviews-action";
import { getCsrfToken } from "@/lib/csrf-client";

type ReviewUser = {
    _id?: string;
    name?: string;
} | string | null;

export interface ProductReview {
    _id: string;
    userId?: ReviewUser;
    rating: number;
    body: string;
    createdAt?: string;
}

interface ProductReviewsProps {
    productId: string;
    productName: string;
    loggedIn: boolean;
    currentUserId?: string;
    currentUserName?: string;
    currentUserRole?: string;
    initialReviews: ProductReview[];
}

const formatReviewDate = (date?: string) => {
    if (!date) return "";
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return "";

    return new Intl.DateTimeFormat("en", {
        month: "short",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC",
    }).format(parsed);
};

const getReviewerId = (review: ProductReview) => {
    if (!review.userId) return "";
    if (typeof review.userId === "string") return review.userId;
    return review.userId._id || "";
};

const getReviewerName = (review: ProductReview) => {
    if (!review.userId || typeof review.userId === "string") return "Verified customer";
    return review.userId.name || "Verified customer";
};

const getAverageRating = (reviews: ProductReview[]) => {
    if (reviews.length === 0) return 0;
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return Math.round((total / reviews.length) * 10) / 10;
};

function StarRating({
    value,
    onChange,
    readOnly = false,
    size = 18,
}: {
    value: number;
    onChange?: (rating: number) => void;
    readOnly?: boolean;
    size?: number;
}) {
    return (
        <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, index) => {
                const rating = index + 1;
                const filled = rating <= Math.round(value);

                if (readOnly) {
                    return (
                        <Star
                            key={rating}
                            size={size}
                            className={filled ? "text-ink" : "text-neutral-300"}
                            fill={filled ? "currentColor" : "none"}
                            aria-hidden="true"
                        />
                    );
                }

                return (
                    <button
                        key={rating}
                        type="button"
                        onClick={() => onChange?.(rating)}
                        className="text-neutral-300 transition hover:text-ink"
                        aria-label={`Rate ${rating} out of 5`}
                        title={`Rate ${rating} out of 5`}
                    >
                        <Star
                            size={size + 4}
                            className={rating <= value ? "text-ink" : ""}
                            fill={rating <= value ? "currentColor" : "none"}
                        />
                    </button>
                );
            })}
        </div>
    );
}

export function ProductReviews({
    productId,
    productName,
    loggedIn,
    currentUserId,
    currentUserName,
    currentUserRole,
    initialReviews,
}: ProductReviewsProps) {
    const router = useRouter();
    const [reviews, setReviews] = useState<ProductReview[]>(initialReviews);
    const [rating, setRating] = useState(0);
    const [body, setBody] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const reviewCount = reviews.length;
    const avgRating = getAverageRating(reviews);
    const roundedRating = Math.round(avgRating || 0);

    const currentUserReview = useMemo(
        () => reviews.find((review) => currentUserId && getReviewerId(review) === currentUserId),
        [currentUserId, reviews],
    );

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!loggedIn) {
            router.push("/login");
            return;
        }
        if (!rating) {
            toast.error("Please choose a rating");
            return;
        }
        if (!body.trim()) {
            toast.error("Please write your review");
            return;
        }

        setSubmitting(true);
        const result = await handleCreateReview(productId, { rating, body: body.trim() });
        setSubmitting(false);

        if (!result.success || !result.data) {
            toast.error(result.message || "Failed to submit review");
            return;
        }

        const created = result.data as ProductReview;
        setReviews((current) => [
            {
                ...created,
                userId: {
                    _id: currentUserId,
                    name: currentUserName,
                },
                createdAt: created.createdAt || new Date().toISOString(),
            },
            ...current,
        ]);
        setRating(0);
        setBody("");
        toast.success(result.message || "Review submitted successfully");
    };

    const handleDelete = async (reviewId: string) => {
        setDeletingId(reviewId);
        const result = await handleDeleteReview(reviewId, getCsrfToken());
        setDeletingId(null);

        if (!result.success) {
            toast.error(result.message || "Failed to delete review");
            return;
        }

        setReviews((current) => current.filter((review) => review._id !== reviewId));
        toast.success(result.message || "Review deleted");
    };

    return (
        <section className="mx-auto w-full max-w-7xl px-6 pb-20">
            <div className="border-t border-border pt-12">
                <div className="grid gap-10 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)]">
                    <div>
                        <p className="eyebrow mb-3">Reviews</p>
                        <h2 className="h2">Customer Notes</h2>
                        <div className="mt-5 flex items-center gap-3">
                            <StarRating value={roundedRating} readOnly size={18} />
                            <span className="numeric body-sm text-muted">
                                {reviewCount
                                    ? `${avgRating.toFixed(1)} from ${reviewCount} ${reviewCount === 1 ? "review" : "reviews"}`
                                    : "No reviews yet"}
                            </span>
                        </div>

                        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                            {loggedIn ? (
                                currentUserReview ? (
                                    <p className="body-sm border border-border bg-neutral-50 px-4 py-3 text-neutral-600">
                                        You&apos;ve already reviewed {productName}.
                                    </p>
                                ) : (
                                    <>
                                        <div>
                                            <p className="label-caps mb-2 text-neutral-700">Your Rating</p>
                                            <StarRating value={rating} onChange={setRating} />
                                        </div>
                                        <Textarea
                                            label="Your Review"
                                            name="review"
                                            value={body}
                                            onChange={(event) => setBody(event.target.value)}
                                            rows={5}
                                            maxLength={2000}
                                            placeholder="How did it fit, feel, and wear?"
                                        />
                                        <Button type="submit" isLoading={submitting}>
                                            Submit Review
                                        </Button>
                                    </>
                                )
                            ) : (
                                <Button type="button" onClick={() => router.push("/login")}>
                                    Sign In To Review
                                </Button>
                            )}
                        </form>
                    </div>

                    <div className="space-y-0 border-t border-border lg:border-t-0">
                        {reviews.length > 0 ? (
                            reviews.map((review) => {
                                const reviewerId = getReviewerId(review);
                                const canDelete = Boolean(
                                    currentUserId
                                    && (reviewerId === currentUserId || currentUserRole === "admin"),
                                );

                                return (
                                    <article
                                        key={review._id}
                                        className="border-b border-border py-6 first:pt-0 lg:first:pt-0"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <StarRating value={review.rating} readOnly size={15} />
                                                <p className="mt-3 text-sm font-medium text-ink">
                                                    {getReviewerName(review)}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                {review.createdAt ? (
                                                    <span className="numeric text-xs text-muted">
                                                        {formatReviewDate(review.createdAt)}
                                                    </span>
                                                ) : null}
                                                {canDelete ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(review._id)}
                                                        disabled={deletingId === review._id}
                                                        className="text-muted transition hover:text-danger disabled:opacity-40"
                                                        aria-label="Delete review"
                                                        title="Delete review"
                                                    >
                                                        <Trash2 size={15} strokeWidth={1.6} />
                                                    </button>
                                                ) : null}
                                            </div>
                                        </div>
                                        <p className="body-sm mt-4 whitespace-pre-line text-neutral-600">
                                            {review.body}
                                        </p>
                                    </article>
                                );
                            })
                        ) : (
                            <div className="border-b border-border py-8">
                                <p className="body-sm text-muted">
                                    Be the first to leave a review for this product.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
