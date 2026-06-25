import api from '../api/axios';

// Lista control mensual con stats
export const getControlRequest = ({
  anio,
  mes,
  filtro = 'todos',
  buscar = '',
  page = 1,
  limit = 15,
}) =>
  api.get('/control', {
    params: { anio, mes, filtro, buscar, page, limit },
  }).then(r => r.data);

// Actualizar estado de un cliente en el mes
export const upsertControlRequest = (clienteId, { anio, mes, ...body }) =>
  api.patch(`/control/${clienteId}`, body, { params: { anio, mes } }).then(r => r.data);

export const reorderControlRequest = (clienteIds) =>
  api.patch('/control/order', { clienteIds }).then(r => r.data);

// Referidos
export const getReferidosRequest = ({ anio, mes }) =>
  api.get('/control/referidos', { params: { anio, mes } }).then(r => r.data);

export const createReferidoRequest = (data) =>
  api.post('/control/referidos', data).then(r => r.data);

export const updateReferidoRequest = (id, data) =>
  api.patch(`/control/referidos/${id}`, data).then(r => r.data);

export const deleteReferidoRequest = (id) =>
  api.delete(`/control/referidos/${id}`).then(r => r.data);
