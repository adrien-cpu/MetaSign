export const getMetrics = async () => {
    return await fetchData("/api/metrics");
};
