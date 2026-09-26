import { useEffect, useState } from "react";
import {
  FileText,
  CheckCircle2,
  Clock,
  Star,
  RefreshCw,
  Send,
} from "lucide-react";

export default function PostHistory() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [repurposingPostId, setRepurposingPostId] =
    useState(null);

  const [repurposedContent, setRepurposedContent] =
    useState(null);

  const [showRepurpose, setShowRepurpose] =
    useState(false);

  const [publishingPostId, setPublishingPostId] =
    useState(null);

  const [deletingPostId, setDeletingPostId] =
  useState(null); 

  const [approvingPostId, setApprovingPostId] =
  useState(null);
  
    const [schedulingPostId, setSchedulingPostId] =
  useState(null);

  const [cancelingSchedulePostId, setCancelingSchedulePostId] =
  useState(null);

const [scheduleDateTime, setScheduleDateTime] =
  useState({});
const getWorkflowSteps = (post) => {
  const reviewCompleted =
    post.reviewScore !== null &&
    post.reviewScore !== undefined;

  const improveRequired =
    reviewCompleted &&
    post.reviewScore < 8;

  const improveCompleted =
    Boolean(post.improvedContent);

  const repurposeCompleted =
    post.repurposedContent &&
    Object.keys(post.repurposedContent).length > 0;

  let publishingStatus = "Waiting";

  if (post.status === "published") {
    publishingStatus = "Published";
  } else if (post.status === "scheduled") {
    publishingStatus = "Scheduled";
  }

  return [
    {
      name: "Content Agent",
      status: post.content ? "Completed" : "Waiting",
    },
    {
      name: "Review Agent",
      status: reviewCompleted
        ? "Completed"
        : "Waiting",
    },
    {
      name: "Quality Decision",
      status: reviewCompleted
        ? improveRequired
          ? "Needs Improvement"
          : "Good"
        : "Waiting",
    },
    {
      name: "Improve Agent",
      status: improveCompleted
        ? "Completed"
        : improveRequired
        ? "Waiting"
        : reviewCompleted
        ? "Not Required"
        : "Waiting",
    },
    {
      name: "Human Approval",
      status: post.approved
        ? "Completed"
        : "Waiting",
    },
    {
      name: "Repurpose Agent",
      status: repurposeCompleted
        ? "Completed"
        : post.approved
        ? "Waiting"
        : "Waiting",
    },
    {
      name: "Schedule / Publish",
      status: publishingStatus,
    },
  ];
};
 const fetchPosts = async () => {
  try {
    setLoading(true);

    const response = await fetch(
      "http://127.0.0.1:8000/api/posts"
    );

    if (!response.ok) {
      throw new Error("Failed to fetch posts");
    }

    const data = await response.json();

    setPosts(data);

    // =====================================================
    // LOAD SAVED REPURPOSED CONTENT
    // =====================================================

    const savedRepurposedPost = data.find(
      (post) =>
        post.repurposedContent &&
        Object.keys(post.repurposedContent).length > 0
    );

    if (savedRepurposedPost) {

      setRepurposedContent({
        postId: savedRepurposedPost.id,
        original:
          savedRepurposedPost.improvedContent ||
          savedRepurposedPost.content,

        linkedin:
          savedRepurposedPost.repurposedContent.linkedin ||
          "",

        instagram:
          savedRepurposedPost.repurposedContent.instagram ||
          "",

        twitter:
          savedRepurposedPost.repurposedContent.twitter ||
          "",

        facebook:
          savedRepurposedPost.repurposedContent.facebook ||
          "",
      });

      setShowRepurpose(true);
    }

  } catch (error) {

    console.error(
      "Error loading post history:",
      error
    );

  } finally {

    setLoading(false);
  }
};

  // =========================================================
  // PUBLISH POST
  // =========================================================

  const handlePublish = async (postId) => {
    try {
      setPublishingPostId(postId);

      const response = await fetch(
        "http://127.0.0.1:8000/api/publish-post",
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
        throw new Error(
          data.detail ||
            "Failed to publish post."
        );
      }

      alert("Post published successfully!");

      await fetchPosts();

    } catch (error) {
      console.error(
        "Publish error:",
        error
      );

      alert(error.message);
    } finally {
      setPublishingPostId(null);
    }
  };

  const handleDelete = async (postId) => {

  const confirmed = window.confirm(
    "Are you sure you want to delete this post?"
  );

  if (!confirmed) {
    return;
  }

  try {

    setDeletingPostId(postId);

    const response = await fetch(
      `http://127.0.0.1:8000/api/posts/${postId}`,
      {
        method: "DELETE",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.detail ||
          "Failed to delete post."
      );
    }

    alert(
      "Post deleted successfully!"
    );

    await fetchPosts();

  } catch (error) {

    console.error(
      "Delete error:",
      error
    );

    alert(error.message);

  } finally {

    setDeletingPostId(null);

  }
};

  const handleApprove = async (postId) => {

  try {

    setApprovingPostId(postId);

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
      throw new Error(
        data.detail ||
          "Failed to approve post."
      );
    }

    alert(
      "Post approved successfully!"
    );

    await fetchPosts();

  } catch (error) {

    console.error(
      "Approve error:",
      error
    );

    alert(error.message);

  } finally {

    setApprovingPostId(null);

  }
};
    // =========================================================
  // SCHEDULE POST
  // =========================================================

  const handleSchedule = async (postId) => {

    const selectedDateTime =
      scheduleDateTime[postId];

    if (!selectedDateTime) {

      alert(
        "Please select a date and time."
      );

      return;
    }

    try {

      setSchedulingPostId(postId);

      const response = await fetch(
        "http://127.0.0.1:8000/api/schedule-post",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            post_id: postId,
            scheduled_at: new Date(
              selectedDateTime
            ).toISOString(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {

        throw new Error(
          data.detail ||
            "Failed to schedule post."
        );
      }

      alert(
        "Post scheduled successfully!"
      );

      await fetchPosts();

    } catch (error) {

      console.error(
        "Schedule error:",
        error
      );

      alert(error.message);

    } finally {

      setSchedulingPostId(null);
    }
  };
  
    // =========================================================
  // CANCEL SCHEDULE
  // =========================================================

  const handleCancelSchedule = async (postId) => {

    try {

      setCancelingSchedulePostId(postId);

      const response = await fetch(
        "http://127.0.0.1:8000/api/cancel-schedule",
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

        throw new Error(
          data.detail ||
            "Failed to cancel schedule."
        );
      }

      alert(
        "Post schedule cancelled successfully!"
      );

      await fetchPosts();

    } catch (error) {

      console.error(
        "Cancel schedule error:",
        error
      );

      alert(error.message);

    } finally {

      setCancelingSchedulePostId(null);
    }
  };


  // =========================================================
  // REPURPOSE POST
  // =========================================================

  const handleRepurpose = async (postId) => {
    try {
      setRepurposingPostId(postId);
      setRepurposedContent(null);
      setShowRepurpose(true);

      const response = await fetch(
        "http://127.0.0.1:8000/api/repurpose-post",
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
        throw new Error(
          data.detail ||
            "Failed to repurpose post."
        );
      }

      setRepurposedContent(data);
    } catch (error) {
      console.error(
        "Repurpose error:",
        error
      );

      alert(error.message);
      setShowRepurpose(false);
    } finally {
      setRepurposingPostId(null);
    }
  };

  // =========================================================
  // COPY
  // =========================================================

  const handleCopy = async (content) => {
    try {
      await navigator.clipboard.writeText(content);

      alert(
        "Content copied to clipboard!"
      );
    } catch (error) {
      console.error(
        "Copy error:",
        error
      );

      alert(
        "Failed to copy content."
      );
    }
  };

  // =========================================================
  // LOAD POSTS
  // =========================================================

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 p-6">

      {/* Header */}
      <div className="mb-8 flex items-center justify-between">

        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Post History
          </h1>

          <p className="mt-1 text-slate-500">
            View all generated, reviewed, improved and approved posts.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchPosts}
          className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>

      </div>

      {/* Loading */}
      {loading && (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
          <p className="text-slate-500">
            Loading post history...
          </p>
        </div>
      )}

      {/* Empty */}
      {!loading && posts.length === 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">

          <FileText className="mx-auto mb-4 h-12 w-12 text-slate-400" />

          <h2 className="text-lg font-semibold text-slate-800">
            No posts yet
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Generate your first social media post to see it here.
          </p>

        </div>
      )}

      {/* Posts */}
      {!loading && posts.length > 0 && (
        <div className="space-y-6">

          {posts.map((post) => (

  <div
    key={post.id}
    className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
  >

    {/* Post Header */}
    <div className="mb-5 flex flex-wrap items-start justify-between gap-4">

      <div>
        <h2 className="text-lg font-semibold text-slate-800">
          Post #{post.id}
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          {post.platform} • {post.contentType}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">

  {!post.approved && (
    <button
      type="button"
      onClick={() => handleApprove(post.id)}
      disabled={approvingPostId === post.id}
      className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {approvingPostId === post.id
        ? "Approving..."
        : "Approve Post"}
    </button>
  )}

  <button
    type="button"
    onClick={() => handleDelete(post.id)}
    disabled={deletingPostId === post.id}
    className="flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
  >
    {deletingPostId === post.id
      ? "Deleting..."
      : "Delete Post"}
  </button>

</div>

    </div>

              {/* Top section */}
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                    <FileText className="h-5 w-5 text-slate-600" />
                  </div>

                  <div>
                    <h2 className="font-semibold text-slate-900">
                      Post #{post.id}
                    </h2>

                    <p className="text-sm text-slate-500">
                      {post.platform || "Social Media"}
                    </p>
                  </div>

                </div>

                {/* Status */}
                {post.status === "published" ? (

                  <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700">
                    <CheckCircle2 className="h-4 w-4" />
                    Published
                  </div>

                ) : post.status === "scheduled" ? (

                  <div className="flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700">
                    <Clock className="h-4 w-4" />
                    Scheduled
                  </div>

                ) : post.status === "approved" ||
                  post.approved ? (

                  <div className="flex items-center gap-2 rounded-full bg-green-50 px-3 py-1.5 text-sm font-medium text-green-700">
                    <CheckCircle2 className="h-4 w-4" />
                    Approved
                  </div>

                ) : (

                  <div className="flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-700">
                    <Clock className="h-4 w-4" />
                    Not Approved
                  </div>

                )}

              </div>

              {/* Published Date */}
              {post.status === "published" &&
                post.publishedAt && (
                  <div className="mb-5 rounded-lg border border-emerald-100 bg-emerald-50 p-4">

                    <div className="flex items-center gap-2">

                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
                          Published On
                        </p>

                        <p className="mt-1 text-sm font-medium text-emerald-800">
                         {new Date(
  post.scheduledAt
).toLocaleString("en-IN", {
  timeZone: "Asia/Kolkata",
  dateStyle: "short",
  timeStyle: "medium",
})}
                        </p>
                      </div>

                    </div>

                  </div>
                )}

                            {/* Scheduled Date */}
              {post.status === "scheduled" &&
                post.scheduledAt && (

                  <div className="mb-5 rounded-lg border border-blue-100 bg-blue-50 p-4">

                    <div className="flex flex-wrap items-center justify-between gap-4">

                      <div className="flex items-center gap-2">

                        <Clock className="h-4 w-4 text-blue-600" />

                        <div>

                          <p className="text-xs font-semibold uppercase tracking-wide text-blue-500">
                            Scheduled For
                          </p>

                          <p className="mt-1 text-sm font-medium text-blue-800">
                            {new Date(
                              post.scheduledAt
                            ).toLocaleString()}
                          </p>

                        </div>

                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          handleCancelSchedule(
                            post.id
                          )
                        }
                        disabled={
                          cancelingSchedulePostId ===
                          post.id
                        }
                        className="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >

                        {cancelingSchedulePostId ===
                        post.id
                          ? "Cancelling..."
                          : "Cancel Schedule"}

                      </button>

                    </div>

                  </div>
                )}
              {/* Agent Workflow */}
<div className="mb-5 rounded-xl border border-slate-200 bg-slate-50 p-5">

  <div className="mb-4 flex items-center justify-between">
    <div>
      <h3 className="text-sm font-semibold text-slate-800">
        Agent Workflow
      </h3>

      <p className="mt-1 text-xs text-slate-500">
        Current AI orchestration status
      </p>
    </div>
  </div>

  <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">

    {getWorkflowSteps(post).map(
      (step, index) => {

        const isCompleted =
          step.status === "Completed" ||
          step.status === "Good" ||
          step.status === "Published" ||
          step.status === "Scheduled";

        const isWaiting =
          step.status === "Waiting";

        const isNeedsImprovement =
          step.status === "Needs Improvement";

        const isNotRequired =
          step.status === "Not Required";

        return (
          <div
            key={step.name}
            className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-3"
          >

            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                isCompleted
                  ? "bg-emerald-100 text-emerald-600"
                  : isNeedsImprovement
                  ? "bg-amber-100 text-amber-600"
                  : isNotRequired
                  ? "bg-slate-100 text-slate-500"
                  : "bg-blue-100 text-blue-600"
              }`}
            >
              {isCompleted
                ? "✓"
                : isNeedsImprovement
                ? "!"
                : isNotRequired
                ? "—"
                : "•"}
            </div>

            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-slate-700">
                {step.name}
              </p>

              <p
                className={`mt-1 text-xs font-medium ${
                  isCompleted
                    ? "text-emerald-600"
                    : isNeedsImprovement
                    ? "text-amber-600"
                    : isNotRequired
                    ? "text-slate-500"
                    : "text-blue-600"
                }`}
              >
                {step.status}
              </p>
            </div>

          </div>
        );
      }
    )}

  </div>

</div>
              {/* Topic */}
              {post.topic && (
                <div className="mb-5">

                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Topic
                  </p>

                  <p className="font-medium text-slate-800">
                    {post.topic}
                  </p>

                </div>
              )}

              {/* Original Content */}
              <div className="mb-5">

                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Original Post
                </p>

                <div className="whitespace-pre-wrap rounded-lg bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                  {post.content}
                </div>

              </div>

              {/* Review */}
              {post.reviewScore !== null &&
                post.reviewScore !== undefined && (
                  <div className="mb-5">

                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      AI Review
                    </p>

                    <div className="rounded-lg border border-slate-200 p-4">

                      <div className="mb-3 flex items-center gap-2">

                        <Star className="h-5 w-5 text-amber-500" />

                        <span className="font-semibold text-slate-800">
                          {post.reviewScore}/10
                        </span>

                      </div>

                      <p className="text-sm leading-6 text-slate-600">
                        {post.reviewFeedback}
                      </p>

                    </div>

                  </div>
                )}

              {/* Improved Content */}
              {post.improvedContent && (
                <div className="mb-5">

                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Improved Post
                  </p>

                  <div className="whitespace-pre-wrap rounded-lg border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-700">
                    {post.improvedContent}
                  </div>

                </div>
              )}

                            {/* Publishing Agent */}
              {post.approved &&
                post.status !== "published" &&
                post.status !== "scheduled" && (
                  <div className="mb-5">

                    <div className="flex flex-wrap items-end gap-3">

                      {/* Schedule Date & Time */}

                      <div>

                        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Schedule Date & Time
                        </label>

                        <input
                          type="datetime-local"
                          value={
                            scheduleDateTime[post.id] ||
                            ""
                          }
                          onChange={(event) =>
                            setScheduleDateTime({
                              ...scheduleDateTime,
                              [post.id]:
                                event.target.value,
                            })
                          }
                          min={
                            new Date()
                              .toISOString()
                              .slice(0, 16)
                          }
                          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />

                      </div>

                      {/* Schedule Button */}

                      <button
                        type="button"
                        onClick={() =>
                          handleSchedule(post.id)
                        }
                        disabled={
                          schedulingPostId ===
                          post.id
                        }
                        className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >

                        <Clock className="h-4 w-4" />

                        {schedulingPostId ===
                        post.id
                          ? "Scheduling..."
                          : "Schedule Post"}

                      </button>

                      {/* Publish Now */}

                      <button
                        type="button"
                        onClick={() =>
                          handlePublish(post.id)
                        }
                        disabled={
                          publishingPostId ===
                          post.id
                        }
                        className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >

                        <Send className="h-4 w-4" />

                        {publishingPostId ===
                        post.id
                          ? "Publishing..."
                          : "Publish Now"}

                      </button>
                      <button
  type="button"
  onClick={() => handleDelete(post.id)}
  disabled={deletingPostId === post.id}
  className="flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
>
  {deletingPostId === post.id
    ? "Deleting..."
    : "Delete Post"}
</button>

                    </div>

                  </div>
                )}

              {/* Already Published */}
              {post.status === "published" && (
                <div className="mb-5">

                  <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">

                    <CheckCircle2 className="h-5 w-5" />

                    This post has already been published.

                  </div>

                </div>
              )}

              {/* Repurpose with AI */}
              {post.approved && (
                <div className="mb-5">

                  <button
                    type="button"
                    onClick={() =>
                      handleRepurpose(post.id)
                    }
                    disabled={
                      repurposingPostId === post.id
                    }
                    className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {repurposingPostId === post.id
                      ? "Repurposing..."
                      : "Repurpose with AI"}
                  </button>

                </div>
              )}

              {/* Repurposed Content */}
              {showRepurpose &&
                repurposedContent &&
                repurposedContent.postId === post.id && (
                  <div className="mb-5">

                    <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      AI Repurposed Content
                    </p>

                    <div className="grid gap-4 md:grid-cols-2">

                      {/* LinkedIn */}
                      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">

                        <div className="mb-2 flex items-center justify-between">

                          <p className="text-sm font-semibold text-slate-800">
                            LinkedIn
                          </p>

                          <button
                            type="button"
                            onClick={() =>
                              handleCopy(
                                repurposedContent.linkedin
                              )
                            }
                            className="rounded-md bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm ring-1 ring-slate-200 hover:bg-slate-100"
                          >
                            Copy
                          </button>

                        </div>

                        <div className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
                          {repurposedContent.linkedin}
                        </div>

                      </div>

                      {/* Instagram */}
                      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">

                        <div className="mb-2 flex items-center justify-between">

                          <p className="text-sm font-semibold text-slate-800">
                            Instagram
                          </p>

                          <button
                            type="button"
                            onClick={() =>
                              handleCopy(
                                repurposedContent.instagram
                              )
                            }
                            className="rounded-md bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm ring-1 ring-slate-200 hover:bg-slate-100"
                          >
                            Copy
                          </button>

                        </div>

                        <div className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
                          {repurposedContent.instagram}
                        </div>

                      </div>

                      {/* X / Twitter */}
                      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">

                        <div className="mb-2 flex items-center justify-between">

                          <p className="text-sm font-semibold text-slate-800">
                            X / Twitter
                          </p>

                          <button
                            type="button"
                            onClick={() =>
                              handleCopy(
                                repurposedContent.twitter
                              )
                            }
                            className="rounded-md bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm ring-1 ring-slate-200 hover:bg-slate-100"
                          >
                            Copy
                          </button>

                        </div>

                        <div className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
                          {repurposedContent.twitter}
                        </div>

                      </div>

                      {/* Facebook */}
                      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">

                        <div className="mb-2 flex items-center justify-between">

                          <p className="text-sm font-semibold text-slate-800">
                            Facebook
                          </p>

                          <button
                            type="button"
                            onClick={() =>
                              handleCopy(
                                repurposedContent.facebook
                              )
                            }
                            className="rounded-md bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm ring-1 ring-slate-200 hover:bg-slate-100"
                          >
                            Copy
                          </button>

                        </div>

                        <div className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
                          {repurposedContent.facebook}
                        </div>

                      </div>

                    </div>

                  </div>
                )}

              {/* Date */}
              {post.createdAt && (
                <div className="border-t border-slate-100 pt-4 text-xs text-slate-400">
                  Created:{" "}
                  {new Date(
                    post.createdAt
                  ).toLocaleString()}
                </div>
              )}

            </div>

          ))}

        </div>
      )}

    </div>
  );
}