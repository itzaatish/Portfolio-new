import { useEffect, useState } from "react";
import defaultContent from "@/data/portfolio.json";

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

export const ContentAdmin = () => {
  const [content, setContent] = useState(() => clone(defaultContent));
  const [status, setStatus] = useState("Loading local content…");

  useEffect(() => {
    fetch("/api/portfolio-content")
      .then((response) => {
        if (!response.ok) throw new Error("The local editor API is unavailable.");
        return response.json();
      })
      .then((data) => {
        setContent(data);
        setStatus("");
      })
      .catch(() => setStatus("Local save is available only while `npm run dev` is running."));
  }, []);

  const saveContent = async (event) => {
    event.preventDefault();
    setStatus("Saving to src/data/portfolio.json…");

    try {
      const response = await fetch("/api/portfolio-content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(content),
      });
      if (!response.ok) throw new Error();
      const saved = await response.json();
      setContent(saved.content);
      setStatus("Saved locally. Refresh the portfolio to view the latest content.");
    } catch {
      setStatus("Could not save. Run the project with `npm run dev` and try again.");
    }
  };

  return (
    <main className="min-h-screen bg-background px-4 py-10 text-foreground sm:px-8">
      <form onSubmit={saveContent} className="mx-auto max-w-5xl space-y-8">
        <header className="space-y-3">
          <p className="text-sm font-medium uppercase tracking-wider text-primary">Local content editor</p>
          <h1 className="text-3xl font-bold sm:text-4xl">Edit your portfolio</h1>
          <p className="max-w-3xl text-muted-foreground">
            This unprotected development page saves all content into <code>src/data/portfolio.json</code>. Image fields accept a public image path or URL for now; uploads will be added with Supabase.
          </p>
        </header>

        {Object.entries(content).map(([key, value]) => (
          <section key={key} className="glass rounded-2xl p-5 sm:p-7">
            <h2 className="mb-6 text-2xl font-bold text-primary">{formatLabel(key)}</h2>
            <ContentEditor
              value={value}
              path={key}
              update={(nextValue) => setContent((current) => ({ ...current, [key]: nextValue }))}
            />
          </section>
        ))}

        <div className="sticky bottom-4 flex flex-col gap-3 rounded-2xl border border-primary/30 bg-surface/95 p-4 shadow-xl backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <p aria-live="polite" className="text-sm text-muted-foreground">{status}</p>
          <button type="submit" className="rounded-full bg-primary px-6 py-3 font-medium text-primary-foreground hover:bg-primary/90">
            Save all content locally
          </button>
        </div>
      </form>
    </main>
  );
};
