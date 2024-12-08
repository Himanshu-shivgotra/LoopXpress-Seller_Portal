import { useState, useEffect } from 'react';

interface PersonalDetails {
  fullName: string;
  email: string;
  phoneNumber: string;
  address: string;
  password: string;

}
interface BusinessDetails {
  businessName: string;
  businessType: string;
  businessPhone: string;
  businessEmail: string;
  gstNumber: string;
}
interface BankDetails {
  accountNumber: string;
  bankName: string;
  ifscCode: string;
}

interface UserInfo {
  _id: string;
  personalDetails: PersonalDetails;
  businessDetails: BusinessDetails;
  bankDetails: BankDetails;
}

interface UserInfoError {
  message: string;
}

const useUserInfo = () => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<UserInfoError | null>(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          throw new Error('User not authenticated. Please log in.');
        }

        const response = await fetch('http://localhost:5000/api/users/user-info', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch user info');
        }

        const data = await response.json();
        setUserInfo(data);
        setError(null); // Clear errors if successful
      } catch (err: any) {
        const message = err.message || 'Failed to fetch user info';
        setError({ message });
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  const updateUserInfo = async (updatedDetails: any) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('User not authenticated. Please log in.');

      // Remove password from updatedDetails if not changed
      if (!updatedDetails.personalDetails.password) {
        delete updatedDetails.personalDetails.password;
      }

      const response = await fetch('http://localhost:5000/api/users/update-user-info', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedDetails),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update user info');
      }

      const updatedUser = await response.json();
      setUserInfo(updatedUser); // Update the state

      // Invalidate the old JWT token if the password was updated
      if (updatedDetails.personalDetails.password) {
        localStorage.removeItem('authToken'); // Remove the old token
      }

      return updatedUser; // Return the updated user object
    } catch (err) {
      console.error('Error in updateUserInfo:', err.message);
      throw err;
    }
  };



  const refetch = () => {
    setLoading(true);
    setError(null);
    const fetchUserInfo = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          throw new Error('User not authenticated. Please log in.');
        }

        const response = await fetch('http://localhost:5000/api/users/user-info', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch user info');
        }

        const data = await response.json();
        setUserInfo(data);
        setError(null);
      } catch (err: any) {
        const message = err.message || 'Failed to fetch user info';
        setError({ message });
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  };

  return { userInfo, loading, error, updateUserInfo, refetch };
};

export default useUserInfo;
