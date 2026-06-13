import { useState } from 'react';
import Button from '../../common/Button/Button';
import Select from '../../common/Select/Select';
import './EditDeclarationForm.css';

const monthOptions = [
  { value: '1', label: 'Enero' },
  { value: '2', label: 'Febrero' },
  { value: '3', label: 'Marzo' },
  { value: '4', label: 'Abril' },
  { value: '5', label: 'Mayo' },
  { value: '6', label: 'Junio' },
  { value: '7', label: 'Julio' },
  { value: '8', label: 'Agosto' },
  { value: '9', label: 'Setiembre' },
  { value: '10', label: 'Octubre' },
  { value: '11', label: 'Noviembre' },
  { value: '12', label: 'Diciembre' },
];

const regimenOptions = [
  { value: '1', label: 'Especial' },
  { value: '2', label: 'General' },
  { value: '3', label: 'Mype' },
];

const getTasaIrByRegimenId = (regimenId) => {
  const id = Number(regimenId);

  if (id === 1 || id === 2) return 1.5;
  if (id === 3) return 1;

  return '';
};

const EditDeclarationForm = ({
  initialValues,
  onSubmit,
  loading = false,
  submitText = 'Actualizar declaración',
}) => {
  const [form, setForm] = useState({
    cliente_id: initialValues?.cliente_id || '',
    regimen_id: initialValues?.regimen_id || '',
    anio: initialValues?.anio || new Date().getFullYear(),
    mes: initialValues?.mes || '',
    sire: Boolean(initialValues?.sire),
    tasa_ir: initialValues?.tasa_ir || getTasaIrByRegimenId(initialValues?.regimen_id),
    detraccion: initialValues?.detraccion || 0,
    precio_final: initialValues?.precio_final || 0,
    precio_pagado: initialValues?.precio_pagado || 0,
    observaciones: initialValues?.observaciones || '',
  });

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleRegimenChange = (value) => {
    setForm((prev) => ({
      ...prev,
      regimen_id: value,
      tasa_ir: getTasaIrByRegimenId(value),
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    onSubmit({
      cliente_id: Number(form.cliente_id),
      regimen_id: Number(form.regimen_id),
      anio: Number(form.anio),
      mes: Number(form.mes),
      sire: Boolean(form.sire),
      tasa_ir: Number(form.tasa_ir || 0),
      detraccion: Number(form.detraccion || 0),
      precio_final: Number(form.precio_final || 0),
      precio_pagado: Number(form.precio_pagado || 0),
      observaciones: form.observaciones || null,
    });
  };

  return (
    <form className="edit-declaration-form" onSubmit={handleSubmit}>
      <div className="edit-declaration-form-grid">
        <label>
          Mes
          <Select
            value={String(form.mes || '')}
            onChange={(value) =>
              setForm((prev) => ({
                ...prev,
                mes: value,
              }))
            }
            placeholder="Seleccionar mes"
            options={monthOptions}
          />
        </label>

        <label>
          Año
          <input
            type="number"
            name="anio"
            value={form.anio}
            onChange={handleChange}
            min="2020"
            required
          />
        </label>

        <label>
          Régimen
          <Select
            value={String(form.regimen_id || '')}
            onChange={handleRegimenChange}
            placeholder="Seleccionar régimen"
            options={regimenOptions}
          />
        </label>

        <label>
          Tasa IR aplicada %
          <input
            type="number"
            name="tasa_ir"
            value={form.tasa_ir}
            readOnly
            step="0.01"
          />
        </label>

        <label>
          Detracción
          <input
            type="number"
            name="detraccion"
            value={form.detraccion}
            onChange={handleChange}
            step="0.01"
            min="0"
          />
        </label>

        <label>
          Precio final
          <input
            type="number"
            name="precio_final"
            value={form.precio_final}
            onChange={handleChange}
            step="0.01"
            min="0"
          />
        </label>

        <label>
          Precio pagado
          <input
            type="number"
            name="precio_pagado"
            value={form.precio_pagado}
            onChange={handleChange}
            step="0.01"
            min="0"
          />
        </label>

        <label className="edit-declaration-checkbox">
          <input
            type="checkbox"
            name="sire"
            checked={form.sire}
            onChange={handleChange}
          />
          SIRE presentado
        </label>

        <label className="edit-declaration-form-full">
          Observaciones
          <textarea
            name="observaciones"
            value={form.observaciones}
            onChange={handleChange}
            rows="3"
          />
        </label>
      </div>

      <div className="edit-declaration-form-actions">
        <Button type="submit" disabled={loading}>
          {loading ? 'Actualizando...' : submitText}
        </Button>
      </div>
    </form>
  );
};

export default EditDeclarationForm;