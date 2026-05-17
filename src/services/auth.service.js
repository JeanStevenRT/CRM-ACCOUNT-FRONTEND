import api from '../api/axios';

export const loginRequest = async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
};

export const logoutRequest = async () => {
    const response = await api.post('/auth/logout');
    return response.data;
};

export const refreshRequest = async () => {
    const response = await api.post('/auth/refresh');
    return response.data;
};