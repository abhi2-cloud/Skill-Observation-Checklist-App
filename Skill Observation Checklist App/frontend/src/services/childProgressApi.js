import axios from "../api/axios";

export const getChildProgress =
async () => {

  const token =
    localStorage.getItem(
      "access_token"
    );

  const response =
    await axios.get(
      "/api/dashboard/child-progress",
      {
        headers: {
          Authorization:
            `Bearer ${token}`
        }
      }
    );

  return response.data;

};