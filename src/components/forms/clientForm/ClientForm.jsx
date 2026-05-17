import { useState } from 'react';
import Button from '../../common/Button/Button';
import './ClientForm.css';

const initialState = {
  tipo_cliente_id: '',
  regimen_id: '',
  nombres: '',
  apellidos: '',
  ruc: '',
  dni: '',
  correo: '',
  telefono: '',
  direccion: '',
};

const ClientForm = ({
  initialValues = initialState,
  onSubmit,
  submitText = 'Guardar',
  loading = false,
}) => {
  const [form, setForm] = useState({
    ...initialState,
    ...initialValues,
  });

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    onSubmit({
      ...form,
      tipo_cliente_id: Number(form.tipo_cliente_id),
      regimen_id: Number(form.regimen_id),
    });
  };

  return (
    <form className="client-form" onSubmit={handleSubmit}>
      <div className="client-form-grid">
        <label>
          Tipo de cliente
          <select
            name="tipo_cliente_id"
            value={form.tipo_cliente_id}
            onChange={handleChange}
            required
          >
            <option value="">Seleccionar</option>
            <option value="1">Datadriver</option>
            <option value="2">Taxista</option>
            <option value="3">Negocio</option>
          </select>
        </label>

        <label>
          Régimen
          <select
            name="regimen_id"
            value={form.regimen_id}
            onChange={handleChange}
            required
          >
            <option value="">Seleccionar</option>
            <option value="1">Especial</option>
            <option value="2">General</option>
            <option value="3">Mype</option>
          </select>
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
            value={form.apellidos || ''}
            onChange={handleChange}
          />
        </label>

        <label>
          RUC
          <input
            name="ruc"
            value={form.ruc || ''}
            onChange={handleChange}
            maxLength="11"
          />
        </label>

        <label>
          DNI
          <input
            name="dni"
            value={form.dni || ''}
            onChange={handleChange}
            maxLength="8"
          />
        </label>

        <label>
          Correo
          <input
            type="email"
            name="correo"
            value={form.correo || ''}
            onChange={handleChange}
          />
        </label>

        <label>
          Teléfono
          <input
            name="telefono"
            value={form.telefono || ''}
            onChange={handleChange}
          />
        </label>

        <label className="client-form-full">
          Dirección
          <input
            name="direccion"
            value={form.direccion || ''}
            onChange={handleChange}
          />
        </label>
      </div>

      <div className="client-form-actions">
        <Button type="submit" disabled={loading}>
          {loading ? 'Guardando...' : submitText}
        </Button>
      </div>
    </form>
  );
};

export default ClientForm;