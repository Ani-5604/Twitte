import React, { useState, useEffect } from 'react';
import { CiSearch } from "react-icons/ci";
import Avatar from "react-avatar";
import { Link } from 'react-router-dom';
import { useUserAuth } from '../../../context/UserAuthContext';  // Import the context

const RightPanel = () => {
  const { user, followUser } = useUserAuth();  // Access the followUser function from context
  const [otherUsers, setOtherUsers] = useState([]); // State for other users

  // Fetch "Who to follow" users
  useEffect(() => {
    fetch('http://localhost:5000/users') // Replace with your API endpoint
      .then((res) => res.json())
      .then((data) => setOtherUsers(data))
      .catch((error) => console.error("Error fetching users:", error));
  }, []);

  // Handle follow action
  const handleFollow = async (followeeEmail) => {
    if (user.email === followeeEmail) {
      // Prevent user from following themselves
      alert("You cannot follow yourself!");
      return;
    }

    try {
      // Call followUser from context
      await followUser(user.email, followeeEmail);

      // Remove followed user from the "Who to follow" list
      setOtherUsers(prevUsers => prevUsers.filter(user => user.email !== followeeEmail));
    } catch (error) {
      console.error("Error following user:", error.message);
    }
  };

  return (
    <div className='w-[25%] min-w-[300px] p-2'>
      {/* Search Bar */}
      <div className='flex items-center p-2 bg-gray-100 rounded-full outline-none w-full border border-gray-300'>
        <CiSearch size="20px" />
        <input 
          type="text" 
          className='bg-transparent outline-none px-2 w-full' 
          placeholder='Search' 
          aria-label="Search"
        />
      </div>

      {/* Suggested Users Section */}
      <div className='p-4 bg-gray-100 rounded-2xl my-4'>
        <h3 className='font-bold text-lg'>Who to follow</h3>

        {/* Empty State */}
        {Array.isArray(otherUsers) && otherUsers.length === 0 ? (
          <p className='text-gray-500 mt-3'>No users available to follow.</p>
        ) : (
          otherUsers.map((user) => (
            <div key={user?._id} className='flex items-center justify-between my-3'>
              {/* User Info */}
              <div className='flex items-center'>
                <Avatar 
                  src={user?.profileImage || ''} 
                  name={user?.name || 'User'} 
                  size="40" 
                  round={true} 
                  alt={`${user?.name}'s avatar`}
                />
                <div className='ml-2'>
                  <h1 className='font-bold'>{user?.name}</h1>
                  <p className='text-sm text-gray-500'>{`@${user?.username}`}</p>
                </div>
              </div>

              {/* Profile and Follow Buttons */}
              <div className="flex items-center space-x-2">
                <Link to={`/profile/${user?._id}`}>
                  <button 
                    className='px-4 py-1 bg-black text-white rounded-full hover:bg-gray-800 transition-all duration-300'
                    aria-label={`View profile of ${user?.name}`}
                  >
                    Profile
                  </button>
                </Link>

                <button
                  className='px-4 py-1 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-all duration-300'
                  onClick={() => handleFollow(user?.email)}
                >
                  Follow
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RightPanel;
