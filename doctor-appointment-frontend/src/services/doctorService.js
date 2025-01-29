import axios from 'axios';

export const registerDoctor = async (doctorData) => {
  try {
    const response = await axios.post(
      `${process.env.REACT_APP_API_URL}/doctors/register`,
      doctorData,
      { withCredentials: true }
    );

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    return response.data;
  } catch (error) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw error;
  }
}; 