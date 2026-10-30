import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getUsers, updateUserRole } from "./userList.api";
import type { UpdateRolePayload, UserQueryParams } from "./userList.type";

export const USER_LIST_QUERY_KEY = ["admin-users"] as const;

export const useGetUsers = (params?: UserQueryParams) => {
  return useQuery({
    queryKey: [...USER_LIST_QUERY_KEY, params],
    queryFn: () => getUsers(params),
    placeholderData: (previousData) => previousData,
  });
};

export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateRolePayload) => updateUserRole(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_LIST_QUERY_KEY });
    },
  });
};
