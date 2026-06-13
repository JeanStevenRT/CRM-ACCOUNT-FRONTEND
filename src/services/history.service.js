import api from '../api/axios';

export const getHistoryByPeriodRequest = async ({ clientId, anio, mes }) => {
  const response = await api.get('/history', {
    params: {
      clientId,
      anio,
      mes,
    },
  });

  return response.data;
};

export const getAllHistoryByClientRequest = async ({ clientId, anio }) => {
  const response = await api.get('/history/all', {
    params: {
      clientId,
      anio,
    },
  });

  return response.data;
};