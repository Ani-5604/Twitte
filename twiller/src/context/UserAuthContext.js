import { createContext, useContext, useEffect, useState } from "react";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut,
    GoogleAuthProvider,
    signInWithPopup,
} from "firebase/auth";
import { auth } from "./firbase"; // Ensure this points to the correct Firebase config file
import axios from "axios";

// Create the context
const UserAuthContext = createContext();

// Context Provider Component
export function UserAuthContextProvider({ children }) {
    const [user, setUser] = useState(null); // Default user is `null` for better handling of unauthenticated states
    const [loading, setLoading] = useState(true); // Useful for detecting auth state during initial load

    // Login Function
    function logIn(email, password) {
        return signInWithEmailAndPassword(auth, email, password)
            .catch((error) => {
                console.error("Login Error:", error.message);
                throw error; // Rethrow error for external handling
            });
    }

    // SignUp Function
    function signUp(email, password) {
        return createUserWithEmailAndPassword(auth, email, password)
            .catch((error) => {
                console.error("SignUp Error:", error.message);
                throw error; // Rethrow error for external handling
            });
    }

    // Logout Function
    function logOut() {
        return signOut(auth).catch((error) => {
            console.error("Logout Error:", error.message);
            throw error; // Rethrow error for external handling
        });
    }

    // Google Sign-In Function
    function googleSignIn() {
        const googleAuthProvider = new GoogleAuthProvider();
        return signInWithPopup(auth, googleAuthProvider)
            .catch((error) => {
                console.error("Google Sign-In Error:", error.message);
                throw error; // Rethrow error for external handling
            });
    }

    // Effect to Track Auth State
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            console.log("Auth State Changed:", currentUser);
            setUser(currentUser);
            setLoading(false); // Once we know auth state, we stop loading
        });

        return () => unsubscribe(); // Cleanup subscription on unmount
    }, []);

    // Follow a user
    async function followUser(followerEmail, followeeEmail) {
        try {
            const response = await axios.post("http://localhost:5000/follow", {
                followerEmail,
                followingEmail: followeeEmail, // Corrected variable name to match backend
            });
            return response.data;
        } catch (error) {
            console.error("Error following user:", error.message);
            throw error;
        }
    }

    // Unfollow a user
    async function unfollowUser(followerEmail, followeeEmail) {
        try {
            const response = await axios.post("http://localhost:5000/unfollow", {
                followerEmail,
                followingEmail: followeeEmail, // Corrected variable name to match backend
            });
            return response.data;
        } catch (error) {
            console.error("Error unfollowing user:", error.message);
            throw error;
        }
    }

    // Get followers and following
    async function getFollowersAndFollowing(email) {
        try {
            // Ensure the correct API endpoint is being used
            const followersResponse = await axios.get(`http://localhost:5000/followers?email=${email}`);
            const followingResponse = await axios.get(`http://localhost:5000/following?email=${email}`);
            return { followers: followersResponse.data, following: followingResponse.data };
        } catch (error) {
            console.error("Error fetching followers/following:", error.message);
            throw error;
        }
    }

    return (
        <UserAuthContext.Provider
            value={{
                user,
                logIn,
                signUp,
                logOut,
                googleSignIn,
                followUser,
                unfollowUser,
                getFollowersAndFollowing,
            }}
        >
            {!loading && children} {/* Render children only after loading */}
        </UserAuthContext.Provider>
    );
}

// Hook to Use the Context
export function useUserAuth() {
    return useContext(UserAuthContext);
}

// Default export for context provider
export default UserAuthContextProvider;
