import axios from "axios";

const API_URL = "http://localhost:3000";

const api = axios.create({
  baseURL: API_URL,
});

export const getAdminVenues = async (params: { page?: number; limit?: number; search?: string; status?: string }) => {
  const adminId = localStorage.getItem("adminId");
  const res = await api.get("/admin/venues", {
    headers: { adminid: adminId },
    params,
  });
  return res.data;
};

export const adminDeactivateVenue = async (
  venueId: string,
  reason?: string,
  suspensionStart?: string,
  suspensionEnd?: string
) => {
  const adminId = localStorage.getItem("adminId");
  const res = await api.patch(`/admin/venues/${venueId}/deactivate`, {
    reason,
    suspensionStart,
    suspensionEnd
  }, {
    headers: { adminid: adminId },
  });
  return res.data;
};

export const adminReactivateVenue = async (venueId: string) => {
  const adminId = localStorage.getItem("adminId");
  const res = await api.patch(`/admin/venues/${venueId}/reactivate`, {}, {
    headers: { adminid: adminId },
  });
  return res.data;
};
