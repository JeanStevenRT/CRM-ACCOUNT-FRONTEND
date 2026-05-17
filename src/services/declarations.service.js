import api from '../api/axios';

export const getDeclarationsRequest = async ({
  search = '',
  mes = '',
  page = 1,
  limit = 10,
}) => {
  const response = await api.get('/declarations', {
    params: {
      search,
      mes: mes || undefined,
      page,
      limit,
    },
  });

  return response.data;
};
export const getDeclarationByIdRequest = async (id) => {
  const response = await api.get(`/declarations/${id}`);
  return response.data;
};

export const getDeclarationsByClientRequest = async (clientId) => {
  const response = await api.get(`/declarations/client/${clientId}`);
  return response.data;
};

export const createDeclarationRequest = async (data) => {
  const response = await api.post('/declarations', data);
  return response.data;
};

export const updateDeclarationRequest = async (id, data) => {
  const response = await api.put(`/declarations/${id}`, data);
  return response.data;
};

export const deleteDeclarationRequest = async (id) => {
  const response = await api.delete(`/declarations/${id}`);
  return response.data;
};

export const recalculateDeclarationRequest = async (id) => {
  const response = await api.post(`/declarations/${id}/recalculate`);
  return response.data;
};