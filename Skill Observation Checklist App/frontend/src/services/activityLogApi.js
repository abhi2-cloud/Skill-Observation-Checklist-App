import axios from "../api/axios";

export const getActivityLogs =
async () => {

  const token =
    localStorage.getItem("token");

  const response =
    await axios.get(
      "/api/activity-logs/",
      {
        headers: {
          Authorization:
            `Bearer ${token}`
        }
      }
    );

  return response.data;

};