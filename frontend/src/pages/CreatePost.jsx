import { useState } from "react";
import {
  Sparkles,
  Copy,
  Check,
  Star,
  MessageSquareText,
  Lightbulb,
} from "lucide-react";

function CreatePost() {
  const [formData, setFormData] = useState({
    platform: "LinkedIn",
    topic: "",
    contentType: "Educational Post",
    tone: "Professional",
    audience: "",
    instructions: "",
  });

  const [generatedPost, setGeneratedPost] = useState("");
  const [postId, setPostId] = useState(null);

  // ==========================================
  // REVIEW DATA
  // ==========================================

  const [reviewScore, setReviewScore] = useState(null);
  const [reviewFeedback, setReviewFeedback] = useState("");
  const [reviewSuggestions, setReviewSuggestions] = useState([]);
  const [workflow, setWorkflow] = useState(null);
const [improvedContent, setImprovedContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // ==========================================
  // HANDLE INPUT CHANGES
  // ==========================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ==========================================
  // GENERATE + REVIEW POST
  // ==========================================

  const handleGenerate = async () => {
    if (!formData.topic.trim()) {
      alert("Please enter a topic.");
      return;
    }

    if (!formData.audience.trim()) {
      alert("Please enter a target audience.");
      return;
    }

    setLoading(true);

    setGeneratedPost("");
    setPostId(null);

    setReviewScore(null);
    setReviewFeedback("");
    setReviewSuggestions([]);
    setWorkflow(null);
    setImprovedContent("");

    setCopied(false);

    try {
      // ==========================================
      // GET BRAND SETTINGS
      // ==========================================

      const savedBrandSettings =
        localStorage.getItem("brandSettings");

      const brandSettings = savedBrandSettings
        ? JSON.parse(savedBrandSettings)
        : {};

      // ==========================================
      // PREPARE REQUEST
      // ==========================================

      const requestData = {
        ...formData,
        brandSettings,
      };

      console.log(
        "Sending Orchestrator request:",
        requestData
      );

      // ==========================================
      // CALL ORCHESTRATOR
      // ==========================================

      const response = await fetch(
        "http://127.0.0.1:8000/api/orchestrate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestData),
        }
      );

      const data = await response.json();

      console.log(
        "Orchestrator response:",
        data
      );

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Orchestrator workflow failed."
        );
      }

      // ==========================================
      // SAVE GENERATED POST
      // ==========================================

      const content =
        data.post?.content || "";

      setGeneratedPost(content);

      // ==========================================
      // SAVE POST ID
      // ==========================================

      const id =
        data.post_id ||
        data.post?.id ||
        null;

      setPostId(id);

      // ==========================================
      // SAVE REVIEW SCORE
      // ==========================================

      setReviewScore(
        data.post?.reviewScore ?? null
      );

      // ==========================================
      // SAVE REVIEW FEEDBACK
      // ==========================================

      setReviewFeedback(
        data.post?.reviewFeedback || ""
      );

      // ==========================================
      // SAVE REVIEW SUGGESTIONS
      // ==========================================

      setReviewSuggestions(
        Array.isArray(
          data.post?.reviewSuggestions
        )
          ? data.post.reviewSuggestions
          : []
      );
      // ==========================================
// SAVE ORCHESTRATOR WORKFLOW
// ==========================================

setWorkflow(data.workflow || null);

// ==========================================
// SAVE IMPROVED CONTENT
// ==========================================

setImprovedContent(
  data.post?.improvedContent || ""
);
      // ==========================================
      // SAVE CURRENT POST FOR REVIEW PAGE
      // ==========================================

      if (id) {
        localStorage.setItem(
          "currentPostId",
          id
        );
      }

      if (content) {
        localStorage.setItem(
          "currentPostContent",
          content
        );
      }

      // ==========================================
      // SAVE COMPLETE ORCHESTRATOR RESULT
      // ==========================================

      localStorage.setItem(
        "currentPostResult",
        JSON.stringify(data)
      );

    } catch (error) {
      console.error(
        "Orchestrator error:",
        error
      );

      alert(
        error.message ||
          "Something went wrong."
      );

    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // COPY POST
  // ==========================================

  const handleCopy = async () => {
    if (!generatedPost) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        generatedPost
      );

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);

    } catch (error) {
      console.error(
        "Copy error:",
        error
      );
    }
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

              <Sparkles className="h-6 w-6 text-indigo-600" />

            </div>

            <div>

              <h1 className="text-3xl font-bold text-slate-900">
                Create Post
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Generate, review and improve social media content with AI.
              </p>

            </div>

          </div>

        </div>

        {/* ==========================================
            MAIN GRID
        ========================================== */}

        <div className="grid gap-6 lg:grid-cols-2">

          {/* ==========================================
              LEFT SIDE - FORM
          ========================================== */}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="mb-6">

              <h2 className="text-lg font-semibold text-slate-900">
                Post Details
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Tell the AI what kind of post you want to create.
              </p>

            </div>

            <div className="space-y-5">

              {/* PLATFORM */}

              <div>

                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Platform
                </label>

                <select
                  name="platform"
                  value={formData.platform}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                >

                  <option>LinkedIn</option>
                  <option>Instagram</option>
                  <option>Twitter/X</option>
                  <option>Facebook</option>

                </select>

              </div>

              {/* TOPIC */}

              <div>

                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Topic
                </label>

                <input
                  type="text"
                  name="topic"
                  value={formData.topic}
                  onChange={handleChange}
                  placeholder="e.g. Artificial Intelligence in Healthcare"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                />

              </div>

              {/* CONTENT TYPE */}

              <div>

                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Content Type
                </label>

                <select
                  name="contentType"
                  value={formData.contentType}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                >

                  <option>Educational Post</option>
                  <option>Promotional Post</option>
                  <option>Question / Discussion</option>
                  <option>Storytelling</option>
                  <option>Announcement</option>
                  <option>Tips / List</option>

                </select>

              </div>

              {/* TONE */}

              <div>

                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Tone
                </label>

                <select
                  name="tone"
                  value={formData.tone}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                >

                  <option>Professional</option>
                  <option>Friendly</option>
                  <option>Educational</option>
                  <option>Casual</option>
                  <option>Inspirational</option>

                </select>

              </div>

              {/* AUDIENCE */}

              <div>

                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Target Audience
                </label>

                <input
                  type="text"
                  name="audience"
                  value={formData.audience}
                  onChange={handleChange}
                  placeholder="e.g. Technology professionals"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                />

              </div>

              {/* INSTRUCTIONS */}

              <div>

                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Additional Instructions
                </label>

                <textarea
                  name="instructions"
                  value={formData.instructions}
                  onChange={handleChange}
                  placeholder="Any specific instructions..."
                  className="h-28 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                />

              </div>

              {/* GENERATE */}

              <button
                onClick={handleGenerate}
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >

                <Sparkles className="h-5 w-5" />

                {loading
                  ? "AI Agents Working..."
                  : "Generate & Review"}

              </button>

            </div>

          </div>

          {/* ==========================================
              RIGHT SIDE - AI RESULT
          ========================================== */}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="mb-5 flex items-start justify-between">

              <div>

                <h2 className="text-lg font-semibold text-slate-900">
                  AI Result
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Generated content and AI review.
                </p>

              </div>

              {generatedPost && (

                <button
                  onClick={handleCopy}
                  className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >

                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}

                  {copied
                    ? "Copied"
                    : "Copy"}

                </button>

              )}

            </div>

            {!generatedPost ? (

              <div className="flex h-[500px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-center">

                <div>

                  <Sparkles className="mx-auto mb-3 h-10 w-10 text-slate-300" />

                  <p className="font-medium text-slate-500">
                    No post generated yet
                  </p>

                  <p className="mt-1 text-sm text-slate-400">
                    Fill in the details and run the AI agents.
                  </p>

                </div>

              </div>

            ) : (

              <div className="space-y-5">

                {/* ==========================================
                    POST ID
                ========================================== */}

                <div className="flex items-center justify-between rounded-lg bg-indigo-50 px-4 py-3">

                  <span className="text-sm font-medium text-indigo-700">
                    Saved Post ID
                  </span>

                  <span className="font-bold text-indigo-700">
                    #{postId}
                  </span>

                </div>

                {/* ==========================================
                    GENERATED CONTENT
                ========================================== */}

                <div>

                  <div className="mb-2 flex items-center gap-2">

                    <Sparkles className="h-4 w-4 text-indigo-600" />

                    <h3 className="font-semibold text-slate-800">
                      Generated Content
                    </h3>

                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">

                    <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">
                      {generatedPost}
                    </p>

                  </div>

                </div>
                {/* ==========================================
    IMPROVED CONTENT
========================================== */}

{improvedContent && (

  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">

    <div className="mb-3 flex items-center gap-2">

      <Sparkles className="h-5 w-5 text-emerald-600" />

      <h3 className="font-semibold text-slate-800">
        Improved Content
      </h3>

    </div>

    <div className="rounded-xl border border-emerald-100 bg-white p-4">

      <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">
        {improvedContent}
      </p>

    </div>

  </div>

)}

                {/* ==========================================
                    REVIEW SCORE
                ========================================== */}

                {reviewScore !== null && (

                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">

                    <div className="flex items-center justify-between">

                      <div className="flex items-center gap-2">

                        <Star className="h-5 w-5 fill-amber-400 text-amber-500" />

                        <span className="font-semibold text-slate-800">
                          AI Review Score
                        </span>

                      </div>

                      <span className="text-xl font-bold text-amber-600">
                        {reviewScore}/10
                      </span>

                    </div>

                  </div>

                )}

                {/* ==========================================
                    REVIEW FEEDBACK
                ========================================== */}

                {reviewFeedback && (

                  <div className="rounded-xl border border-slate-200 bg-white p-4">

                    <div className="mb-2 flex items-center gap-2">

                      <MessageSquareText className="h-5 w-5 text-indigo-600" />

                      <h3 className="font-semibold text-slate-800">
                        Review Feedback
                      </h3>

                    </div>

                    <p className="text-sm leading-6 text-slate-600">
                      {reviewFeedback}
                    </p>

                  </div>

                )}

                {/* ==========================================
                    REVIEW SUGGESTIONS
                ========================================== */}

                {reviewSuggestions.length > 0 && (

                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">

                    <div className="mb-3 flex items-center gap-2">

                      <Lightbulb className="h-5 w-5 text-emerald-600" />

                      <h3 className="font-semibold text-slate-800">
                        AI Suggestions
                      </h3>

                    </div>

                    <div className="space-y-2">

                      {reviewSuggestions.map(
                        (suggestion, index) => (

                          <div
                            key={index}
                            className="flex gap-3 rounded-lg bg-white p-3"
                          >

                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
                              {index + 1}
                            </span>

                            <p className="text-sm leading-6 text-slate-600">
                              {suggestion}
                            </p>

                          </div>

                        )
                      )}

                    </div>

                  </div>

                )}

                {/* ==========================================
    ORCHESTRATOR WORKFLOW
========================================== */}

<div className="rounded-xl border border-slate-200 bg-slate-50 p-4">

  <h3 className="mb-3 text-sm font-semibold text-slate-800">
    Agent Workflow
  </h3>

  <div className="space-y-3">

    {/* CONTENT AGENT */}

    <div className="flex items-center justify-between">

      <span className="text-slate-600">
        Content Agent
      </span>

      <span className="font-medium text-emerald-600">
        ✓ Completed
      </span>

    </div>


    {/* REVIEW AGENT */}

    <div className="flex items-center justify-between">

      <span className="text-slate-600">
        Review Agent
      </span>

      <span className="font-medium text-emerald-600">
        ✓ Completed
      </span>

    </div>


    {/* QUALITY DECISION */}

    {workflow?.quality_decision && (

      <div className="flex items-center justify-between">

        <span className="text-slate-600">
          Quality Decision
        </span>

        {workflow.quality_decision === "good" ? (

          <span className="font-medium text-emerald-600">
            ✓ Good
          </span>

        ) : (

          <span className="font-medium text-amber-600">
            ⚠ Needs Improvement
          </span>

        )}

      </div>

    )}


    {/* IMPROVE AGENT */}

    {workflow?.improve_agent && (

      <div className="flex items-center justify-between">

        <span className="text-slate-600">
          Improve Agent
        </span>

        {workflow.improve_agent === "completed" ? (

          <span className="font-medium text-emerald-600">
            ✓ Completed
          </span>

        ) : (

          <span className="font-medium text-slate-500">
            ⏭ Not Required
          </span>

        )}

      </div>

    )}


    {/* APPROVAL */}

    <div className="flex items-center justify-between">

      <span className="text-slate-600">
        Approval
      </span>

      <span className="font-medium text-amber-600">
        ⏳ Waiting
      </span>

    </div>


    {/* REPURPOSE AGENT */}

    <div className="flex items-center justify-between">

      <span className="text-slate-600">
        Repurpose Agent
      </span>

      <span className="font-medium text-slate-500">
        ⏳ Waiting
      </span>

    </div>


    {/* PUBLISHING */}

    <div className="flex items-center justify-between">

      <span className="text-slate-600">
        Schedule / Publish
      </span>

      <span className="font-medium text-slate-500">
        ⏳ Waiting
      </span>

    </div>

  </div>

</div>

              </div>

            )}

          </div>

        </div>

      </div>

    </div>
  );
}

export default CreatePost;