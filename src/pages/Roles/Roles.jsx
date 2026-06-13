import { useCallback, useEffect, useState } from 'react';
import Button from '../../components/common/Button/Button';
import IconButton from '../../components/common/IconButton/IconButton';
import Modal from '../../components/common/Modal/Modal';
import RoleForm from '../../components/forms/RoleForm/RoleForm';
import { EditIcon, TrashIcon } from '../../components/common/Icons/Icons';
import {
  createRoleRequest,
  deleteRoleRequest,
  getRolesRequest,
  updateRoleRequest,
} from '../../services/users.service';
import './Roles.css';

const Roles = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedRole, setSelectedRole] = useState(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const fetchRoles = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getRolesRequest();
      setRoles(response.data);
    } catch (error) {
      setError(error.response?.data?.message || 'Error al cargar roles');
    } finally {
      setLoading(false);
    }
  }, []);

  const closeModals = () => {
    setSelectedRole(null);
    setCreateModalOpen(false);
    setEditModalOpen(false);
    setDeleteModalOpen(false);
  };

  const handleCreateRole = async (formData) => {
    try {
      setActionLoading(true);
      await createRoleRequest(formData);
      closeModals();
      await fetchRoles();
    } catch (error) {
      alert(error.response?.data?.message || 'Error al crear rol');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateRole = async (formData) => {
    try {
      setActionLoading(true);
      await updateRoleRequest(selectedRole.id, formData);
      closeModals();
      await fetchRoles();
    } catch (error) {
      alert(error.response?.data?.message || 'Error al actualizar rol');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteRole = async () => {
    try {
      setActionLoading(true);
      await deleteRoleRequest(selectedRole.id);
      closeModals();
      await fetchRoles();
    } catch (error) {
      alert(error.response?.data?.message || 'Error al eliminar rol');
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  return (
    <section className="roles-page">
      <div className="roles-header">
        <div>
          <h1>Roles</h1>
          <p>Administra los roles disponibles para los usuarios del sistema.</p>
        </div>

        <Button onClick={() => setCreateModalOpen(true)}>
          Nuevo rol
        </Button>
      </div>

      <div className="roles-card">
        {error && <div className="roles-error">{error}</div>}

        <div className="roles-table-wrapper">
          <table className="roles-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Rol</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="3" className="table-empty">Cargando roles...</td>
                </tr>
              ) : roles.length === 0 ? (
                <tr>
                  <td colSpan="3" className="table-empty">No hay roles registrados</td>
                </tr>
              ) : (
                roles.map((role) => (
                  <tr key={role.id}>
                    <td>{role.id}</td>
                    <td>
                      <span className="roles-name">{role.nombre}</span>
                    </td>
                    <td>
                      <div className="roles-actions">
                        <IconButton
                          title="Editar rol"
                          variant="edit"
                          onClick={() => {
                            setSelectedRole(role);
                            setEditModalOpen(true);
                          }}
                        >
                          <EditIcon />
                        </IconButton>

                        <IconButton
                          title="Eliminar rol"
                          variant="danger"
                          onClick={() => {
                            setSelectedRole(role);
                            setDeleteModalOpen(true);
                          }}
                        >
                          <TrashIcon />
                        </IconButton>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={createModalOpen} title="Nuevo rol" onClose={closeModals} size="sm">
        <RoleForm
          submitText="Crear rol"
          loading={actionLoading}
          onSubmit={handleCreateRole}
        />
      </Modal>

      <Modal open={editModalOpen} title="Editar rol" onClose={closeModals} size="sm">
        {selectedRole && (
          <RoleForm
            initialValues={selectedRole}
            submitText="Actualizar rol"
            loading={actionLoading}
            onSubmit={handleUpdateRole}
          />
        )}
      </Modal>

      <Modal
        open={deleteModalOpen}
        title="Confirmar eliminacion"
        onClose={closeModals}
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={closeModals} disabled={actionLoading}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleDeleteRole} disabled={actionLoading}>
              {actionLoading ? 'Eliminando...' : 'Si, eliminar'}
            </Button>
          </>
        }
      >
        {selectedRole && (
          <p className="roles-delete-message">
            Seguro que deseas eliminar el rol <strong>{selectedRole.nombre}</strong>? No se podra eliminar si esta asignado a usuarios.
          </p>
        )}
      </Modal>
    </section>
  );
};

export default Roles;
