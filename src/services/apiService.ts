export const fetchData = async (url: string) => {
    console.log("Attempting to fetch data from:", url);
    const response = await fetch(url);
    if (!response.ok) {
        console.error(`Failed with status: ${response.status}`);
        throw new Error(`Erreur HTTP: ${response.status}`);
    }
    return await response.json();
};

export const toggleIaStatus = async (iaName: string) => {
    await fetch(`/api/ia/${iaName}/toggle`, {
        method: "POST",
    });
};

export const toggleServiceStatus = async (serviceName: string) => {
    await fetch(`/api/services/${serviceName}/toggle`, {
        method: "POST",
    });
};

export const handleServerAction = async (serverName: string, action: string) => {
    await fetch(`/api/servers/${serverName}/${action}`, {
        method: "POST",
    });
};

export const handleModeration = async (contentId: string, action: string) => {
    await fetch(`/api/moderation/${contentId}/${action}`, {
        method: "POST",
    });
};

export const handleReply = async (feedbackId: string) => {
    await fetch(`/api/feedback/${feedbackId}/reply`, {
        method: "POST",
    });
};
