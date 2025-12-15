import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
    return (
        <div className="not-found">
            <h2>404 - Página no encontrada</h2>
            <p>La página que buscas no existe.</p>
            <Link to="/" className="btn btn-primary">
                Volver al Inicio
            </Link>
        </div>
    );
};

export default NotFound;