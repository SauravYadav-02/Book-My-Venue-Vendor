import axios from "axios";

const BASE_URL = "http://192.168.1.12:3000/reports";

export interface Report {
  _id: string;
  title: string;
  description: string;
  user: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  venue: {
    _id: string;
    name: string;
    city: string;
    vendorId?: {
      _id: string;
      fullName: string;
      businessName: string;
      email: string;
    };
  };
  status: "Open" | "In Progress" | "Resolved" | "Closed";
  attachments: string[];
  createdAt: string;
  updatedAt: string;
}

// 1. Fetch all reports (Admin)
export const getReportsAdmin = async (adminId: string): Promise<Report[]> => {
  const res = await axios.get<Report[]>(BASE_URL, {
    headers: { adminid: adminId }
  });
  return res.data;
};

// 2. Fetch single report details (Admin)
export const getReportByIdAdmin = async (adminId: string, reportId: string): Promise<Report> => {
  const res = await axios.get<Report>(`${BASE_URL}/${reportId}`, {
    headers: { adminid: adminId }
  });
  return res.data;
};

// 3. Update report status (Admin)
export const updateReportStatusAdmin = async (
  adminId: string,
  reportId: string,
  status: string
): Promise<Report> => {
  const res = await axios.put<{ message: string; report: Report }>(
    `${BASE_URL}/${reportId}/status`,
    { status },
    { headers: { adminid: adminId } }
  );
  return res.data.report;
};

// 4. Fetch reports for vendor's own venues
export const getReportsVendor = async (vendorId: string): Promise<Report[]> => {
  const res = await axios.get<Report[]>(`${BASE_URL}/vendor`, {
    headers: { vendorid: vendorId }
  });
  return res.data;
};
