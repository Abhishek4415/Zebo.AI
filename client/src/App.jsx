import React from 'react';
import {Route, Routes} from 'react-router-dom';
import Home from "./pages/Home"
import Auth from "./pages/Auth"
import { useEffect } from 'react';
import axios from 'axios';
import serverUrl from './config.js';
import { useDispatch } from 'react-redux';
import { setUserData } from './redux/userSlice.js';

function App() {
  //get user
  const dispatch = useDispatch();
  useEffect(() => {
    const getUser = async () => {
      try {
        const response = await axios.get( serverUrl + "/api/user/current-user", {
          withCredentials: true // Include cookies in the request
        });
        dispatch(setUserData(response.data));
        
        console.log(response.data);
      
      } catch (error) {
        console.error('Error fetching user:', error);
        dispatch(setUserData(null)); // Clear user data on error
      }
    }
    getUser();
  }, [dispatch]);

  return (
    <Routes>
      <Route path='/' element = {<Home/>} />
      <Route path='/auth' element = {<Auth/>} />
    </Routes>
  )
}

export default App