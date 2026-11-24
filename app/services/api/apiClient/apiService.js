import axiosInstance from './apiClient';s

export const getRequest = async (url) => {
  try {
    const response = await axiosInstance.get(url);
    return { status: response.status, data: response.data };
  } catch (error) {
    return handleError(error);
  }
};

export const postRequest = async (url, body) => {
  try {
    const response = await axiosInstance.post(url, body);
    return { status: response.status, data: response.data };
  } catch (error) {
    return handleError(error);
  }
};

const handleError = (error) => {
  const status = error.response?.status || 500;
  const message = error.response?.data || error.message;
  return { status, data: message };
};
