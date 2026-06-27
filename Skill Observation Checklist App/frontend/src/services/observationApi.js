import axios from "../api/axios";

export const getObservations =
  async () => {

    const token =
      localStorage.getItem(
        "access_token"
      );

    const response =
      await axios.get(
        "/api/observations/",
        {
          headers: {
            Authorization:
              `Bearer ${token}`
          }
        }
      );

    return response.data;

  };