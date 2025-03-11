import React from 'react';
import { createBrowserRouter, RouterProvider, Route, Routes, BrowserRouter } from "react-router-dom";
import { ThemeProvider, createTheme } from '@mui/material';
import Navbar from './shared/Navbar';
import Matches from './Matches';
import Search from './Search/Search';
import Blog from './Blog/index';
import Profile from './Profile';
import Settings from './Settings';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function AppContent() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Matches />} />
        <Route path="/matches" element={<Matches />} />
        <Route path="/search" element={<Search />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App; 