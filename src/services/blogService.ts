import axios from "axios";

const BASE_URL = "http://localhost:3000/blogs";
const getVendorId = () => localStorage.getItem("vendorId") || "";

export interface Blog {
  _id: string;
  vendorId: { _id: string; fullName: string; businessName?: string };
  title: string;
  content: string;
  tags: string[];
  coverImage?: string;
  images: string[];
  videoUrl?: string;
  status: "pending" | "approved" | "rejected" | "suspended";
  adminNote?: string;
  likes: string[];
  comments: any[];
  createdAt: string;
}

export const getMyBlogs = async (page = 1, limit = 10): Promise<{
  data: Blog[];
  page: number;
  limit: number;
  totalRecords: number;
  totalPages: number;
}> => {
  const vendorId = getVendorId();
  const res = await axios.get(`${BASE_URL}/vendor/my`, {
    headers: { vendorid: vendorId },
    params: { page, limit }
  });
  return res.data;
};

export const createBlog = async (formData: FormData): Promise<Blog> => {
  const vendorId = getVendorId();
  const res = await axios.post(`${BASE_URL}/vendor`, formData, {
    headers: { vendorid: vendorId }
  });
  return res.data;
};

export const updateBlog = async (blogId: string, formData: FormData): Promise<Blog> => {
  const vendorId = getVendorId();
  const res = await axios.put(`${BASE_URL}/vendor/${blogId}`, formData, {
    headers: { vendorid: vendorId }
  });
  return res.data;
};

export const deleteBlog = async (blogId: string): Promise<{ success: boolean; message: string }> => {
  const vendorId = getVendorId();
  const res = await axios.delete(`${BASE_URL}/vendor/${blogId}`, {
    headers: { vendorid: vendorId }
  });
  return res.data;
};
