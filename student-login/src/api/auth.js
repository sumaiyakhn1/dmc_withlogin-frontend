export const getBackendToken = async () => {
    const res = await fetch("http://127.0.0.1:8000/backend-auth", {
        method: "POST"
    });

    if (!res.ok) {
        throw new Error("Failed to fetch token");
    }

    return await res.json();
};
