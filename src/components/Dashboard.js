import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import Layout from '../layout';
import Main from '../pages/Main';

const Dashboard = () => {
  return (
    <>
      <ToastContainer position='top-right' />
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Main />} />
        </Route>
      </Routes>
    </>
  );
};

export default Dashboard;
