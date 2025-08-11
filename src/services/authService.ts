export const login = async (username: string, password: string) => {
    const response = await fetch("/api/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
    });
    if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
    }
    return await response.json();
};
