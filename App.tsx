import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { ErrorPage } from './pages/ErrorPage';
import { ShowcasePage } from './pages/ShowcasePage';
import { RootLayout } from './components/layout';
import { ProjectDetailPage } from './pages/ProjectDetailPage';

const router = createBrowserRouter([
    {
        path: "/",
        element: <RootLayout />,
        errorElement: <ErrorPage />,
        children: [
            {
                index: true,
                element: <Navigate to="/home" replace />,
            },
            {
                path: 'home',
                element: <HomePage />,
            },
            {
                path: 'showcase',
                element: <ShowcasePage />,
            },
            {
                path: 'showcase/:id',
                element: <ProjectDetailPage />,
            }
        ],
    },
]);

const App: React.FC = () => {
    return <RouterProvider router={router} />;
};

export default App;
