import { useState } from "react";

import { HardDriveDownload, LoaderCircle } from "lucide-react";

import backupApi from "../../api/backupApi";

const Backup = () => {
    const [downloading, setDownloading] = useState(false);
    const [error, setError] = useState("");

    const downloadBackup = async () => {
        setDownloading(true);
        setError("");

        try {
            await backupApi.download();
        } catch (requestError) {
            setError(requestError?.message || "Could not create the backup.");
        } finally {
            setDownloading(false);
        }
    };

    return (
        <section className="mx-auto w-full max-w-5xl">
            <div className="rounded-2xl border border-line bg-theme-surface p-5 shadow-sm sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-4">
                        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand-orange/10 text-brand-orange">
                            <HardDriveDownload size={22} strokeWidth={1.75} />
                        </span>
                        <h1 className="type-admin-page-title text-content">
                            Backup
                        </h1>
                    </div>

                    <button
                        type="button"
                        className="btn-primary shrink-0"
                        onClick={downloadBackup}
                        disabled={downloading}
                    >
                        {downloading ? (
                            <LoaderCircle size={18} className="animate-spin" />
                        ) : (
                            <HardDriveDownload size={18} />
                        )}
                        {downloading ? "Preparing backup…" : "Download backup"}
                    </button>
                </div>

                {error ? (
                    <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                    </p>
                ) : null}
            </div>
        </section>
    );
};

export default Backup;
