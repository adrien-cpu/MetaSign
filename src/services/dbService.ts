export const getDbMetrics = async () => {
    return await fetchData("/api/db-metrics");
};
