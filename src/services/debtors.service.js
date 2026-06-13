import api from '../api/axios';

export const getDebtorsRequest = async ({
  clienteId = '',
  anio = '',
  mes = '',
  search = '',
  page = 1,
  limit = 10,
}) => {
  const response = await api.get('/debtors', {
    params: {
      clienteId: clienteId || undefined,
      search,
      anio: anio || undefined,
      mes: mes || undefined,
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