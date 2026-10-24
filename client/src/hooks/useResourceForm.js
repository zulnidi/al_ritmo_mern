import { useCallback, useState } from 'react';
import { validate } from '../lib/validation';

/**
 * Estado y envío de un formulario CRUD: valores, errores por campo (locales y
 * del servidor), estado de envío y error general. Lo usan canciones y playlists.
 */
export function useResourceForm({ initialValues, schema, onSubmit }) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const setField = useCallback((name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => (prev[name] ? { ...prev, [name]: '' } : prev));
  }, []);

  const handleChange = (event) => setField(event.target.name, event.target.value);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const localErrors = validate(schema, values);
    if (Object.keys(localErrors).length > 0) {
      setErrors(localErrors);
      return;
    }
    setSubmitting(true);
    setFormError('');
    try {
      await onSubmit(values);
    } catch (err) {
      if (err.fields && Object.keys(err.fields).length > 0) setErrors(err.fields);
      else setFormError(err.message || 'No se pudo guardar');
    } finally {
      setSubmitting(false);
    }
  };

  return { values, setValues, setField, errors, submitting, formError, handleChange, handleSubmit };
}
