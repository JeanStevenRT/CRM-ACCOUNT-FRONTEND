import { useCallback, useEffect, useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import {
  getControlRequest,
  upsertControlRequest,
  reorderControlRequest,
  getReferidosRequest,
  updateReferidoRequest,
  createReferidoRequest,
  deleteReferidoRequest,
} from '../../services/control.service';
import { createClientRequest, getClientsRequest } from '../../services/clients.service';
import { exportControlExcel } from '../../utils/exportControlExcel';
import { parseControlExcel } from '../../utils/importControlExcel';
import Modal from '../../components/common/Modal/Modal';
import ClientForm from '../../components/forms/clientForm/ClientForm';
import ControlHeader from '../../components/control/ControlHeader';
import ControlTabs from '../../components/control/ControlTabs';
import ControlStats from '../../components/control/ControlStats';
import ControlClientsTable from '../../components/control/ControlClientsTable';
import ControlReferralsTable from '../../components/control/ControlReferralsTable';
import ReferralModal from '../../components/control/ReferralModal';
import './Control.css';

const MESES = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre',
];

const FILTROS = [
  { key: 'todos',          label: 'Todos' },
  { key: 'falta_sire',     label: 'Falta SIRE' },
  { key: 'falta_declarar', label: 'Falta declarar' },
  { key: 'con_deuda',      label: 'Con deuda' },
];

const now = new Date();

// ─── Stat Card ────────────────────────────────────────────────────────────────
const Control = () => {
  const [anio, setAnio]     = useState(now.getFullYear());
  const [mes, setMes]       = useState(now.getMonth() + 1);
  const [filtro, setFiltro] = useState('todos');
  const [buscar, setBuscar] = useState('');
  const [tab, setTab]       = useState('activos');

  const [stats, setStats]         = useState(null);
  const [clientes, setClientes]   = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 15,
    totalPages: 0,
  });
  const [referidos, setReferidos] = useState([]);
  const [refStats, setRefStats]   = useState(null);
  const [loading, setLoading]     = useState(false);
  const [reordering, setReordering] = useState(false);
  const [draggedClientId, setDraggedClientId] = useState(null);
  const [dragOverClientId, setDragOverClientId] = useState(null);
  const [importing, setImporting]   = useState(false);
  const [importMsg, setImportMsg]   = useState('');
  const [newClientOpen, setNewClientOpen] = useState(false);
  const [clientLoading, setClientLoading] = useState(false);
  const importRef = useRef();

  // ── Referidos state ────────────────────────────────────────────────────────
  const [newRefOpen, setNewRefOpen]     = useState(false);
  const [refLoading, setRefLoading]     = useState(false);
  const [clientesList, setClientesList] = useState([]);
  const [refForm, setRefForm]           = useState({
    referido: null,
    sponsor:  null,
    referido_pago: '',
    descuento: '',
  });
  const importRefRef = useRef();

  // ── Fetch control ──────────────────────────────────────────────────────────
  const fetchControl = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getControlRequest({
        anio,
        mes,
        filtro,
        buscar,
        page: pagination.page,
        limit: pagination.limit,
      });
      setStats(data.stats);
      setClientes(data.clientes);
      setPagination(data.pagination);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [anio, mes, filtro, buscar, pagination.page, pagination.limit]);

  const fetchReferidos = useCallback(async () => {
    try {
      const data = await getReferidosRequest({ anio, mes });
      setReferidos(data.referidos);
      setRefStats(data.stats);
    } catch (e) {
      console.error(e);
    }
  }, [anio, mes]);

  const fetchClientesList = useCallback(async () => {
    try {
      const data = await getClientsRequest({ search: '', page: 1, limit: 500 });
      setClientesList(data.clients || data.data || []);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => { fetchControl(); }, [fetchControl]);
  useEffect(() => {
    if (tab === 'referidos') {
      fetchReferidos();
      fetchClientesList();
    }
  }, [tab, fetchReferidos, fetchClientesList]);

  const handleDragStart = (event, clienteId) => {
    if (reordering) return;

    const normalizedClientId = String(clienteId);

    setDraggedClientId(normalizedClientId);
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', normalizedClientId);
  };

  const handleDropClient = async (event, targetClientId) => {
    event.preventDefault();

    const sourceClientId = String(
      event.dataTransfer.getData('text/plain') || draggedClientId
    );
    const normalizedTargetId = String(targetClientId);

    setDragOverClientId(null);
    setDraggedClientId(null);

    if (!sourceClientId || sourceClientId === normalizedTargetId || reordering) {
      return;
    }

    const sourceIndex = clientes.findIndex(
      cliente => String(cliente.id) === sourceClientId
    );
    const targetIndex = clientes.findIndex(
      cliente => String(cliente.id) === normalizedTargetId
    );

    if (sourceIndex < 0 || targetIndex < 0) return;

    const previousClients = clientes;
    const reorderedClients = [...clientes];
    const [movedClient] = reorderedClients.splice(sourceIndex, 1);
    reorderedClients.splice(targetIndex, 0, movedClient);

    setClientes(reorderedClients);

    try {
      setReordering(true);
      await reorderControlRequest(reorderedClients.map(cliente => cliente.id));
      await fetchControl();
    } catch (error) {
      setClientes(previousClients);
      alert(error.response?.data?.message || 'No se pudo guardar el nuevo orden');
    } finally {
      setReordering(false);
    }
  };

  // ── Update inline (clientes) ───────────────────────────────────────────────
  const updateField = async (clienteId, field, value) => {
    const cliente = clientes.find(c => c.id === clienteId);
    if (!cliente) return;

    const payload = {
      pago:           cliente.pago,
      precio:         cliente.precio,
      cobrado:        cliente.cobrado,
      referido_monto: cliente.referido_monto,
      sire:           cliente.sire,
      pdt_621:        cliente.pdt_621,
      observaciones:  cliente.observaciones,
      [field]:        value,
    };

    setClientes(prev =>
      prev.map(c => c.id === clienteId
        ? { ...c, [field]: value, deuda: calcDeuda({ ...c, [field]: value }) }
        : c
      )
    );

    try {
      await upsertControlRequest(clienteId, { anio, mes, ...payload });
      fetchControl();
    } catch (e) {
      console.error(e);
      fetchControl();
    }
  };

  const calcDeuda = (c) => {
    const precio  = parseFloat(c.precio  || 0);
    const cobrado = parseFloat(c.cobrado || 0);
    const ref     = parseFloat(c.referido_monto || 0);
    return precio - cobrado - ref;
  };

  // ── Referido field update ──────────────────────────────────────────────────
  const updateRefField = async (id, field, value) => {
    setReferidos(prev =>
      prev.map(r => r.id === id ? { ...r, [field]: value } : r)
    );
    try {
      await updateReferidoRequest(id, { [field]: value });
      fetchReferidos();
      fetchControl();
    } catch (e) {
      console.error(e);
      fetchReferidos();
    }
  };

  // ── Delete referido ────────────────────────────────────────────────────────
  const handleDeleteReferido = async (id) => {
    if (!window.confirm('¿Eliminar este referido?')) return;
    try {
      await deleteReferidoRequest(id);
      fetchReferidos();
      fetchControl();
    } catch (e) {
      alert('Error al eliminar: ' + (e.response?.data?.message || e.message));
    }
  };

  // ── Nuevo cliente (con opción de registrar referido) ──────────────────────
  const handleCreateClient = async (formData) => {
    // Extraer datos de referido antes de enviar al API de clientes
    const { _esReferido, _sponsorId, _pagoRef, ...clientData } = formData;

    try {
      setClientLoading(true);
      const nuevoCliente = await createClientRequest(clientData);
      const nuevoId = nuevoCliente?.client?.id || nuevoCliente?.id;

      // Si viene referido, registrar en la tabla referidos
      if (_esReferido === 'SI' && _sponsorId && nuevoId) {
        const sponsor = clientesList.find(c => c.id === Number(_sponsorId));
        try {
          await createReferidoRequest({
            anio, mes,
            referido_id:     nuevoId,
            referido_nombre: `${clientData.nombres} ${clientData.apellidos || ''}`.trim(),
            referido_ruc:    clientData.ruc || '',
            sponsor_id:      Number(_sponsorId),
            sponsor_nombre:  sponsor ? `${sponsor.nombres} ${sponsor.apellidos || ''}`.trim() : '',
            sponsor_ruc:     sponsor?.ruc || '',
            referido_pago:   _pagoRef || 0,
            descuento:       (_pagoRef || 0) * 0.5,
            cobrado:         'NO',
          });
        } catch (refErr) {
          console.warn('Cliente creado pero error al registrar referido:', refErr);
          alert('Cliente creado ✅ — pero no se pudo registrar el referido. Agrégalo manualmente en la tab Referidos.');
        }
      }

      setNewClientOpen(false);
      fetchControl();
      if (tab === 'referidos' || _esReferido === 'SI') fetchReferidos();
    } catch (e) {
      alert(e.response?.data?.message || 'Error al crear cliente');
    } finally {
      setClientLoading(false);
    }
  };

  // ── Nuevo referido ─────────────────────────────────────────────────────────
  const handleCreateReferido = async () => {
    const { referido, sponsor, referido_pago, descuento } = refForm;
    if (!referido) return alert('Selecciona el cliente referido.');
    if (!sponsor)  return alert('Selecciona el sponsor.');
    if (!referido_pago || isNaN(Number(referido_pago))) return alert('Ingresa el pago del referido.');

    const pago = parseFloat(referido_pago);
    const desc = descuento !== '' ? parseFloat(descuento) : pago * 0.5;

    try {
      setRefLoading(true);
      await createReferidoRequest({
        anio, mes,
        referido_id:     referido.id,
        referido_nombre: `${referido.nombres} ${referido.apellidos || ''}`.trim(),
        referido_ruc:    referido.ruc,
        sponsor_id:      sponsor.id,
        sponsor_nombre:  `${sponsor.nombres} ${sponsor.apellidos || ''}`.trim(),
        sponsor_ruc:     sponsor.ruc,
        referido_pago:   pago,
        descuento:       desc,
        cobrado:         'NO',
      });
      setNewRefOpen(false);
      setRefForm({ referido: null, sponsor: null, referido_pago: '', descuento: '' });
      fetchReferidos();
      fetchControl();
    } catch (e) {
      alert(e.response?.data?.message || 'Error al crear referido');
    } finally {
      setRefLoading(false);
    }
  };

  // ── Exportar Excel ─────────────────────────────────────────────────────────
  const handleExport = async () => {
    try {
      const data = await getControlRequest({
        anio,
        mes,
        filtro,
        buscar,
        page: 1,
        limit: 10000,
      });

      if (!data.clientes.length) {
        alert('No hay datos para exportar.');
        return;
      }

      await exportControlExcel({
        clientes: data.clientes,
        stats: data.stats,
        anio,
        mes,
      });
    } catch (e) {
      alert('Error exportando: ' + e.message);
    }
  };

  // ── Importar Excel (clientes) ──────────────────────────────────────────────
  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    setImporting(true);
    setImportMsg('Leyendo Excel...');
    try {
      const { filas, hoja } = await parseControlExcel(file, mes);
      if (!filas.length) throw new Error('No se encontraron filas con RUC válido.');
      setImportMsg(`Importando ${filas.length} filas de hoja "${hoja}"...`);
      const controlCompleto = await getControlRequest({
        anio,
        mes,
        filtro: 'todos',
        buscar: '',
        page: 1,
        limit: 10000,
      });
      const clienteMap = {};
      controlCompleto.clientes.forEach(c => { clienteMap[c.ruc] = c.id; });
      let ok = 0, skip = 0;
      for (const fila of filas) {
        const clienteId = clienteMap[fila.ruc];
        if (!clienteId) { skip++; continue; }
        const payload = {};
        if (fila.pago           !== null) payload.pago           = fila.pago;
        if (fila.precio         !== null) payload.precio         = fila.precio;
        if (fila.cobrado        !== null) payload.cobrado        = fila.cobrado;
        if (fila.referido_monto !== null) payload.referido_monto = fila.referido_monto;
        if (fila.sire           !== null) payload.sire           = fila.sire;
        if (fila.pdt_621        !== null) payload.pdt_621        = fila.pdt_621;
        if (fila.observaciones  !== null) payload.observaciones  = fila.observaciones;
        try { await upsertControlRequest(clienteId, { anio, mes, ...payload }); ok++; }
        catch { skip++; }
      }
      setImportMsg(`✅ ${ok} clientes actualizados${skip ? `, ${skip} omitidos` : ''}.`);
      fetchControl();
    } catch (err) {
      setImportMsg('❌ ' + err.message);
    } finally {
      setImporting(false);
      setTimeout(() => setImportMsg(''), 6000);
    }
  };

  // ── Importar Referidos Excel ───────────────────────────────────────────────
  const handleImportReferidos = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    setImporting(true);
    setImportMsg('Leyendo Excel de referidos...');

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const wb = XLSX.read(evt.target.result, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });
        if (!rows.length) throw new Error('El archivo está vacío.');

        // Build RUC → cliente map
        const allClients = clientesList.length ? clientesList : clientes;
        const rucMap = {};
        allClients.forEach(c => { rucMap[String(c.ruc).trim()] = c; });

        const normH = (v) => String(v || '').trim().toUpperCase();
        const headers = Object.keys(rows[0]);
        const findH = (...cands) => headers.find(h => cands.includes(normH(h)));

        const colRefRuc  = findH('RUC REFERIDO','REFERIDO RUC','RUC_REFERIDO','RUC REF','REFERIDO');
        const colSponRuc = findH('RUC SPONSOR','SPONSOR RUC','RUC_SPONSOR','SPONSOR');
        const colPago    = findH('PAGO','PAGO S/','PAGO REF','REFERIDO PAGO');
        const colDesc    = findH('DESCUENTO','DESC','DESCUENTO S/');

        if (!colRefRuc)  throw new Error('No se encontró columna "RUC REFERIDO" o "REFERIDO".');
        if (!colSponRuc) throw new Error('No se encontró columna "RUC SPONSOR" o "SPONSOR".');

        let ok = 0, skip = 0;
        for (const row of rows) {
          const refRuc  = String(row[colRefRuc]  || '').trim();
          const sponRuc = String(row[colSponRuc] || '').trim();
          if (!refRuc || !sponRuc) { skip++; continue; }
          const refC  = rucMap[refRuc];
          const sponC = rucMap[sponRuc];
          if (!refC || !sponC) { skip++; continue; }
          const pago = parseFloat(String(row[colPago] || '0').replace(/[^\d.-]/g,'')) || 0;
          const desc = colDesc
            ? parseFloat(String(row[colDesc] || '0').replace(/[^\d.-]/g,'')) || pago * 0.5
            : pago * 0.5;
          try {
            await createReferidoRequest({
              anio, mes,
              referido_id: refC.id,
              referido_nombre: `${refC.nombres} ${refC.apellidos || ''}`.trim(),
              referido_ruc: refC.ruc,
              sponsor_id: sponC.id,
              sponsor_nombre: `${sponC.nombres} ${sponC.apellidos || ''}`.trim(),
              sponsor_ruc: sponC.ruc,
              referido_pago: pago,
              descuento: desc,
              cobrado: 'NO',
            });
            ok++;
          } catch { skip++; }
        }
        setImportMsg(`✅ ${ok} referidos importados${skip ? `, ${skip} omitidos` : ''}.`);
        fetchReferidos();
        fetchControl();
      } catch (err) {
        setImportMsg('❌ ' + err.message);
      } finally {
        setImporting(false);
        setTimeout(() => setImportMsg(''), 6000);
      }
    };
    reader.onerror = () => {
      setImportMsg('❌ No se pudo leer el archivo.');
      setImporting(false);
    };
    reader.readAsArrayBuffer(file);
  };

  const years = [];
  for (let y = 2024; y <= now.getFullYear() + 1; y++) years.push(y);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <section className="ctrl-page">

      <ControlHeader
        activeTab={tab}
        months={MESES}
        years={years}
        month={mes}
        year={anio}
        search={buscar}
        loading={loading}
        importing={importing}
        hasClients={clientes.length > 0}
        clientImportRef={importRef}
        referralImportRef={importRefRef}
        onMonthChange={(value) => {
          setMes(value);
          setPagination((current) => ({ ...current, page: 1 }));
        }}
        onYearChange={(value) => {
          setAnio(value);
          setPagination((current) => ({ ...current, page: 1 }));
        }}
        onSearchChange={(value) => {
          setBuscar(value);
          setPagination((current) => ({ ...current, page: 1 }));
        }}
        onNewClient={() => {
          fetchClientesList();
          setNewClientOpen(true);
        }}
        onNewReferral={() => {
          fetchClientesList();
          setNewRefOpen(true);
        }}
        onExport={handleExport}
        onImportClients={handleImport}
        onImportReferrals={handleImportReferidos}
      />

      {importMsg && (
        <div className={`ctrl-import-msg ${importMsg.startsWith('✅') ? 'ok' : importMsg.startsWith('❌') ? 'err' : ''}`}>
          {importMsg}
        </div>
      )}

      <ControlTabs activeTab={tab} onChange={setTab} />

      {/* ══ TAB ACTIVOS ══ */}
      {tab === 'activos' && (
        <>
          {stats && (
            <ControlStats
              items={[
                { label: 'REPARTIDORES', value: stats.total },
                { label: 'PAGARON', value: stats.pagaron, color: 'green' },
                { label: 'NO PAGARON', value: stats.no_pagaron, color: 'red' },
                { label: 'COBRADO', value: `S/${stats.cobrado.toFixed(2)}`, color: 'green' },
                { label: 'POR COBRAR', value: `S/${stats.por_cobrar.toFixed(2)}`, color: 'orange' },
                { label: 'FALTA SIRE', value: stats.falta_sire, color: 'red' },
                { label: 'FALTA DECLARAR', value: stats.falta_declarar, color: 'red' },
                { label: 'DEUDA TOTAL', value: `S/${stats.deuda_total.toFixed(2)}`, color: 'red' },
              ]}
            />
          )}

          <div className="ctrl-filters">
            {FILTROS.map(f => (
              <button
                key={f.key}
                className={`ctrl-filter-btn ${filtro === f.key ? 'active' : ''}`}
                onClick={() => {
                  setFiltro(f.key);
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          <ControlClientsTable
            clients={clientes}
            loading={loading}
            pagination={pagination}
            reordering={reordering}
            draggedClientId={draggedClientId}
            dragOverClientId={dragOverClientId}
            onDragStart={handleDragStart}
            onDragOver={(event, clientId) => {
              event.preventDefault();
              event.dataTransfer.dropEffect = 'move';
              setDragOverClientId(String(clientId));
            }}
            onDragLeave={(clientId) => {
              if (dragOverClientId === String(clientId)) {
                setDragOverClientId(null);
              }
            }}
            onDragEnd={() => {
              setDraggedClientId(null);
              setDragOverClientId(null);
            }}
            onDrop={handleDropClient}
            onUpdateField={updateField}
            onPageChange={(page) =>
              setPagination((current) => ({ ...current, page }))
            }
          />
        </>
      )}

      {/* ══ TAB REFERIDOS ══ */}
      {tab === 'referidos' && (
        <div className="ctrl-referidos">
          {refStats && (
            <ControlStats
              items={[
                {
                  label: 'REFERIDOS DEL MES',
                  value: Number.parseInt(refStats.total),
                },
                {
                  label: 'DESCUENTO COBRADO',
                  value: `S/${Number(refStats.cobrado || 0).toFixed(2)}`,
                  color: 'green',
                },
                {
                  label: 'DESCUENTO PENDIENTE',
                  value: `S/${Number(refStats.pendiente || 0).toFixed(2)}`,
                  color: 'orange',
                },
              ]}
            />
          )}

          <ControlReferralsTable
            referrals={referidos}
            onUpdate={updateRefField}
            onDelete={handleDeleteReferido}
          />
        </div>
      )}

      {/* ── Modal nuevo cliente ── */}
      <Modal
        open={newClientOpen}
        title="Nuevo cliente"
        onClose={() => setNewClientOpen(false)}
        size="lg"
      >
        <ClientForm
          submitText="Crear cliente"
          loading={clientLoading}
          onSubmit={handleCreateClient}
          showReferidoOption={true}
          clientes={clientesList.length ? clientesList : clientes}
        />
      </Modal>

      <ReferralModal
        open={newRefOpen}
        monthName={MESES[mes - 1]}
        year={anio}
        form={refForm}
        clients={clientesList}
        loading={refLoading}
        onChange={(changes) =>
          setRefForm((current) => ({ ...current, ...changes }))
        }
        onClose={() => setNewRefOpen(false)}
        onSubmit={handleCreateReferido}
      />

    </section>
  );
};

export default Control;
