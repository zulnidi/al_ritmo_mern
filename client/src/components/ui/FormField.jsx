/** Campo de formulario accesible: etiqueta, input y mensaje de error enlazados. */
export default function FormField({ id, label, error, required = false, ...inputProps }) {
  const errorId = `${id}-error`;
  return (
    <div className="form-group">
      <label htmlFor={id}>
        {label}
        {required && ' *'}
      </label>
      <input
        id={id}
        name={id}
        type="text"
        className={error ? 'error' : ''}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? errorId : undefined}
        {...inputProps}
      />
      {error && (
        <div id={errorId} className="error-message" role="alert">
          {error}
        </div>
      )}
    </div>
  );
}
