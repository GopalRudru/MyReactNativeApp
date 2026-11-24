import axiosInstance, { secureFetch } from "../apiClient/apiClient"; // Assuming axiosInstance is correctly configured
import dictionary from "../dictionary";

const { posts } = dictionary;

const postsServices = {
  getPosts: (queryString: string = '') => axiosInstance.get(`${posts.getPosts()}${queryString}`),
  addPost: (endpoint: string, postData: any = {}) => axiosInstance?.post(endpoint, postData),
  updatePost: (endpoint: string, postData: any = {}, queryString: string = '') =>
    axiosInstance.put(`${endpoint}${queryString}`, postData),
  
  // 🔐 Secure methods using SSL pinning
  secureGetPosts: (queryString: string = '') =>
    secureFetch({
      url: `${posts.getPosts()}${queryString}`,
      method: "GET",
      body: undefined,
    }),

  secureAddPost: (endpoint: string, postData: any = {}) =>
    secureFetch({
      url: endpoint,
      method: "POST",
      body: postData,
    }),
};

export default postsServices;