import api from '../api/axios';

export const getPurchasesByDeclarationRequest = async (declarationId) => {
  const response = await api.get(`/declarations/${declarationId}/purchases`);
  return response.data;
};

export const createPurchaseRequest = async (declarationId, data) => {
  const response = await api.post(`/declarations/${declarationId}/purchases`, data);
  return response.data;
};

export const updatePurchaseRequest = async (id, data) => {
  const response = await api.put(`/purchases/${id}`, data);
  return response.data;
};

export const deletePurchaseRequest = async (id) => {
  const response = await api.delete(`/purchases/${id}`);
  return response.data;
};