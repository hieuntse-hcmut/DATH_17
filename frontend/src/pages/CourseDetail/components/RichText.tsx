const TOKEN =
    /(`[^`]+`|\*\*[^*]+\*\*|__[^_]+__|\*[^*]+\*|\[[^\]]+\]\(https?:\/\/[^)\s]+\)|https?:\/\/[^\s<>"]*[^\s<>".,!?;:)\]])/g;
const LINK = /^\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)$/;
const BARE_URL = /^https?:\/\/\S+$/;

const linkClass = "break-all text-link underline hover:opacity-80";

export default function RichText({ text }: { text: string }) {
    return (
        <p className="whitespace-pre-wrap break-words text-sm leading-6 text-fg">
            {text.split(TOKEN).map((part, i) => {
                if (
                    part.startsWith("`") &&
                    part.endsWith("`") &&
                    part.length > 2
                ) {
                    return (
                        <code
                            key={i}
                            className="rounded bg-primary-soft px-1.5 py-0.5 font-mono text-[0.85em] text-primary"
                        >
                            {part.slice(1, -1)}
                        </code>
                    );
                }
                if (
                    part.startsWith("**") &&
                    part.endsWith("**") &&
                    part.length > 4
                ) {
                    return <strong key={i}>{part.slice(2, -2)}</strong>;
                }
                if (
                    part.startsWith("__") &&
                    part.endsWith("__") &&
                    part.length > 4
                ) {
                    return <u key={i}>{part.slice(2, -2)}</u>;
                }
                if (
                    part.startsWith("*") &&
                    part.endsWith("*") &&
                    part.length > 2
                ) {
                    return <em key={i}>{part.slice(1, -1)}</em>;
                }
                const link = LINK.exec(part);
                if (link) {
                    return (
                        <a
                            key={i}
                            href={link[2]}
                            target="_blank"
                            rel="noreferrer noopener"
                            className={linkClass}
                        >
                            {link[1]}
                        </a>
                    );
                }
                if (BARE_URL.test(part)) {
                    return (
                        <a
                            key={i}
                            href={part}
                            target="_blank"
                            rel="noreferrer noopener"
                            className={linkClass}
                        >
                            {part}
                        </a>
                    );
                }
                return part;
            })}
        </p>
    );
}
