
import React from 'react';
import { useEffect } from "react";
import { authFetch } from "../authentication/auth";

// Retrieves user's information
export default function NameSet() {
  const url = '/api/profile'
  const GetRequest = async () => {
    const response = await authFetch(url)
    const user = await response.json();

    console.log('User', user.firstName)
    sessionStorage.setItem("firstName", user.firstName);
    sessionStorage.setItem("lastName", user.lastName);
  }
  useEffect(() => {
    GetRequest();
  }, []);

return (
<>
</>
)
};

