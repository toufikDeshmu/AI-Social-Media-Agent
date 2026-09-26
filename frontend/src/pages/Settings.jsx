import { useState } from "react";
import {
  Settings as SettingsIcon,
  Save,
  CheckCircle2,
} from "lucide-react";

export default function Settings() {
  const [saved, setSaved] = useState(false);

  const [brandName, setBrandName] = useState("");
  const [description, setDescription] = useState("");
  const [audience, setAudience] = useState("");
  const [tone, setTone] = useState("Professional");
  const [style, setStyle] = useState("");
  const [avoid, setAvoid] = useState("");

  const handleSave = () => {
    const brandSettings = {
      brandName,
      description,
      audience,
      tone,
      style,
      avoid,
    };

    localStorage.setItem(
      "brandSettings",
      JSON.stringify(brandSettings)
    );

    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">

      {/* Header */}
      <div className="mb-8">

        <div className="flex items-center gap-3">

          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-900">
            <SettingsIcon className="h-5 w-5 text-white" />
          </div>

          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Settings
            </h1>

            <p className="mt-1 text-slate-500">
              Configure your AI content and brand preferences.
            </p>
          </div>

        </div>

      </div>

      {/* Settings Card */}
      <div className="max-w-4xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

        <div className="mb-6">

          <h2 className="text-lg font-semibold text-slate-900">
            Brand Voice
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            These preferences will guide your AI when generating
            social media content.
          </p>

        </div>

        <div className="space-y-6">

          {/* Brand Name */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Brand Name
            </label>

            <input
              type="text"
              value={brandName}
              onChange={(e) =>
                setBrandName(e.target.value)
              }
              placeholder="e.g. VisionCraft"
              className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400"
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Brand Description
            </label>

            <textarea
              value={description}
              onChange={(e) =>
                setDescription(e.target.value)
              }
              placeholder="Describe your brand, product or organization..."
              rows={3}
              className="w-full resize-none rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400"
            />
          </div>

          {/* Audience */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Target Audience
            </label>

            <input
              type="text"
              value={audience}
              onChange={(e) =>
                setAudience(e.target.value)
              }
              placeholder="e.g. Students, developers and technology professionals"
              className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400"
            />
          </div>

          {/* Tone */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Preferred Tone
            </label>

            <select
              value={tone}
              onChange={(e) =>
                setTone(e.target.value)
              }
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400"
            >
              <option>Professional</option>
              <option>Friendly</option>
              <option>Casual</option>
              <option>Inspirational</option>
              <option>Educational</option>
              <option>Professional + Friendly</option>
            </select>
          </div>

          {/* Writing Style */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Writing Style
            </label>

            <textarea
              value={style}
              onChange={(e) =>
                setStyle(e.target.value)
              }
              placeholder="e.g. Clear, concise, informative and easy to understand"
              rows={3}
              className="w-full resize-none rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400"
            />
          </div>

          {/* Avoid */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Things to Avoid
            </label>

            <textarea
              value={avoid}
              onChange={(e) =>
                setAvoid(e.target.value)
              }
              placeholder="e.g. Excessive emojis, complicated terminology, unsupported claims"
              rows={3}
              className="w-full resize-none rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400"
            />
          </div>

        </div>

        {/* Save */}
        <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-6">

          {saved ? (
            <div className="flex items-center gap-2 text-sm font-medium text-green-600">
              <CheckCircle2 className="h-4 w-4" />
              Settings saved successfully
            </div>
          ) : (
            <p className="text-sm text-slate-400">
              Your settings are stored locally.
            </p>
          )}

          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            <Save className="h-4 w-4" />
            Save Settings
          </button>

        </div>

      </div>

    </div>
  );
}