import { useState } from 'react';
import Button from '../../common/Button/Button';
import './UserForm.css';

const initialState = {
  username: '',
  password: '',
  nombres: '',
  apellidos: '',
  correo: '',
  telefono: '',
  rol_id: '',
  activo: true,
};

const UserForm = ({
  initialValues = {},
  roles = [],
  onSubmit,
  submitText = 'Guardar',
  loading = false,
  isEdit = false,
}) => {
  const [form, setForm] = useState({
    ...initialState,
    ...initialValues,
    password: '',
    rol_id: initialValues.rol_id ? String(initialValues.rol_id) : '',
    activo: initialValues.activo ?? true,
  });

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const payload = {
      username: form.username.trim(),
      nombres: form.nombres.trim(),
      apellidos: form.apellidos.trim(),
      correo: form.correo.trim(),
      telefono: form.telefono.trim() || null,
      rol_id: Number(form.rol_id),
      activo: form.activo,
    };

    if (form.password.trim()) {
      payload.password = form.password;
    }

    onSubmit(payload);
  };

  return (
    <form className="user-form" onSubmit={handleSubmit}>
      <div className="user-form-grid">
        <label>
          Usuario
          <input
            name="username"
            value={form.username}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Contrasena {isEdit ? '(opcional)' : ''}
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required={!isEdit}
            autoComplete="new-password"
          />
        </label>

        <label>
          Nombres
          <input
            name="nombres"
            value={form.nombres}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Apellidos
          <input
            name="apellidos"
            value={form.apellidos}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Correo
          <input
            type="email"
            name="correo"
            value={form.correo}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Telefono
          <input
            name="telefono"
            value={form.telefono || ''}
            onChange={handleChange}
          />
        </label>

        <label>
          Rol
          <select
            name="rol_id"
            value={form.rol_id}
            onChange={handleChange}
            required
          >
            <option value="">Seleccionar</option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.nombre}
              </option>
            ))}
          </select>
        </label>

        <label className="user-form-check">
          <input
            type="checkbox"
            name="activo"
            checked={form.activo}
            onChange={handleChange}
          />
          Usuario activo
        </label>
      </div>

      <div className="user-form-actions">
        <Button type="submit" disabled={loading}>
          {loading ? 'Guardando...' : submitText}
        </Button>
      </div>
    </form>
  );
};

export default UserForm;
