import { getApi, patchApi } from "~/config/axiosClient";
import type {
  IUser,
  PageResponse,
  UpdateRolePayload,
  UserQueryParams,
} from "./userList.type";

export const getUsers = (params?: UserQueryParams): Promise<PageResponse<IUser>> => {
  return getApi<PageResponse<IUser>>("/admin/users", params as Record<string, unknown>);
};

export const updateUserRole = ({ userId, role }: UpdateRolePayload): Promise<IUser> => {
  return patchApi<IUser>(`/admin/users/${userId}/role`, { role });
};
