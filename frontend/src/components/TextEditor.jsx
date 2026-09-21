import { useEffect, useId, useRef } from "react";
import {
    Bold,
    Heading2,
    Italic,
    Link2,
    List,
    ListOrdered,
    Redo2,
    RemoveFormatting,
    Underline,
    Undo2,
} from "lucide-react";

import { isEmptyHtml, sanitizeHtml } from "../utils/htmlText";

const TOOLS = [
    { command: "bold", label: "Bold", Icon: Bold },
    { command: "italic", label: "Italic", Icon: Italic },
    { command: "underline", label: "Underline", Icon: Underline },
    { command: "insertUnorderedList", label: "Bullet list", Icon: List },
    { command: "insertOrderedList", label: "Numbered list", Icon: ListOrdered },
    { command: "formatBlock", arg: "h2", label: "Heading", Icon: Heading2 },
    { command: "createLink", label: "Insert link", Icon: Link2 },
    { command: "undo", label: "Undo", Icon: Undo2 },
    { command: "redo", label: "Redo", Icon: Redo2 },
    { command: "removeFormat", label: "Clear formatting", Icon: RemoveFormatting },
];

const TextEditor = ({
    value = "",
    onChange,
    placeholder = "Write a description…",
    disabled = false,
    dir = "ltr",
    minHeight = "12rem",
    id,
    className = "",
}) => {
    const editorRef = useRef(null);
    const lastHtml = useRef("");
    const generatedId = useId();
    const editorId = id || generatedId;

    useEffect(() => {
        const editor = editorRef.current;
        if (!editor) return;

        const next = value || "";
        if (next !== lastHtml.current && next !== editor.innerHTML) {
            editor.innerHTML = next;
            lastHtml.current = next;
        }
    }, [value]);

    const emitChange = () => {
        const editor = editorRef.current;
        if (!editor) return;

        const html = sanitizeHtml(editor.innerHTML);
        lastHtml.current = html;
        onChange?.(html);
    };

    const runCommand = (command, arg) => {
        if (disabled) return;

        editorRef.current?.focus();

        if (command === "createLink") {
            const url = window.prompt("Enter a link URL");
            if (!url?.trim()) return;
            document.execCommand("createLink", false, url.trim());
            emitChange();
            return;
        }

        document.execCommand(command, false, arg);
        emitChange();
    };

    const handlePaste = (event) => {
        event.preventDefault();
        const html = event.clipboardData.getData("text/html");
        const text = event.clipboardData.getData("text/plain");
        const inserted = html
            ? sanitizeHtml(html)
            : text.replace(/\n/g, "<br>");
        document.execCommand("insertHTML", false, inserted);
        emitChange();
    };

    const empty = isEmptyHtml(value || editorRef.current?.innerHTML || "");

    return (
        <div
            className={[
                "text-editor overflow-hidden rounded-xl border border-line bg-theme-surface",
                disabled ? "opacity-60" : "focus-within:border-brand-orange focus-within:ring-2 focus-within:ring-brand-orange/20",
                className,
            ]
                .filter(Boolean)
                .join(" ")}
        >
            <div
                className="flex flex-wrap gap-1 border-b border-line bg-theme-page px-2 py-1.5"
                role="toolbar"
                aria-label="Text formatting"
            >
                {TOOLS.map(({ command, arg, label, Icon }) => (
                    <button
                        key={label}
                        type="button"
                        disabled={disabled}
                        title={label}
                        aria-label={label}
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => runCommand(command, arg)}
                        className="grid h-8 w-8 place-items-center rounded-lg text-content-secondary transition hover:bg-brand-orange/10 hover:text-brand-orange disabled:cursor-not-allowed"
                    >
                        <Icon size={15} strokeWidth={1.9} />
                    </button>
                ))}
            </div>

            <div
                ref={editorRef}
                id={editorId}
                role="textbox"
                aria-multiline="true"
                aria-placeholder={placeholder}
                contentEditable={!disabled}
                suppressContentEditableWarning
                dir={dir}
                data-placeholder={placeholder}
                onInput={emitChange}
                onBlur={emitChange}
                onPaste={handlePaste}
                className={[
                    "text-editor-surface rich-text px-3 py-2.5 text-sm leading-6 text-content outline-none",
                    empty ? "is-empty" : "",
                ]
                    .filter(Boolean)
                    .join(" ")}
                style={{ minHeight }}
            />
        </div>
    );
};

export const RichText = ({ html = "", className = "" }) => {
    const sanitized = sanitizeHtml(html);

    if (!sanitized) return null;

    return (
        <div
            className={["rich-text", className].filter(Boolean).join(" ")}
            dangerouslySetInnerHTML={{ __html: sanitized }}
        />
    );
};

export default TextEditor;
