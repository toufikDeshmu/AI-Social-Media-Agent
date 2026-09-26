import { useEffect, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  X,
} from "lucide-react";

export default function Calendar() {
  const [posts, setPosts] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);

  const [showSchedule, setShowSchedule] = useState(false);
  const [selectedPost, setSelectedPost] = useState("");
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [scheduling, setScheduling] = useState(false);

  // ==========================================
  // FETCH POSTS
  // ==========================================

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
    } catch (error) {
      console.error("Calendar error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // ==========================================
  // CALENDAR DATE LOGIC
  // ==========================================

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(
    year,
    month,
    1
  ).getDay();

  const daysInMonth = new Date(
    year,
    month + 1,
    0
  ).getDate();

  const previousMonth = () => {
    setCurrentDate(
      new Date(year, month - 1, 1)
    );
  };

  const nextMonth = () => {
    setCurrentDate(
      new Date(year, month + 1, 1)
    );
  };

  const today = () => {
    setCurrentDate(new Date());
  };

  const monthName = currentDate.toLocaleString(
    "default",
    {
      month: "long",
      year: "numeric",
    }
  );

  // ==========================================
  // GET POSTS FOR SPECIFIC DAY
  // ==========================================

  const getPostsForDay = (day) => {
    return posts.filter((post) => {
      if (!post.scheduledAt) {
        return false;
      }

      const scheduledDate = new Date(
        post.scheduledAt
      );

      return (
        scheduledDate.getFullYear() === year &&
        scheduledDate.getMonth() === month &&
        scheduledDate.getDate() === day
      );
    });
  };

  // ==========================================
  // CREATE CALENDAR DAYS
  // ==========================================

  const calendarDays = [];

  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }

  for (
    let day = 1;
    day <= daysInMonth;
    day++
  ) {
    calendarDays.push(day);
  }

  // ==========================================
  // APPROVED POSTS AVAILABLE FOR SCHEDULING
  // ==========================================

  const approvedPosts = posts.filter(
    (post) =>
      post.approved &&
      post.status !== "scheduled"
  );

  // ==========================================
  // CANCEL SCHEDULE
  // ==========================================

  const handleCancelSchedule = async (postId) => {
    console.log("CANCEL BUTTON CLICKED", postId);
    const confirmed = window.confirm(
      "Are you sure you want to cancel this scheduled post?"
    );

    if (!confirmed) {
      return;
    }

    try {
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
            "Failed to cancel schedule"
        );
      }

      alert(
        "Schedule cancelled successfully!"
      );

      await fetchPosts();
    } catch (error) {
      console.error(
        "Cancel schedule error:",
        error
      );

      alert(error.message);
    }
  };

  // ==========================================
  // SCHEDULE POST
  // ==========================================

  const handleSchedule = async () => {
    if (!selectedPost) {
      alert("Please select a post.");
      return;
    }

    if (!scheduleDate || !scheduleTime) {
      alert("Please select date and time.");
      return;
    }

    try {
      setScheduling(true);

      const response = await fetch(
        "http://127.0.0.1:8000/api/schedule-post",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            post_id: Number(selectedPost),
            scheduled_at:
              `${scheduleDate}T${scheduleTime}`,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Scheduling failed"
        );
      }

      alert(
        "Post scheduled successfully!"
      );

      setShowSchedule(false);
      setSelectedPost("");
      setScheduleDate("");
      setScheduleTime("");

      await fetchPosts();
    } catch (error) {
      console.error(
        "Scheduling error:",
        error
      );

      alert(error.message);
    } finally {
      setScheduling(false);
    }
  };

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="min-h-screen bg-slate-50 p-6">

      {/* HEADER */}

      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">

        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Calendar
          </h1>

          <p className="mt-1 text-slate-500">
            View and manage your scheduled social media posts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">

          <button
            onClick={() =>
              setShowSchedule(true)
            }
            className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            <CalendarDays size={17} />
            Schedule Post
          </button>

          <button
            onClick={today}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Today
          </button>

          <button
            onClick={previousMonth}
            className="rounded-lg border border-slate-200 bg-white p-2.5 text-slate-600 hover:bg-slate-50"
          >
            <ChevronLeft size={18} />
          </button>

          <button
            onClick={nextMonth}
            className="rounded-lg border border-slate-200 bg-white p-2.5 text-slate-600 hover:bg-slate-50"
          >
            <ChevronRight size={18} />
          </button>

        </div>
      </div>

      {/* CALENDAR */}

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">

        {/* CALENDAR HEADER */}

        <div className="flex items-center gap-3 border-b border-slate-200 p-5">

          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
            <CalendarDays
              size={20}
              className="text-slate-700"
            />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {monthName}
            </h2>

            <p className="text-sm text-slate-500">
              Scheduled content
            </p>
          </div>

        </div>

        {/* DAYS */}

        <div className="grid grid-cols-7 border-b border-slate-200">

          {[
            "Sun",
            "Mon",
            "Tue",
            "Wed",
            "Thu",
            "Fri",
            "Sat",
          ].map((day) => (
            <div
              key={day}
              className="p-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              {day}
            </div>
          ))}

        </div>

        {/* CALENDAR GRID */}

        {loading ? (
          <div className="p-12 text-center">
            <p className="text-slate-500">
              Loading calendar...
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-7">

            {calendarDays.map(
              (day, index) => {

                const dayPosts = day
                  ? getPostsForDay(day)
                  : [];

                const currentToday =
                  new Date();

                const isToday =
                  day &&
                  currentToday.getDate() ===
                    day &&
                  currentToday.getMonth() ===
                    month &&
                  currentToday.getFullYear() ===
                    year;

                return (
                  <div
                    key={index}
                    className="min-h-[130px] border-b border-r border-slate-100 p-2"
                  >

                    {day && (
                      <>
                        {/* DAY NUMBER */}

                        <div className="mb-2 flex justify-end">

                          <span
                            className={
                              isToday
                                ? "flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white"
                                : "flex h-7 w-7 items-center justify-center text-sm font-medium text-slate-600"
                            }
                          >
                            {day}
                          </span>

                        </div>

                        {/* POSTS */}

                        <div className="space-y-2">

                          {dayPosts.map(
                            (post) => (
                              <div
                                key={post.id}
                                className="rounded-lg border border-slate-200 bg-slate-50 p-2"
                              >

                                {/* POST HEADER */}

                                <div className="mb-1 flex items-center gap-1">

                                  {post.approved && (
                                    <CheckCircle2
                                      size={13}
                                      className="text-slate-600"
                                    />
                                  )}

                                  <span className="text-xs font-semibold text-slate-700">
                                    Post #{post.id}
                                  </span>

                                </div>

                                {/* POST CONTENT */}

                                <p className="line-clamp-2 text-xs text-slate-600">
                                  {post.topic ||
                                    post.content}
                                </p>

                                {/* TIME + STATUS + CANCEL */}

                                <div className="mt-2 flex items-center justify-between">

                                  <div className="flex items-center gap-1 text-xs text-slate-500">

                                    <Clock size={12} />

                                    {new Date(
                                      post.scheduledAt
                                    ).toLocaleTimeString(
                                      [],
                                      {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      }
                                    )}

                                  </div>

                                  <div className="flex items-center gap-2">

                                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                                      Scheduled
                                    </span>

                                    <button
  type="button"
  onClick={() => handleCancelSchedule(post.id)}
  className="rounded-md px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 hover:text-red-700"
>
  Cancel
</button>

                                  </div>

                                </div>

                              </div>
                            )
                          )}

                        </div>
                      </>
                    )}

                  </div>
                );
              }
            )}

          </div>
        )}

      </div>

      {/* EMPTY STATE */}

      {!loading &&
        posts.filter(
          (post) => post.scheduledAt
        ).length === 0 && (
          <div className="mt-6 rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">

            <CalendarDays
              size={36}
              className="mx-auto mb-3 text-slate-400"
            />

            <h2 className="text-lg font-semibold text-slate-900">
              No scheduled posts
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Your scheduled posts will appear on the calendar.
            </p>

          </div>
        )}

      {/* SCHEDULE MODAL */}

      {showSchedule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">

          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">

            {/* MODAL HEADER */}

            <div className="flex items-center justify-between border-b border-slate-200 p-5">

              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Schedule Post
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Choose an approved post and schedule it.
                </p>
              </div>

              <button
                onClick={() =>
                  setShowSchedule(false)
                }
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={20} />
              </button>

            </div>

            {/* FORM */}

            <div className="space-y-5 p-5">

              {/* POST */}

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Select Approved Post
                </label>

                <select
                  value={selectedPost}
                  onChange={(e) =>
                    setSelectedPost(
                      e.target.value
                    )
                  }
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-slate-400"
                >

                  <option value="">
                    Select a post
                  </option>

                  {approvedPosts.map(
                    (post) => (
                      <option
                        key={post.id}
                        value={post.id}
                      >
                        Post #{post.id} —{" "}
                        {post.topic ||
                          "Untitled Post"}
                      </option>
                    )
                  )}

                </select>

                {approvedPosts.length === 0 && (
                  <p className="mt-2 text-xs text-amber-600">
                    No approved posts are available for scheduling.
                  </p>
                )}

              </div>

              {/* DATE */}

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Date
                </label>

                <input
                  type="date"
                  value={scheduleDate}
                  onChange={(e) =>
                    setScheduleDate(
                      e.target.value
                    )
                  }
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-slate-400"
                />
              </div>

              {/* TIME */}

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Time
                </label>

                <input
                  type="time"
                  value={scheduleTime}
                  onChange={(e) =>
                    setScheduleTime(
                      e.target.value
                    )
                  }
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-slate-400"
                />
              </div>

            </div>

            {/* FOOTER */}

            <div className="flex justify-end gap-3 border-t border-slate-200 p-5">

              <button
                onClick={() =>
                  setShowSchedule(false)
                }
                className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                onClick={handleSchedule}
                disabled={scheduling}
                className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {scheduling
                  ? "Scheduling..."
                  : "Schedule Post"}
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}
