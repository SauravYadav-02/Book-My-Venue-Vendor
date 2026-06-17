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

const getAdminId = () => localStorage.getItem("adminId") || "";

export const getAdminBlogs = async (
  page = 1,
  limit = 10,
  search = "",
  status = "",
  deleted?: boolean
): Promise<{
  data: Blog[];
  page: number;
  limit: number;
  totalRecords: number;
  totalPages: number;
}> => {
  const adminId = getAdminId();
  const params: any = { page, limit };
  if (search) params.search = search;
  if (status) params.status = status;
  if (deleted !== undefined) params.deleted = deleted;

  const res = await axios.get(`${BASE_URL}/admin`, {
    headers: { adminid: adminId },
    params
  });
  return res.data;
};

export const approveBlog = async (blogId: string): Promise<Blog> => {
  const adminId = getAdminId();
  const res = await axios.patch(`${BASE_URL}/admin/${blogId}/approve`, {}, {
    headers: { adminid: adminId }
  });
  return res.data;
};

export const rejectBlog = async (blogId: string, reason: string): Promise<Blog> => {
  const adminId = getAdminId();
  const res = await axios.patch(`${BASE_URL}/admin/${blogId}/reject`, { reason }, {
    headers: { adminid: adminId }
  });
  return res.data;
};

export const suspendBlog = async (blogId: string, reason: string): Promise<Blog> => {
  const adminId = getAdminId();
  const res = await axios.patch(`${BASE_URL}/admin/${blogId}/suspend`, { reason }, {
    headers: { adminid: adminId }
  });
  return res.data;
};

export const restoreBlog = async (blogId: string): Promise<Blog> => {
  const adminId = getAdminId();
  const res = await axios.patch(`${BASE_URL}/admin/${blogId}/restore`, {}, {
    headers: { adminid: adminId }
  });
  return res.data;
};

export const deleteBlogByAdmin = async (blogId: string): Promise<Blog> => {
  const adminId = getAdminId();
  const res = await axios.patch(`${BASE_URL}/admin/${blogId}/delete`, {}, {
    headers: { adminid: adminId }
  });
  return res.data;
};

export const undeleteBlogByAdmin = async (blogId: string): Promise<Blog> => {
  const adminId = getAdminId();
  const res = await axios.patch(`${BASE_URL}/admin/${blogId}/undelete`, {}, {
    headers: { adminid: adminId }
  });
  return res.data;
};
