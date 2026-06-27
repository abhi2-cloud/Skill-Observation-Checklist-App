import axios from "../api/axios";

export const getTopChild =
async () => {

  const response =
    await axios.get(
      "/api/dashboard/top-child"
    );

  return response.data;

};