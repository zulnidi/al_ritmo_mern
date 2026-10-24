import { Link } from 'react-router-dom';
import { useCallback, useState } from 'react';
import { useAsyncData } from '../hooks/useAsyncData';

/**
 * Sección de listado reutilizable (cabecera + estados de carga/error/vacío +
 * tarjetas con editar/eliminar). Canciones y playlists solo aportan su
 * servicio y cómo se dibuja el contenido de cada tarjeta.
 */
export default function ResourceSection({
  title,
  newLabel,
  newPath,
  editPath,
  service,
  emptyText,
  deleteConfirm,
  renderItem,
  className,
}) {
  const loader = useCallback(() => service.getAll(), [service]);
  const { data, loading, error, reload } = useAsyncData(loader, []);
  const [actionError, setActionError] = useState('');

  const handleDelete = async (id) => {
    if (!window.confirm(deleteConfirm)) return;
    try {
      await service.delete(id);
      setActionError('');
      await reload();
    } catch (err) {
      setActionError(err.message || 'No se pudo eliminar');
    }
  };

  return (
    <section className={className} aria-label={title}>
      <div className="header">
        <h2>{title}</h2>
        <Link to={newPath} className="btn btn-primary">
          {newLabel}
        </Link>
      </div>

      {actionError && (
        <div className="alert alert-danger" role="alert">
          {actionError}
        </div>
      )}
      {loading && <div className="loading">Cargando...</div>}
      {!loading && error && (
        <div className="error" role="alert">
          {error}{' '}
          <button type="button" className="btn btn-small" onClick={reload}>
            Reintentar
          </button>
        </div>
      )}
      {!loading && !error && data.length === 0 && <p>{emptyText}</p>}
      {!loading && !error && data.length > 0 && (
        <ul className="cards">
          {data.map((item) => (
            <li key={item._id} className="card">
              <div className="card-info">{renderItem(item)}</div>
              <div className="card-actions">
                <Link
                  to={editPath(item._id)}
                  className="btn btn-edit"
                  aria-label={`Editar ${item.title || item.name}`}
                >
                  Editar
                </Link>
                <button
                  type="button"
                  className="btn btn-delete"
                  aria-label={`Eliminar ${item.title || item.name}`}
                  onClick={() => handleDelete(item._id)}
                >
                  Eliminar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
