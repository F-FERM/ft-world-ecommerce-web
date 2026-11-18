import axiosInstance from "@/src/service/axios";
import { useQuery } from "@tanstack/react-query";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export interface ApiLoggedUser {
  _id: string;
  username: string;
  isActive: boolean;
  isDeleted: boolean;
  name?: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  phoneNumber?: string;
  mobile?: string;
  avatar?: string;
  profileImage?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface LoggedUserResponse {
  success: boolean;
  message: string;
  data: ApiLoggedUser;
  statusCode: number;
}

/* ------------------------------------------------------------------ */
/* Fetcher                                                             */
/* ------------------------------------------------------------------ */

export const fetchLoggedUser = async (): Promise<ApiLoggedUser> => {
  try {
    const res = await axiosInstance.get<LoggedUserResponse>("/user/logged-user");
    return res.data?.data ?? (res.data as unknown as ApiLoggedUser);
  } catch (err: any) {
    // If backend uses /user-loggeduser, try that as fallback
    if (err?.response?.status === 404) {
      const fallbackRes = await axiosInstance.get<LoggedUserResponse>(
        "/user-loggeduser"
      );
      return (
        fallbackRes.data?.data ?? (fallbackRes.data as unknown as ApiLoggedUser)
      );
    }
    throw new Error(
      err?.response?.data?.message || err?.message || "Failed to load profile"
    );
  }
};

/* ------------------------------------------------------------------ */
/* Hook                                                                */
/* ------------------------------------------------------------------ */

export const useLoggedUser = (options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: ["logged-user"],
    queryFn: fetchLoggedUser,
    enabled: options?.enabled ?? true,
    staleTime: 5 * 60 * 1000,
  });

/* ------------------------------------------------------------------ */
/* Mapper (API -> UI-friendly fields)                                  */
/* ------------------------------------------------------------------ */

export interface MappedLoggedUser {
  id?: string;
  username?: string;
  name: string;
  email: string;
  phone: string;
  memberSince: string | number;
  avatar?: string;
  isActive?: boolean;
}

export const mapLoggedUser = (u: ApiLoggedUser): MappedLoggedUser => {
  const joined = [u.firstName, u.lastName].filter(Boolean).join(" ").trim();
  const year = u.createdAt ? new Date(u.createdAt).getFullYear() : NaN;

  return {
    id: u._id,
    username: u.username,
    name: u.fullName || u.name || joined || u.username || "",
    email: u.email || "",
    phone: u.phone || u.phoneNumber || u.mobile || "",
    memberSince: Number.isNaN(year) ? "" : year,
    avatar: u.avatar || u.profileImage || undefined,
    isActive: u.isActive,
  };
};