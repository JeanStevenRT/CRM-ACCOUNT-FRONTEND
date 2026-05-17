import api from '../api/axios';

export const getClientsRequest = async ({ search = '', page = 1, limit = 10 }) => {
    const response = await api.get('/clients', {
        params: {
        search,
        page,
        limit,
        },
    });

    return response.data;
};

export const getClientByIdRequest = async (id) => {
    const response = await api.get(`/clients/${id}`);
    return response.data;
};

export const createClientRequest = async (data) => {
    const response = await api.post('/clients', data);
    return response.data;
};

export const updateClientRequest = async (id, data) => {
    const response = await api.put(`/clients/${id}`, data);
    return response.data;
};

export const retireClientRequest = async (id, data) => {
  const response = await api.delete(`/clients/${id}`, {
    data,
  });

  return response.data;
};

export const getRetiredClientsRequest = async ({ search = '', page = 1, limit = 10, }) => {
  const response = await api.get('/clients/retireds', {
        params: {
        search,
        page,
        limit,
        },
  });

    return response.data;
};

export const getRetiredClientByIdRequest = async (id) => {
    const response = await api.get(`/clients/retireds/${id}`);
    return response.data;
};