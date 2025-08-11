export const getServers = async () => {
    return await fetchData("/api/servers");
};
