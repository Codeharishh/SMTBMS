// src/services/materialMovementService.js
import api from './api'; // Double-check if this points correctly to your base axios config instance

// 🟢 EXPLICIT NAMED EXPORTS
export const fetchMovements = async () => {
  try {
    const response = await api.get('/material-movements');
    return response.data;
  } catch (error) {
    console.error("Axios service fetch movements failure:", error);
    throw error;
  }
};

export const createMovement = async (movementData) => {
  try {
    const response = await api.post('/material-movements', movementData);
    return response.data;
  } catch (error) {
    console.error("Axios service create movement failure:", error);
    throw error;
  }
};

export const updateMovement = async (id, movementData) => {
  try {
    const response = await api.put(`/material-movements/${id}`, movementData);
    return response.data;
  } catch (error) {
    console.error("Axios service update movement failure:", error);
    throw error;
  }
};

export const deleteMovement = async (id) => {
  try {
    const response = await api.delete(`/material-movements/${id}`);
    return response.data;
  } catch (error) {
    console.error("Axios service delete movement failure:", error);
    throw error;
  }
};