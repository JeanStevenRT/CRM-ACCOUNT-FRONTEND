import api from '../api/axios';

export const getUsersRequest = async ({ search = '', page = 1, limit = 10 }) => {
  const response = await api.get('/users', {
    params: {
      search,
      page,
      limit,
    },
  });

  return response.data;
};

export const createUserRequest = async (data) => {
  const response = await api.post('/users', data);
  return response.data;
};

export const updateUserRequest = async (id, data) => {
  const response = await api.put(`/users/${id}`, data);
  return response.data;
};

export const deleteUserRequest = async (id) => {
  const response = await api.delete(`/users/${id}`);
  return response.data;
};

export const getRolesRequest = async () => {
  const response = await api.get('/users/roles');
  return response.data;
};

export const createRoleRequest = async (data) => {
  const response = await api.post('/users/roles', data);
  return response.data;
};

export const updateRoleRequest = async (id, data) => {
  const response = await api.put(`/users/roles/${id}`, data);
  return response.data;
};

export const deleteRoleRequest = async (id) => {
  const response = await api.delete(`/users/roles/${id}`);
  return response.data;
};
