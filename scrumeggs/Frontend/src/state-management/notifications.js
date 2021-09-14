
import React from 'react';
import { useEffect } from "react";
import { authFetch } from "../authentication/auth";
import { invitations, invisible } from '../state-management/atoms';
import { useRecoilState } from 'recoil';

// Maintains number of invitations to connect from other users
export default function GetInvites ()  {
  const [invs, setInvs] = useRecoilState(invitations);
  const [invis, setInvis] = useRecoilState(invisible);

  const getInv = async () => {
    const requestOptionsInvitations = {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' , 'Accept': 'application/json'},
    }

    const urlInv = '/invitations'
    const responseI = await authFetch(urlInv, requestOptionsInvitations)
    const numberOfInvites = await responseI.json();
    setInvs(numberOfInvites);
    if (numberOfInvites > 0) {
      setInvis(false);
    }
    else {
      setInvis(true);
    }
    console.log('The number of invitations is', numberOfInvites)
    console.log('Visibility =', sessionStorage.getItem("invisible"))
  } 

  
  useEffect (() => {
    getInv();
  }, []);

return (
<>
</>
)
};

