// Temporary compatibility layer - redirects to new API
// This file exists to prevent import errors while we migrate pages

import { photosAPI, cartAPI, ordersAPI, uploadAPI, authAPI, processImageAPI } from './client';
import { supabase } from '../lib/supabase';

// Legacy base44 object for backwards compatibility
export const base44 = {
    // Photos (entities)
    entities: {
        photos: {
            getAll: () => photosAPI.getAll().then(res => res.photos || []),
            get: (id) => photosAPI.getById(id).then(res => res.photo),
            create: (data) => photosAPI.create(data).then(res => res.photo),
            update: (id, data) => photosAPI.update(id, data).then(res => res.photo),
            delete: (id) => photosAPI.delete(id),
        },
        Photo: {
            // Alias for photos
            filter: (query) => photosAPI.getAll().then(res => res.photos || []),
            create: (data) => photosAPI.create(data).then(res => res.photo),
        },
        cart: {
            getAll: () => cartAPI.getAll().then(res => res.items || []),
            create: (data) => cartAPI.add(data).then(res => res.item),
            update: (id, data) => cartAPI.update(id, data).then(res => res.item),
            delete: (id) => cartAPI.remove(id),
            remove: (id) => cartAPI.remove(id), // Alias for delete
            clear: () => cartAPI.clear(),
        },
        CartItem: {
            // Alias for cart
            filter: (query) => cartAPI.getAll().then(res => res.items || []),
            create: (data) => cartAPI.add(data).then(res => res.item),
        },
        orders: {
            getAll: () => ordersAPI.getAll().then(res => res.orders || []),
            get: (id) => ordersAPI.getById(id).then(res => res.order),
            create: (data) => ordersAPI.create(data).then(res => res.order),
        }
    },

    // Functions (file upload)
    functions: {
        upload: (file) => uploadAPI.single(file),
        uploadMultiple: (files) => uploadAPI.multiple(files),
    },

    // Integrations (legacy upload)
    integrations: {
        Core: {
            UploadFile: async ({ file }) => {
                // Upload file and return old format
                const result = await uploadAPI.single(file);
                return {
                    file_url: result.url,
                    path: result.path,
                    fileName: result.fileName
                };
            }
        }
    },

    // Process image with n8n
    processImage: (file, options, onProgress) => processImageAPI.process(file, options, onProgress),

    // Auth
    auth: {
        signUp: (email, password, fullName) => authAPI.signUp(email, password, fullName),
        signIn: (email, password) => authAPI.signIn(email, password),
        signOut: () => authAPI.signOut(),
        getUser: () => authAPI.getUser(),
        me: () => authAPI.getUser(), // Alias for getUser
        isAuthenticated: async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                return !!session;
            } catch {
                return false;
            }
        },
        redirectToLogin: (returnUrl) => {
            const url = returnUrl ? `/Login?returnUrl=${encodeURIComponent(returnUrl)}` : '/Login';
            window.location.href = url;
        },
        onAuthStateChange: (callback) => authAPI.onAuthStateChange(callback),
    }
};

// Also export everything from client for direct use
export * from './client';
