import { useEffect, useState } from "react";
import { usePortfolioContent } from "@/hooks/usePortfolioContent";
import { supabase } from "@/utils/superbase";
import { uploadImage } from "@/services/portfolioContent";

const arrayItemTemplates = {
  "navigation.links": { href: "#", label: "New link" },
  "hero.socials": { platform: "github", url: "#" },
  "about.highlights": { icon: "code", title: "New highlight", description: "" },
  "projectsSection.projects": {
    title: "New project",
    description: "",
    image: "",
    tags: [],
    link: "#",
    github: "#",
  },
  "experienceSection.items": {
    period: "",
    role: "",
    company: "",
    description: "",
    technologies: [],
    current: false,
  },
  "testimonialsSection.items": { quote: "", author: "", role: "", avatar: "" },
  "contact.details": { icon: "mail", label: "New detail", value: "", href: "" },
  "footer.links": { href: "#", label: "New link" },
  "footer.socials": { platform: "github", url: "#", label: "GitHub" },
};

const formatLabel = (value) =>
  value.replace(/([A-Z])/g, " $1").replace(/^./, (letter) => letter.toUpperCase());

const clone = (value) => JSON.parse(JSON.stringify(value));

function ImageUploadField({ value, onChange }) {
  const [uploadStatus, setUploadStatus] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadStatus("Uploading...");
    try {
      const newUrl = await uploadImage(file, value);
      onChange(newUrl);
      setUploadStatus(`Success! New URL: ${newUrl}`);
    } catch (error) {
      setUploadStatus(`Upload failed: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        {value && <img src={value} alt="Preview" className="h-16 w-16 rounded-lg border border-border object-cover" />}
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Enter image URL or upload a new one"
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
        />
      </div>
      <div>
        <label className="block w-full cursor-pointer rounded-lg border border-dashed border-border px-3 py-2 text-center text-sm hover:border-primary">
          {isUploading ? "Uploading..." : "Upload New Image"}
          <input type="file" accept="image/*" onChange={handleFileSelect} disabled={isUploading} className="sr-only" />
        </label>
        {uploadStatus && <p className="mt-2 text-xs text-muted-foreground">{uploadStatus}</p>}
      </div>
    </div>
  );
}

function EditorField({ label, value, onChange, path }) {
  if (typeof value === "boolean") {
    return (
      <label className="flex items-center gap-3 rounded-lg border border-border bg-background p-3 text-sm">
        <input
          type="checkbox"
          checked={value}
          onChange={(event) => onChange(event.target.checked)}
          className="h-4 w-4 accent-primary"
        />
        {formatLabel(label)}
      </label>
    );
  }

  const isImageField = /(image|avatar|logo|backgroundImage)/i.test(path);
  if (isImageField) {
    return (
      <label className="block space-y-2">
        <span className="text-sm font-medium text-foreground">{formatLabel(label)}</span>
        <ImageUploadField value={value} onChange={onChange} />
      </label>
    );
  }

  const isLongText =
    value.length > 70 || /(description|introduction|quote|mission|paragraph)/i.test(path);

  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-foreground">{formatLabel(label)}</span>
      {isLongText ? (
        <textarea
          rows={4}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
        />
      )}
    </label>
  );
}

function ContentEditor({ value, path, update }) {
  if (typeof value !== "object" || value === null) {
    return <EditorField label={path.split(".").at(-1)} value={value} path={path} onChange={update} />;
  }

  if (Array.isArray(value)) {
    const addItem = () => {
      const item = arrayItemTemplates[path] ? clone(arrayItemTemplates[path]) : "";
      update([...value, item]);
    };

    return (
      <div className="space-y-4">
        {value.map((item, index) => (
          <div key={`${path}-${index}`} className="rounded-xl border border-border bg-surface/40 p-4">
            <div className="mb-4 flex items-center justify-between gap-4">
              <h4 className="font-medium">{formatLabel(path.split(".").at(-1))} #{index + 1}</h4>
              <button
                type="button"
                onClick={() => update(value.filter((_, itemIndex) => itemIndex !== index))}
                className="rounded-lg border border-red-500/40 px-3 py-1.5 text-sm text-red-300 hover:bg-red-500/10"
              >
                Remove
              </button>
            </div>
            <ContentEditor
              value={item}
              path={`${path}.${index}`}
              update={(nextItem) => update(value.map((current, itemIndex) => (itemIndex === index ? nextItem : current)))}
            />
          </div>
        ))}
        <button
          type="button"
          onClick={addItem}
          className="rounded-lg border border-primary/50 px-4 py-2 text-sm text-primary hover:bg-primary/10"
        >
          Add {formatLabel(path.split(".").at(-1)).replace(/s$/, "")}
        </button>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {Object.entries(value).map(([key, child]) => (
        <div key={key} className={typeof child === "object" && child !== null ? "md:col-span-2" : ""}>
          {typeof child === "object" && child !== null ? (
            <fieldset className="space-y-4 rounded-xl border border-border p-4">
              <legend className="px-2 text-base font-semibold">{formatLabel(key)}</legend>
              <ContentEditor
                value={child}
                path={`${path}.${key}`}
                update={(nextChild) => update({ ...value, [key]: nextChild })}
              />
            </fieldset>
          ) : (
            <EditorField
              label={key}
              value={child}
              path={`${path}.${key}`}
              onChange={(nextChild) => update({ ...value, [key]: nextChild })}
            />
          )}
        </div>
      ))}
    </div>
  );
}

const AdminLogin = ({ onSubmit, status }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4 text-foreground">
      <form onSubmit={(event) => onSubmit(event, email, password)} className="glass w-full max-w-md space-y-5 rounded-2xl p-7">
        <div>
          <p className="text-sm font-medium uppercase tracking-wider text-primary">Portfolio editor</p>
          <h1 className="mt-2 text-3xl font-bold">Sign in</h1>
          <p className="mt-2 text-sm text-muted-foreground">Only the account configured as this portfolio's owner can save changes.</p>
        </div>
        <label className="block space-y-2">
          <span className="text-sm font-medium">Email</span>
          <input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none focus:border-primary" />
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-medium">Password</span>
          <input type="password" required value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none focus:border-primary" />
        </label>
        {status && <p aria-live="polite" className="text-sm text-red-300">{status}</p>}
        <button type="submit" className="w-full rounded-full bg-primary px-6 py-3 font-medium text-primary-foreground hover:bg-primary/90">Sign in</button>
      </form>
    </main>
  );
};

export const ContentAdmin = () => {
  const { content, loadError, saveContent } = usePortfolioContent();
  const [draft, setDraft] = useState(null);
  const [session, setSession] = useState(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [status, setStatus] = useState("");

  useEffect(() => {
    setDraft(clone(content));
  }, [content]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data, error }) => {
      if (error) setStatus(error.message);
      setSession(data.session);
      setIsCheckingSession(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setIsCheckingSession(false);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const signIn = async (event, email, password) => {
    event.preventDefault();
    setStatus("Signing in…");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setStatus(error ? error.message : "");
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setStatus("Saving to Supabase…");

    try {
      const savedContent = await saveContent(draft, session.user.id);
      setDraft(clone(savedContent));
      setStatus("Saved. The public portfolio will use these changes on its next load.");
    } catch (error) {
      setStatus(`Could not save: ${error.message}`);
    }
  };

  if (isCheckingSession) {
    return <main className="grid min-h-screen place-items-center bg-background text-muted-foreground">Checking your session…</main>;
  }

  if (!session) return <AdminLogin onSubmit={signIn} status={status} />;

  if (!draft) {
    return <main className="grid min-h-screen place-items-center bg-background text-muted-foreground">Loading portfolio content…</main>;
  }

  return (
    <main className="min-h-screen bg-background px-4 py-10 text-foreground sm:px-8">
      <form onSubmit={handleSave} className="mx-auto max-w-5xl space-y-8">
        <header className="space-y-3">
          <p className="text-sm font-medium uppercase tracking-wider text-primary">Local content editor</p>
          <h1 className="text-3xl font-bold sm:text-4xl">Edit your portfolio</h1>
          <p className="max-w-3xl text-muted-foreground">
            Signed in as {session.user.email}. Edit every portfolio field here, then save it to Supabase. Image fields now support file uploads.
          </p>
        </header>

        {loadError && <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">Supabase content could not load, so you are seeing the local fallback: {loadError.message}</p>}

        {Object.entries(draft).map(([key, value]) => (
          <section key={key} className="glass rounded-2xl p-5 sm:p-7">
            <h2 className="mb-6 text-2xl font-bold text-primary">{formatLabel(key)}</h2>
            <ContentEditor
              value={value}
              path={key}
              update={(nextValue) => setDraft((current) => ({ ...current, [key]: nextValue }))}
            />
          </section>
        ))}

        <div className="sticky bottom-4 flex flex-col gap-3 rounded-2xl border border-primary/30 bg-surface/95 p-4 shadow-xl backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <p aria-live="polite" className="text-sm text-muted-foreground">{status}</p>
            <button type="button" onClick={() => supabase.auth.signOut()} className="text-sm text-primary hover:underline">Sign out</button>
          </div>
          <button type="submit" className="rounded-full bg-primary px-6 py-3 font-medium text-primary-foreground hover:bg-primary/90">
            Save all content
          </button>
        </div>
      </form>
    </main>
  );
};
