import api from '../api/axios';

export const getSalesByDeclarationRequest = async (declarationId) => {
  const response = await api.get(`/declarations/${declarationId}/sales`);
  return response.data;
};

export const createSaleRequest = async (declarationId, data) => {
  const response = await api.post(`/declarations/${declarationId}/sales`, data);
  return response.data;
};

export const updateSaleRequest = async (id, data) => {
  const response = await api.put(`/sales/${id}`, data);
  return response.data;
};

export const deleteSaleRequest = async (id) => {
  const response = await api.delete(`/sales/${id}`);
  return response.data;
};