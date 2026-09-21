import { useCallback, useEffect, useState } from "react";

import { LoaderCircle, Mail } from "lucide-react";

import contactMessagesApi from "../../api/contactMessagesApi";

const extractMessages = (response) => {
    const payload = response?.data ?? response;

    return Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload)
          ? payload
          : [];
};

const ContactMessages = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadMessages = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const response = await contactMessagesApi.getMessages({ per_page: 50 });
            setMessages(extractMessages(response));
        } catch (requestError) {
            setError(
                requestError?.response?.data?.message ||
                    "Could not load contact messages."
            );
            setMessages([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadMessages();
    }, [loadMessages]);

    const markAsRead = async (messageId) => {
        try {
            await contactMessagesApi.markAsRead(messageId);
            await loadMessages();
        } catch (requestError) {
            setError(
                requestError?.response?.data?.message ||
                    "Could not update message status."
            );
        }
    };

    return (
        <section className="space-y-6">
            <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-brand-orange/10 px-3 py-1 text-xs font-semibold text-brand-orange">
                    <Mail size={14} />
                    Inbox
                </div>
                <h1 className="mt-3 text-2xl font-bold tracking-tight text-content">
                    Contact Messages
                </h1>
                <p className="mt-1 text-sm text-content-muted">
                    Messages submitted from the public contact form.
                </p>
            </div>

            {error ? (
                <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </p>
            ) : null}

            {loading ? (
                <div className="flex items-center gap-2 text-sm text-content-muted">
                    <LoaderCircle size={16} className="animate-spin" />
                    Loading messages…
                </div>
            ) : messages.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-line bg-theme-surface px-4 py-12 text-center text-sm text-content-muted">
                    No contact messages yet.
                </p>
            ) : (
                <ul className="space-y-4">
                    {messages.map((message) => (
                        <li
                            key={message.id}
                            className={[
                                "rounded-2xl border border-line bg-theme-surface p-5 shadow-sm",
                                message.is_read ? "opacity-85" : "border-brand-orange/30",
                            ].join(" ")}
                        >
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                    <p className="font-semibold text-content">
                                        {message.name}
                                    </p>
                                    <p className="mt-1 text-sm text-content-muted">
                                        {message.email}
                                    </p>
                                    {message.subject ? (
                                        <p className="mt-2 text-sm font-medium text-content-secondary">
                                            {message.subject}
                                        </p>
                                    ) : null}
                                </div>

                                <div className="flex items-center gap-3">
                                    <span className="text-xs text-content-muted">
                                        {message.created_at
                                            ? new Date(message.created_at).toLocaleString()
                                            : ""}
                                    </span>
                                    {!message.is_read ? (
                                        <button
                                            type="button"
                                            onClick={() => markAsRead(message.id)}
                                            className="rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-content-secondary transition hover:border-brand-orange hover:text-brand-orange"
                                        >
                                            Mark read
                                        </button>
                                    ) : null}
                                </div>
                            </div>

                            <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-content-secondary">
                                {message.message}
                            </p>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
};

export default ContactMessages;
