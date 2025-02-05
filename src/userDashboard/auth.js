import { jwtDecode } from "jwt-decode";


const getDecodedToken = () => {
    const token = localStorage.getItem('authtoken');
    console.log("token is "+token);
    if (!token) return null;
    try {
      return jwtDecode(token);
    } catch (error) {
      return null;
    }
  };

  export default getDecodedToken;