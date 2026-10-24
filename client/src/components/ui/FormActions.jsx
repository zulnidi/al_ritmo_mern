import { useNavigate } from 'react-router-dom';

export default function FormActions({ submitting, isEdit }) {
  const navigate = useNavigate();
  return (
    <div className="form-actions">
      <button type="submit" className="btn btn-primary" disabled={submitting}>
        {submitting ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear'}
      </button>
      <button
        type="button"
        className="btn btn-secondary"
        onClick={() => navigate('/')}
        disabled={submitting}
      >
        Cancelar
      </button>
    </div>
  );
}
