
import { useEffect, useState } from "react";
import {
  BarChart3,
  FileText,
  CheckCircle2,
  Star,
  RefreshCw,
} from "lucide-react";

export default function Analytics() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        "http://127.0.0.1:8000/api/posts"
      );

      if (!response.ok) {
        throw new Error("Failed to fetch analytics data");
      }

      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error("Analytics error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const totalPosts = posts.length;

  const approvedPosts = posts.filter(
    (post) => post.approved
  ).length;

  const reviewedPosts = posts.filter(
    (post) =>
      post.reviewScore !== null &&
      post.reviewScore !== undefined
  ).length;

  const scores = posts
    .filter(
      (post) =>
        post.reviewScore !== null &&
        post.reviewScore !== undefined
    )
    .map((post) => Number(post.reviewScore));

  const averageScore =
    scores.length > 0
      ? (
          scores.reduce((sum, score) => sum + score, 0) /
          scores.length
        ).toFixed(1)
      : "0.0";

  return (
    <div className="min-h-screen bg-slate-50 p-6">

      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Analytics
          </h1>

          <p className="mt-1 text-slate-500">
            Analyze your AI-generated social media content.
          </p>
        </div>

        <button
          onClick={fetchPosts}
          className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
          <p className="text-slate-500">
            Loading analytics...
          </p>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                <FileText className="h-5 w-5 text-slate-600" />
              </div>

              <p className="text-sm text-slate-500">
                Total Posts
              </p>

              <p className="mt-1 text-3xl font-bold text-slate-900">
                {totalPosts}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-green-50">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>

              <p className="text-sm text-slate-500">
                Approved Posts
              </p>

              <p className="mt-1 text-3xl font-bold text-slate-900">
                {approvedPosts}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                <BarChart3 className="h-5 w-5 text-blue-600" />
              </div>

              <p className="text-sm text-slate-500">
                Reviewed Posts
              </p>

              <p className="mt-1 text-3xl font-bold text-slate-900">
                {reviewedPosts}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50">
                <Star className="h-5 w-5 text-amber-500" />
              </div>

              <p className="text-sm text-slate-500">
                Average AI Score
              </p>

              <p className="mt-1 text-3xl font-bold text-slate-900">
                {averageScore}/10
              </p>
            </div>

          </div>

          {/* Review Performance */}
          <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                <BarChart3 className="h-5 w-5 text-slate-600" />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  AI Review Performance
                </h2>

                <p className="text-sm text-slate-500">
                  Review scores for your generated posts.
                </p>
              </div>
            </div>

            {scores.length === 0 ? (
              <div className="rounded-lg bg-slate-50 p-8 text-center">
                <p className="text-sm text-slate-500">
                  No reviewed posts available yet.
                </p>
              </div>
            ) : (
              <div className="space-y-4">

                {posts
                  .filter(
                    (post) =>
                      post.reviewScore !== null &&
                      post.reviewScore !== undefined
                  )
                  .map((post) => (
                    <div key={post.id}>

                      <div className="mb-2 flex items-center justify-between">
                        <div>
                          <span className="text-sm font-medium text-slate-700">
                            Post #{post.id}
                          </span>

                          {post.topic && (
                            <span className="ml-2 text-xs text-slate-400">
                              {post.topic}
                            </span>
                          )}
                        </div>

                        <span className="text-sm font-semibold text-slate-700">
                          {post.reviewScore}/10
                        </span>
                      </div>

                      <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-slate-700"
                          style={{
                            width: `${Math.min(
                              Number(post.reviewScore) * 10,
                              100
                            )}%`,
                          }}
                        />
                      </div>

                    </div>
                  ))}

              </div>
            )}

          </div>

          {/* Summary */}
          <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

            <h2 className="mb-4 text-lg font-semibold text-slate-900">
              Content Summary
            </h2>

            <div className="grid gap-4 md:grid-cols-3">

              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-sm text-slate-500">
                  Approval Rate
                </p>

                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {totalPosts > 0
                    ? Math.round(
                        (approvedPosts / totalPosts) * 100
                      )
                    : 0}
                  %
                </p>
              </div>

              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-sm text-slate-500">
                  Review Rate
                </p>

                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {totalPosts > 0
                    ? Math.round(
                        (reviewedPosts / totalPosts) * 100
                      )
                    : 0}
                  %
                </p>
              </div>

              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-sm text-slate-500">
                  Posts with AI Content
                </p>

                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {posts.filter((post) => post.content).length}
                </p>
              </div>

            </div>

          </div>
        </>
      )}

    </div>
  );
}

