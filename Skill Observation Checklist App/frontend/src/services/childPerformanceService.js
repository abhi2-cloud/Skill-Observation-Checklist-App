import axios from "../api/axios";

export const getChildObservations =
  async (childId) => {

    const response =
      await axios.get(
        `/api/observations/child/${childId}`
      );

    return response.data;
  };