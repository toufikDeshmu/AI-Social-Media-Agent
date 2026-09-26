
import { useState } from "react";
import {
  SearchCheck,
  Sparkles,
  CheckCircle2,
  MessageSquareText,
  Lightbulb,
} from "lucide-react";

function Review() {
  // ==========================================
  // LOAD SAVED POST FROM CREATE POST PAGE
  // ==========================================

  const savedPostContent =
    localStorage.getItem("currentPostContent") || "";

  const savedPostId =
    Number(localStorage.getItem("currentPostId")) || null;

  const [post, setPost] = useState(savedPostContent);
  const [postId] = useState(savedPostId);

  const [loading, setLoading] = useState(false);
  const [review, setReview] = useState(null);
  const [improvedPost, setImprovedPost] = useState("");
  const [improving, setImproving] = useState(false);
  const [approved, setApproved] = useState(false);

  const cleanAIText = (text) => {
    if (!text) return "";

    return text
      .replace(/\*\*/g, "")
      .replace(/\\#/g, "#")
      .replace(/&#x20;/g, " ")
      .replace(/&#39;/g, "'")
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, '"')
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .trim();
  };

  // ==========================================
  // REVIEW POST
  // ==========================================

  const handleReview = async () => {
    if (!post.trim()) {
      alert("Please generate or enter a post to review.");
      return;
    }

    if (!postId) {
      alert("Please generate a post first from Create Post.");
      return;
    }

    setLoading(true);
    setReview(null);
    setImprovedPost("");
    setApproved(false);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/review-post",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            post_id: postId,
            content: post,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = Array.isArray(data.detail)
          ? data.detail
              .map((item) => item.msg || JSON.stringify(item))
              .join(", ")
          : typeof data.detail === "object"
          ? JSON.stringify(data.detail)
          : data.detail || "Review failed";

        throw new Error(errorMessage);
      }

      setReview(data);
    } catch (error) {
      console.error("Review error:", error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // IMPROVE POST
  // ==========================================

  const handleImprove = async () => {
    if (!review || !post.trim()) {
      return;
    }

    setImproving(true);
    setImprovedPost("");
    setApproved(false);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/improve-post",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            post_id: postId,
            content: post,
            feedback: review.feedback,
            suggestions: review.suggestions,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = Array.isArray(data.detail)
          ? data.detail
              .map((item) => item.msg || JSON.stringify(item))
              .join(", ")
          : typeof data.detail === "object"
          ? JSON.stringify(data.detail)
          : data.detail || "Improvement failed";

        throw new Error(errorMessage);
      }

      setImprovedPost(cleanAIText(data.content));
    } catch (error) {
      console.error("Improvement error:", error);
      alert(error.message);
    } finally {
      setImproving(false);
    }
  };

  // ==========================================
  // APPROVE POST
  // ==========================================

  const handleApprove = async () => {
  if (!postId) {
    alert("Post ID not found.");
    return;
  }

  try {
    const response = await fetch(
      "http://127.0.0.1:8000/api/approve-post",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          post_id: postId,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Approval failed");
    }

    console.log("Post approved:", data);

    setApproved(true);

  } catch (error) {

    console.error("Approval error:", error);

    alert(error.message);
  }
};

  // ==========================================
  // SCORE STYLE
  // ==========================================

  const getScoreStyle = () => {
    if (!review) {
      return "bg-indigo-50 text-indigo-600";
    }

    if (review.score >= 8) {
      return "bg-emerald-50 text-emerald-600";
    }

    if (review.score >= 6) {
      return "bg-amber-50 text-amber-600";
    }

    return "bg-red-50 text-red-600";
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8">
      <div className="mx-auto max-w-7xl">

        {/* ==========================================
            HEADER
        ========================================== */}

        <div className="mb-8">
          <div className="mb-2 flex items-center gap-3">

            <div className="rounded-xl bg-indigo-100 p-3">
              <SearchCheck className="h-6 w-6 text-indigo-600" />
            </div>

            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Review Post
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Analyze, improve, and approve your social media content.
              </p>
            </div>

          </div>
        </div>

        {/* ==========================================
            MAIN GRID
        ========================================== */}

        <div className="grid gap-6 lg:grid-cols-2">

          {/* ==========================================
              LEFT SIDE
          ========================================== */}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="mb-5">
              <h2 className="text-lg font-semibold text-slate-900">
                Post Content
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Enter the content you want the AI to review.
              </p>
            </div>

            <textarea
              value={post}
              onChange={(e) => setPost(e.target.value)}
              placeholder="Paste your social media post here..."
              className="h-80 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
            />

            <div className="mt-3 text-right text-xs text-slate-400">
              {post.length} characters
            </div>

            <button
              onClick={handleReview}
              disabled={loading}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >

              <Sparkles className="h-5 w-5" />

              {loading
                ? "AI is reviewing..."
                : "Review with AI"}

            </button>

          </div>

          {/* ==========================================
              RIGHT SIDE
          ========================================== */}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="mb-5">
              <h2 className="text-lg font-semibold text-slate-900">
                AI Review
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Your content quality analysis will appear here.
              </p>
            </div>

            {!review ? (

              <div className="flex h-80 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-center">

                <div>

                  <SearchCheck className="mx-auto mb-3 h-10 w-10 text-slate-300" />

                  <p className="font-medium text-slate-500">
                    No review yet
                  </p>

                  <p className="mt-1 text-sm text-slate-400">
                    Enter a post and click Review with AI.
                  </p>

                </div>

              </div>

            ) : (

              <div className="space-y-5">

                {/* ==========================================
                    SCORE
                ========================================== */}

                <div
                  className={`rounded-2xl p-5 ${getScoreStyle()}`}
                >

                  <div className="flex items-center justify-between">

                    <div>

                      <p className="text-sm font-medium opacity-70">
                        Overall Score
                      </p>

                      <p className="mt-1 text-4xl font-bold">

                        {review.score}

                        <span className="text-xl opacity-50">
                          /10
                        </span>

                      </p>

                    </div>

                    <div className="rounded-full bg-white/70 p-3">

                      <CheckCircle2 className="h-7 w-7" />

                    </div>

                  </div>

                </div>

                {/* ==========================================
                    FEEDBACK
                ========================================== */}

                <div className="rounded-xl border border-slate-200 p-4">

                  <div className="mb-3 flex items-center gap-2">

                    <MessageSquareText className="h-5 w-5 text-indigo-600" />

                    <h3 className="font-semibold text-slate-900">
                      Feedback
                    </h3>

                  </div>

                  <p className="text-sm leading-6 text-slate-600">
                    {cleanAIText(review.feedback)}
                  </p>

                </div>

                {/* ==========================================
                    SUGGESTIONS
                ========================================== */}

                <div className="rounded-xl border border-slate-200 p-4">

                  <div className="mb-3 flex items-center gap-2">

                    <Lightbulb className="h-5 w-5 text-amber-500" />

                    <h3 className="font-semibold text-slate-900">
                      Suggestions
                    </h3>

                  </div>

                  <div className="space-y-3">

                    {Array.isArray(review.suggestions) &&
                      review.suggestions.map((suggestion, index) => {

                        const suggestionText =
                          typeof suggestion === "string"
                            ? suggestion
                            : suggestion?.text ||
                              suggestion?.suggestion ||
                              JSON.stringify(suggestion);

                        return (
                          <div
                            key={index}
                            className="flex gap-3 rounded-lg bg-slate-50 p-3"
                          >

                            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-600">
                              {index + 1}
                            </div>

                            <p className="text-sm leading-6 text-slate-600">
                              {cleanAIText(suggestionText)}
                            </p>

                          </div>
                        );
                      })}

                  </div>

                </div>

                {/* ==========================================
                    IMPROVE BUTTON
                ========================================== */}

                <button
                  onClick={handleImprove}
                  disabled={improving}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                >

                  <Sparkles className="h-5 w-5" />

                  {improving
                    ? "Improving Post..."
                    : "Improve Post with AI"}

                </button>

                {/* ==========================================
                    IMPROVED POST
                ========================================== */}

                {improvedPost && (

                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">

                    <div className="mb-4 flex items-center justify-between">

                      <h3 className="font-semibold text-emerald-900">
                        Improved Post
                      </h3>

                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
                        AI Improved
                      </span>

                    </div>

                    <div className="rounded-xl bg-white/70 p-4">

                      <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">
                        {improvedPost}
                      </p>

                    </div>

                    {/* ==========================================
                        APPROVE BUTTON
                    ========================================== */}

                    <button
                      onClick={handleApprove}
                      disabled={approved}
                      className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-emerald-600"
                    >

                      <CheckCircle2 className="h-5 w-5" />

                      {approved
                        ? "Post Approved"
                        : "Approve Post"}

                    </button>

                    {/* ==========================================
                        APPROVED MESSAGE
                    ========================================== */}

                    {approved && (

                      <div className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-emerald-100 px-4 py-3 text-sm font-medium text-emerald-700">

                        <CheckCircle2 className="h-4 w-4" />

                        <span>
                          This post has been approved.
                        </span>

                      </div>

                    )}

                  </div>

                )}

              </div>

            )}

          </div>

        </div>

      </div>
    </div>
  );
}

export default Review;