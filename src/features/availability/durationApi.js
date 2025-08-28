import publicApiClient from "../../lib/publicApiClient";

export const fetchDurations = async (unitId, date, startTime) => {
    if (!unitId || !date || !startTime) {
        return [];
    }

    const response = await publicApiClient.get(`/api/public/units/${unitId}/get-duration`, {
        params: {
            date,
            start_time: startTime
        }
    });

    return Array.isArray(response?.data?.durations) ? response.data.durations : [];
};
