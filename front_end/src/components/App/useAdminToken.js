import { useState } from 'react';

export default function useAdminToken() {
  const getadminToken = () => {
    const tokenString = sessionStorage.getItem('admintoken');
    return tokenString
  };

  const [admintoken, setadminToken] = useState(getadminToken());

  const saveadminToken = adminhostToken => {
    sessionStorage.setItem('admintoken', adminhostToken);
    setadminToken(adminhostToken.admintoken);
  };

  return {
    setadminToken: saveadminToken,
    admintoken
  }
}