import { supabase, getSession } from '../lib/supabase';

/**
 * API Client - Handles all HTTP requests to the Express backend
 * Automatically includes authentication token from Supabase session
 */

const API_BASE_URL = '/api';

// Helper to get auth headers
const getAuthHeaders = async () => {
    const session = await getSession();
    if (!session) {
        throw new Error('Not authenticated');
    }

    return {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
    };
};

// Generic request handler
const apiRequest = async (endpoint, options = {}) => {
    try {
        const headers = await getAuthHeaders();

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers: {
                ...headers,
                ...options.headers
            }
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Request failed');
        }

        return await response.json();
    } catch (error) {
        console.error('API request failed:', error);
        throw error;
    }
};

// Photos API
export const photosAPI = {
    getAll: async () => {
        return await apiRequest('/photos');
    },

    getById: async (id) => {
        return await apiRequest(`/photos/${id}`);
    },

    create: async (photoData) => {
        return await apiRequest('/photos', {
            method: 'POST',
            body: JSON.stringify(photoData)
        });
    },

    update: async (id, photoData) => {
        return await apiRequest(`/photos/${id}`, {
            method: 'PUT',
            body: JSON.stringify(photoData)
        });
    },

    delete: async (id) => {
        return await apiRequest(`/photos/${id}`, {
            method: 'DELETE'
        });
    }
};

// Cart API
export const cartAPI = {
    getAll: async () => {
        return await apiRequest('/cart');
    },

    add: async (item) => {
        return await apiRequest('/cart', {
            method: 'POST',
            body: JSON.stringify(item)
        });
    },

    update: async (id, updates) => {
        return await apiRequest(`/cart/${id}`, {
            method: 'PUT',
            body: JSON.stringify(updates)
        });
    },

    remove: async (id) => {
        return await apiRequest(`/cart/${id}`, {
            method: 'DELETE'
        });
    },

    clear: async () => {
        return await apiRequest('/cart', {
            method: 'DELETE'
        });
    }
};

// Orders API
export const ordersAPI = {
    getAll: async () => {
        return await apiRequest('/orders');
    },

    getById: async (id) => {
        return await apiRequest(`/orders/${id}`);
    },

    create: async (orderData) => {
        return await apiRequest('/orders', {
            method: 'POST',
            body: JSON.stringify(orderData)
        });
    },

    updateStatus: async (id, statusData) => {
        return await apiRequest(`/orders/${id}/status`, {
            method: 'PUT',
            body: JSON.stringify(statusData)
        });
    }
};

// Upload API
export const uploadAPI = {
    single: async (file) => {
        const session = await getSession();
        if (!session) {
            throw new Error('Not authenticated');
        }

        const formData = new FormData();
        formData.append('photo', file);

        const response = await fetch(`${API_BASE_URL}/upload`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${session.access_token}`
            },
            body: formData
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Upload failed');
        }

        return await response.json();
    },

    multiple: async (files) => {
        const session = await getSession();
        if (!session) {
            throw new Error('Not authenticated');
        }

        const formData = new FormData();
        files.forEach((file) => {
            formData.append('photos', file);
        });

        const response = await fetch(`${API_BASE_URL}/upload/multiple`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${session.access_token}`
            },
            body: formData
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Upload failed');
        }

        return await response.json();
    },

    delete: async (filePath) => {
        return await apiRequest('/upload', {
            method: 'DELETE',
            body: JSON.stringify({ filePath })
        });
    }
};

// Process Image API - Complete workflow with n8n
export const processImageAPI = {
    /**
     * Process image: Upload → n8n AI → Save edited → Create record
     * @param {File} file - Image file to process
     * @param {Object} options - Processing options
     * @param {string} options.aiTool - AI tool to use (visa-photo, absher-photo, etc.)
     * @param {string} options.title - Photo title
     * @param {string} options.printSize - Print size (default: A5)
     * @param {number} options.price - Price (default: 45)
     * @param {Function} onProgress - Progress callback (optional)
     */
    process: async (file, options, onProgress) => {
        const session = await getSession();
        if (!session) {
            throw new Error('Not authenticated');
        }

        const formData = new FormData();
        formData.append('image', file);
        formData.append('aiTool', options.aiTool);
        formData.append('title', options.title);
        if (options.printSize) formData.append('printSize', options.printSize);
        if (options.price) formData.append('price', options.price);

        // Report progress
        if (onProgress) onProgress({ step: 'uploading', progress: 0 });

        const response = await fetch(`${API_BASE_URL}/process-image`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${session.access_token}`
            },
            body: formData
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Image processing failed');
        }

        if (onProgress) onProgress({ step: 'complete', progress: 100 });

        return await response.json();
    }
};

// Auth helpers (using Supabase directly)
export const authAPI = {
    signUp: async (email, password, fullName) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName
                }
            }
        });

        if (error) throw error;
        return data;
    },

    signIn: async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) throw error;
        return data;
    },

    signOut: async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    },

    getUser: async () => {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;
        return user;
    },

    onAuthStateChange: (callback) => {
        return supabase.auth.onAuthStateChange(callback);
    }
};
