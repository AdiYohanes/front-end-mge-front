// src/features/rewards/rewardsApi.js

import apiClient from "../../lib/axios";

export const redeemReward = async (rewardId) => {
    const response = await apiClient.post(`/api/customer/rewards/${rewardId}/redeem`);
    return response.data;
};

export const applyReward = async (rewardId) => {
    const response = await apiClient.post(`/api/customer/rewards-apply/${rewardId}/apply`);
    return response.data;
};

export const getUserRewards = async () => {
    const response = await apiClient.get("/api/customer/my-rewards");
    return response.data;
};
