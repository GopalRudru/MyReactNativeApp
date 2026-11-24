import axiosInstance, { secureFetch } from "../apiClient/apiClient"; // Assuming axiosInstance is correctly configured
import dictionary from "../dictionary";

const { posts } = dictionary;

const putsService = {
  put: (endpoint: string) => axiosInstance.put(endpoint),
  
  // 🔐 Secure PUT method with SSL pinning
  securePut: (endpoint: string, data?: any, headers?: Record<string, string>) => 
    secureFetch({
      url: endpoint,
      method: "PUT",
      body: data,
      headers,
    }),
};

export default putsService;