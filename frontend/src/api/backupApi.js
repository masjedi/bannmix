import api from "./axios";

const filenameFromDisposition = (header) => {
    const match = /filename\*?=(?:UTF-8''|"?)([^";]+)/i.exec(header || "");

    if (match?.[1]) {
        return decodeURIComponent(match[1].replace(/"/g, ""));
    }

    const day = new Date().toISOString().slice(0, 10);

    return `banmix-backup-${day}.zip`;
};

const readErrorMessage = async (error) => {
    const data = error?.response?.data;

    if (data instanceof Blob) {
        try {
            const payload = JSON.parse(await data.text());

            if (payload?.message) {
                return payload.message;
            }
        } catch {
            // The error body was not JSON.
        }
    }

    if (error?.response?.status === 429) {
        return "A backup was just started. Wait a minute, then try again.";
    }

    return "Could not create the backup.";
};

export const backupApi = {
    download: async () => {
        try {
            const response = await api.get("/admin/backup", {
                responseType: "blob",
            });

            const blob = response.data;
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");

            link.href = url;
            link.download = filenameFromDisposition(
                response.headers?.["content-disposition"]
            );
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(url);
        } catch (error) {
            throw new Error(await readErrorMessage(error));
        }
    },
};

export default backupApi;
