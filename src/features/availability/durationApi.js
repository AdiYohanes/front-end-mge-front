import publicApiClient from "../../lib/publicApiClient";

export const fetchDurations = async (date, startTime) => {
    const response = await publicApiClient.get("/api/public/get-duration", {
        params: {
            date,
            start_time: startTime
        }
    });
    return response.data.durations;
};
