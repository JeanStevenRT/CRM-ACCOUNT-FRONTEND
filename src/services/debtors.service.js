import api from '../api/axios';

export const getDebtorsRequest = async ({
  anio,
  mes,
  search = '',
  page = 1,
  limit = 10,
}) => {
  const response = await api.get('/debtors', {
    params: {
      anio,
      mes,
      search,
      page,
      limit,
    },
  });

  return response.data;
};

export const getDebtorByIdRequest = async (id) => {
  const response = await api.get(`/debtors/${id}`);
  return response.data;
};

export const payDebtRequest = async (id) => {
  const response = await api.patch(`/debtors/${id}/pay`);
  return response.data;
};