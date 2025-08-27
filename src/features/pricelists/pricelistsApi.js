import publicApiClient from "../../lib/publicApiClient";

export const fetchPricelists = async () => {
    const response = await publicApiClient.get("/api/public/pricelists");
    return response.data;
};
