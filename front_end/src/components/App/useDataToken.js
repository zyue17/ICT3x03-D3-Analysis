import { useState } from 'react';

export default function useDataToken() {
  const getDataToken = () => {
    const tokenString = sessionStorage.getItem('dataToken');
    return tokenString;
  };

  const [dataToken, setDataToken] = useState(getDataToken());

  const saveDataToken = userDataToken => {
    sessionStorage.setItem('dataToken', userDataToken);
    setDataToken(userDataToken.dataToken);
  };

  return {
    setDataToken: saveDataToken,
    dataToken
  }
}