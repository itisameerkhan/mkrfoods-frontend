import { doc, setDoc, updateDoc, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';

/**
 * Firestore User Document Structure:
 * /users/{uid}
 * {
 *   uid: string,
 *   name: string,
 *   email: string,
 *   mobile: string,
 *   photoURL?: string,
 *   verified: boolean,
 *   createdAt: timestamp,
 *   updatedAt: timestamp,
 *   addresses: [
 *     {
 *       id: string,
 *       type: 'home' | 'work' | 'other',
 *       street: string,
 *       city: string,
 *       state: string,
 *       postalCode: string,
 *       country: string,
 *       isDefault: boolean,
 *       createdAt: timestamp
 *     }
 *   ],
 *   orderHistory: [
 *     {
 *       orderId: string,
 *       total: number,
 *       status: 'pending' | 'processing' | 'shipped' | 'delivered',
 *       createdAt: timestamp
 *     }
 *   ]
 * }
 */

// Update user mobile number
export const updateUserMobile = async (uid, mobile) => {
    try {
        await updateDoc(doc(db, 'users', uid), {
            mobile,
            updatedAt: new Date().toISOString(),
        });
        return { success: true };
    } catch (error) {
        console.error('Error updating mobile:', error);
        throw error;
    }
};

// Add a new address
export const addUserAddress = async (uid, address) => {
    try {
        const addressWithId = {
            id: Date.now().toString(),
            ...address,
            createdAt: new Date().toISOString(),
        };

        await updateDoc(doc(db, 'users', uid), {
            addresses: arrayUnion(addressWithId),
            updatedAt: new Date().toISOString(),
        });
        return { success: true, address: addressWithId };
    } catch (error) {
        console.error('Error adding address:', error);
        throw error;
    }
};

// Update an existing address
export const updateUserAddress = async (uid, addressId, updatedAddress) => {
    try {
        const userDoc = await getDoc(doc(db, 'users', uid));
        const addresses = userDoc.data().addresses || [];

        // Remove old address and add updated one
        const oldAddress = addresses.find(a => a.id === addressId);
        if (oldAddress) {
            await updateDoc(doc(db, 'users', uid), {
                addresses: arrayRemove(oldAddress),
            });
        }

        const newAddress = {
            ...oldAddress,
            ...updatedAddress,
            updatedAt: new Date().toISOString(),
        };

        await updateDoc(doc(db, 'users', uid), {
            addresses: arrayUnion(newAddress),
            updatedAt: new Date().toISOString(),
        });

        return { success: true, address: newAddress };
    } catch (error) {
        console.error('Error updating address:', error);
        throw error;
    }
};

// Remove an address
export const removeUserAddress = async (uid, addressId) => {
    try {
        const userDoc = await getDoc(doc(db, 'users', uid));
        const addresses = userDoc.data().addresses || [];
        const addressToRemove = addresses.find(a => a.id === addressId);

        if (addressToRemove) {
            await updateDoc(doc(db, 'users', uid), {
                addresses: arrayRemove(addressToRemove),
                updatedAt: new Date().toISOString(),
            });
        }

        return { success: true };
    } catch (error) {
        console.error('Error removing address:', error);
        throw error;
    }
};

// Add order to history
export const addOrderToHistory = async (uid, order) => {
    try {
        const orderWithTimestamp = {
            ...order,
            createdAt: new Date().toISOString(),
        };

        await updateDoc(doc(db, 'users', uid), {
            orderHistory: arrayUnion(orderWithTimestamp),
            updatedAt: new Date().toISOString(),
        });

        return { success: true, order: orderWithTimestamp };
    } catch (error) {
        console.error('Error adding order:', error);
        throw error;
    }
};

// Get user profile
export const getUserProfile = async (uid) => {
    try {
        const userDoc = await getDoc(doc(db, 'users', uid));
        if (userDoc.exists()) {
            return userDoc.data();
        }
        return null;
    } catch (error) {
        console.error('Error fetching user profile:', error);
        throw error;
    }
};

// Update general user info
export const updateUserProfile = async (uid, updates) => {
    try {
        await updateDoc(doc(db, 'users', uid), {
            ...updates,
            updatedAt: new Date().toISOString(),
        });
        return { success: true };
    } catch (error) {
        console.error('Error updating profile:', error);
        throw error;
    }
};
