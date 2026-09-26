import { useEffect, useState } from "react";

import {
  LayoutDashboard,
  Sparkles,
  SearchCheck,
  CalendarDays,
  BarChart3,
  Settings as SettingsIcon,
  Bell,
  Plus,
  FileText,
  Clock,
  CheckCircle2,
} from "lucide-react";

import {
  BrowserRouter,
  Routes,
  Route,
  Link,
} from "react-router-dom";

import CreatePost from "./pages/CreatePost";
import Review from "./pages/Review";
import PostHistory from "./pages/PostHistory";
import Analytics from "./pages/Analytics";
import Calendar from "./pages/Calendar";
import Settings from "./pages/Settings";


function Dashboard() {

  const [posts, setPosts] = useState([]);

  useEffect(() => {

  const fetchPosts = async () => {

    try {

      const response = await fetch(
        "http://127.0.0.1:8000/api/posts"
      );

      if (!response.ok) {
        throw new Error("Failed to fetch posts");
      }

      const data = await response.json();

      setPosts(data);

    } catch (error) {

      console.error(
        "Dashboard posts error:",
        error
      );

    }

  };


  // Fetch immediately when Dashboard loads
  fetchPosts();


  // Refresh whenever the user returns to the Dashboard
  const handleFocus = () => {
    fetchPosts();
  };

  window.addEventListener(
    "focus",
    handleFocus
  );


  return () => {

    window.removeEventListener(
      "focus",
      handleFocus
    );

  };

}, []);

  // ==========================================
  // DASHBOARD STATISTICS
  // ==========================================

  const totalPosts = posts.length;

  const scheduledPosts = posts.filter(
    (post) =>
      post.status === "scheduled"
  ).length;

  const reviewedPosts = posts.filter(
    (post) =>
      post.reviewScore !== null &&
      post.reviewScore !== undefined
  ).length;

  const underReviewPosts =
    totalPosts - reviewedPosts;

  const aiGeneratedPosts = posts.filter(
    (post) => post.content
  ).length;

  const publishedPosts = posts.filter(
    (post) =>
      post.status === "published"
  ).length;


  // ==========================================
  // SIDEBAR MENU
  // ==========================================

  const menuItems = [
    {
      name: "Dashboard",
      icon: LayoutDashboard,
      path: "/",
    },
    {
      name: "Create Post",
      icon: Sparkles,
      path: "/create",
    },
    {
      name: "Review",
      icon: SearchCheck,
      path: "/review",
    },
    {
      name: "Post History",
      icon: FileText,
      path: "/history",
    },
    {
      name: "Calendar",
      icon: CalendarDays,
      path: "/calendar",
    },
    {
      name: "Analytics",
      icon: BarChart3,
      path: "/analytics",
    },
    {
      name: "Settings",
      icon: SettingsIcon,
      path: "/settings",
    },
  ];


  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">

      {/* ==========================================
          SIDEBAR
      ========================================== */}

      <aside className="w-64 border-r border-slate-200 bg-white px-4 py-6">

        {/* Logo */}

        <div className="mb-8 flex items-center gap-3 px-3">

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">

            <Sparkles size={20} />

          </div>

          <div>

            <h1 className="text-lg font-bold">
              Social Agent
            </h1>

            <p className="text-xs text-slate-500">
              AI Content Manager
            </p>

          </div>

        </div>


        {/* Navigation */}

        <nav className="space-y-2">

          {menuItems.map((item) => {

            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                to={item.path}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
              >

                <Icon size={19} />

                {item.name}

              </Link>
            );

          })}

        </nav>

      </aside>


      {/* ==========================================
          MAIN CONTENT
      ========================================== */}

      <main className="flex-1">

        {/* Header */}

        <header className="flex h-20 items-center justify-between border-b border-slate-200 bg-white px-8">

          <div>

            <h2 className="text-xl font-bold">
              Dashboard
            </h2>

            <p className="text-sm text-slate-500">
              Manage your AI-powered social content
            </p>

          </div>


          <div className="flex items-center gap-4">

            {/* Notification */}

            <button
              type="button"
              className="rounded-xl p-2.5 text-slate-500 hover:bg-slate-100"
            >

              <Bell size={20} />

            </button>


            {/* Profile */}

            <div className="flex items-center gap-3 border-l border-slate-200 pl-4">

              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">

                T

              </div>

              <div>

                <p className="text-sm font-semibold">
                  Toufik
                </p>

                <p className="text-xs text-slate-500">
                  Creator
                </p>

              </div>

            </div>

          </div>

        </header>


        {/* ==========================================
            DASHBOARD CONTENT
        ========================================== */}

        <section className="p-8">

          {/* Welcome */}

          <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">

            <div>

              <h3 className="text-2xl font-bold">
                Welcome back, Toufik 👋
              </h3>

              <p className="mt-1 text-slate-500">
                Create, review and manage your social media content with AI.
              </p>

            </div>


            <Link
              to="/create"
              className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
            >

              <Plus size={18} />

              Create Post

            </Link>

          </div>


          {/* ==========================================
              STATISTICS
          ========================================== */}

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">

            <StatCard
              title="Total Posts"
              value={totalPosts}
              description="Posts created"
              icon={FileText}
            />

            <StatCard
              title="Scheduled"
              value={scheduledPosts}
              description="Upcoming posts"
              icon={Clock}
            />

            <StatCard
              title="Under Review"
              value={underReviewPosts}
              description="Waiting for review"
              icon={SearchCheck}
            />

            <StatCard
              title="AI Generated"
              value={aiGeneratedPosts}
              description="Generated by AI"
              icon={Sparkles}
            />

            <StatCard
              title="Published"
              value={publishedPosts}
              description="Posts published successfully"
              icon={CheckCircle2}
            />

          </div>


          {/* ==========================================
              RECENT POSTS + AI ASSISTANT
          ========================================== */}

          <div className="mt-8 grid gap-6 lg:grid-cols-3">

            {/* ==========================================
                RECENT POSTS
            ========================================== */}

            <div className="rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-2">

              <div className="flex items-center justify-between">

                <div>

                  <h4 className="font-semibold">
                    Recent Posts
                  </h4>

                  <p className="mt-1 text-sm text-slate-500">
                    Your latest content
                  </p>

                </div>

              </div>


              {posts.length === 0 ? (

                <div className="mt-8 flex min-h-48 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50">

                  <div className="text-center">

                    <FileText
                      size={32}
                      className="mx-auto text-slate-400"
                    />

                    <p className="mt-3 font-medium text-slate-600">
                      No posts yet
                    </p>

                    <p className="mt-1 text-sm text-slate-400">
                      Create your first AI-powered post.
                    </p>

                  </div>

                </div>

              ) : (

                <div className="mt-6 space-y-3">

                  {posts
                    .slice(0, 5)
                    .map((post) => (

                      <div
                        key={post.id}
                        className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                      >

                        <div className="flex items-start justify-between gap-4">

                          <div>

                            <p className="text-sm font-semibold text-slate-800">
                              Post #{post.id}
                            </p>

                            <p className="mt-1 text-sm text-slate-600">
                              {post.topic ||
                                "Social Media Post"}
                            </p>

                          </div>


                          {/* ==========================================
                              POST STATUS
                          ========================================== */}

                          {post.status === "published" ? (

                            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">

                              Published

                            </span>

                          ) : post.status === "scheduled" ? (

                            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">

                              Scheduled

                            </span>

                          ) : post.approved ? (

                            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">

                              Approved

                            </span>

                          ) : (

                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">

                              In Progress

                            </span>

                          )}

                        </div>


                        {/* ==========================================
                            SCHEDULED DATE
                        ========================================== */}

                        {post.status === "scheduled" &&
                          post.scheduledAt && (

                            <div className="mt-3 flex items-center gap-2 text-xs font-medium text-blue-600">

                              <Clock size={14} />

                              Scheduled for{" "}

                              {new Date(
                                post.scheduledAt
                              ).toLocaleString()}

                            </div>

                          )}


                        {/* ==========================================
                            PUBLISHED DATE
                        ========================================== */}

                        {post.status === "published" &&
                          post.publishedAt && (

                            <div className="mt-3 flex items-center gap-2 text-xs font-medium text-emerald-600">

                              <CheckCircle2 size={14} />

                              Published on{" "}

                              {new Date(
                                post.publishedAt
                              ).toLocaleString()}

                            </div>

                          )}

                      </div>

                    ))}

                </div>

              )}

            </div>


            {/* ==========================================
                AI ASSISTANT
            ========================================== */}

            <div className="rounded-2xl bg-slate-900 p-6 text-white">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">

                <Sparkles size={22} />

              </div>

              <h4 className="mt-5 text-lg font-semibold">
                AI Content Assistant
              </h4>

              <p className="mt-2 text-sm leading-6 text-slate-300">
                Generate engaging social media content, review your drafts,
                and improve them using AI.
              </p>

              <Link
                to="/create"
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-100"
              >

                <Sparkles size={17} />

                Generate Content

              </Link>

            </div>

          </div>

        </section>

      </main>

    </div>
  );
}


/* ==========================================
   STAT CARD
========================================== */

function StatCard({
  title,
  value,
  description,
  icon: Icon,
}) {

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">

      <div className="flex items-start justify-between">

        <div>

          <p className="text-sm text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-3xl font-bold">
            {value}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            {description}
          </p>

        </div>


        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">

          <Icon
            size={19}
            className="text-slate-700"
          />

        </div>

      </div>

    </div>
  );
}


/* ==========================================
   APP ROUTES
========================================== */

function App() {

  return (
    <BrowserRouter>

      <Routes>

        <Route
          path="/"
          element={<Dashboard />}
        />

        <Route
          path="/create"
          element={<CreatePost />}
        />

        <Route
          path="/review"
          element={<Review />}
        />

        <Route
          path="/history"
          element={<PostHistory />}
        />

        <Route
          path="/calendar"
          element={<Calendar />}
        />

        <Route
          path="/analytics"
          element={<Analytics />}
        />

        <Route
          path="/settings"
          element={<Settings />}
        />

      </Routes>

    </BrowserRouter>
  );
}


export default App;