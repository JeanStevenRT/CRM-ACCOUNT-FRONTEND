import { useCallback, useEffect, useState } from 'react';
import SearchInput from '../../components/common/SearchInput/SearchInput';
import Pagination from '../../components/common/Pagination/Pagination';
import Button from '../../components/common/Button/Button';
import IconButton from '../../components/common/IconButton/IconButton';
import Modal from '../../components/common/Modal/Modal';
import UserForm from '../../components/forms/UserForm/UserForm';
import { EditIcon, EyeIcon, TrashIcon } from '../../components/common/Icons/Icons';
import { useDebounce } from '../../hooks/useDebounce';
import {
  createUserRequest,
  deleteUserRequest,
  getRolesRequest,
  getUsersRequest,
  updateUserRequest,
} from '../../services/users.service';
import './Users.css';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const debouncedSearch = useDebounce(search, 400);

  const fetchRoles = useCallback(async () => {
    const response = await getRolesRequest();
    setRoles(response.data);
  }, []);

  const fetchUsers = useCallback(async ({ page = 1, searchValue = debouncedSearch } = {}) => {
    try {
      setLoading(true);
      setError('');

      const response = await getUsersRequest({
        search: searchValue,
        page,
        limit: pagination.limit,
      });

      setUsers(response.data);
      setPagination(response.pagination);
    } catch (error) {
      setError(error.response?.data?.message || 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, pagination.limit]);

  const closeModals = () => {
    setSelectedUser(null);
    setCreateModalOpen(false);
    setEditModalOpen(false);
    setViewModalOpen(false);
    setDeleteModalOpen(false);
  };

  const handleCreateUser = async (formData) => {
    try {
      setActionLoading(true);
      await createUserRequest(formData);
      closeModals();
      await fetchUsers({ page: 1, searchValue: debouncedSearch });
    } catch (error) {
      alert(error.response?.data?.message || 'Error al crear usuario');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateUser = async (formData) => {
    try {
      setActionLoading(true);
      await updateUserRequest(selectedUser.id, formData);
      closeModals();
      await fetchUsers({ page: pagination.page, searchValue: debouncedSearch });
    } catch (error) {
      alert(error.response?.data?.message || 'Error al actualizar usuario');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    try {
      setActionLoading(true);
      await deleteUserRequest(selectedUser.id);
      closeModals();
      await fetchUsers({ page: pagination.page, searchValue: debouncedSearch });
    } catch (error) {
      alert(error.response?.data?.message || 'Error al eliminar usuario');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSearchChange = (value) => {
    setSearch(value);
    setPagination((prev) => ({
      ...prev,
      page: 1,
    }));
  };

  useEffect(() => {
    fetchRoles().catch((error) => {
      setError(error.response?.data?.message || 'Error al cargar roles');
    });
  }, [fetchRoles]);

  useEffect(() => {
    fetchUsers({ page: 1, searchValue: debouncedSearch });
  }, [debouncedSearch, fetchUsers]);

  return (
    <section className="users-page">
      <div className="users-header">
        <div>
          <h1>Usuarios</h1>
          <p>Crea, edita, desactiva y revisa los usuarios del sistema.</p>
        </div>

        <Button onClick={() => setCreateModalOpen(true)}>
          Nuevo usuario
        </Button>
      </div>

      <div className="users-card">
        <div className="users-toolbar">
          <SearchInput
            value={search}
            onChange={handleSearchChange}
            placeholder="Buscar por usuario, nombres, correo o rol"
          />

          <div className="users-summary">
            <span>Total: {pagination.total} usuarios</span>
            <span>Pagina {pagination.page} de {pagination.totalPages || 1}</span>
          </div>
        </div>

        {error && <div className="users-error">{error}</div>}

        <div className="users-table-wrapper">
          <table className="users-table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Telefono</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="table-empty">Cargando usuarios...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="7" className="table-empty">No se encontraron usuarios</td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <strong>{user.username}</strong>
                      <small>ID: {user.id}</small>
                    </td>
                    <td>{user.nombres} {user.apellidos}</td>
                    <td>{user.correo}</td>
                    <td>{user.telefono || '-'}</td>
                    <td>
                      <span className="users-role">{user.rol}</span>
                    </td>
                    <td>
                      <span className={user.activo ? 'users-status active' : 'users-status inactive'}>
                        {user.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td>
                      <div className="users-actions">
                        <IconButton
                          title="Ver usuario"
                          variant="view"
                          onClick={() => {
                            setSelectedUser(user);
                            setViewModalOpen(true);
                          }}
                        >
                          <EyeIcon />
                        </IconButton>

                        <IconButton
                          title="Editar usuario"
                          variant="edit"
                          onClick={() => {
                            setSelectedUser(user);
                            setEditModalOpen(true);
                          }}
                        >
                          <EditIcon />
                        </IconButton>

                        <IconButton
                          title="Eliminar usuario"
                          variant="danger"
                          onClick={() => {
                            setSelectedUser(user);
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

        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={(nextPage) => fetchUsers({ page: nextPage, searchValue: debouncedSearch })}
        />
      </div>

      <Modal open={createModalOpen} title="Nuevo usuario" onClose={closeModals} size="lg">
        <UserForm
          roles={roles}
          submitText="Crear usuario"
          loading={actionLoading}
          onSubmit={handleCreateUser}
        />
      </Modal>

      <Modal open={editModalOpen} title="Editar usuario" onClose={closeModals} size="lg">
        {selectedUser && (
          <UserForm
            initialValues={selectedUser}
            roles={roles}
            submitText="Actualizar usuario"
            loading={actionLoading}
            isEdit
            onSubmit={handleUpdateUser}
          />
        )}
      </Modal>

      <Modal
        open={viewModalOpen}
        title="Datos del usuario"
        onClose={closeModals}
        size="md"
        footer={<Button variant="secondary" onClick={closeModals}>Cerrar</Button>}
      >
        {selectedUser && (
          <div className="user-detail">
            <div>
              <span>Usuario</span>
              <strong>{selectedUser.username}</strong>
            </div>
            <div>
              <span>Rol</span>
              <strong>{selectedUser.rol}</strong>
            </div>
            <div>
              <span>Nombres</span>
              <strong>{selectedUser.nombres}</strong>
            </div>
            <div>
              <span>Apellidos</span>
              <strong>{selectedUser.apellidos}</strong>
            </div>
            <div>
              <span>Correo</span>
              <strong>{selectedUser.correo}</strong>
            </div>
            <div>
              <span>Telefono</span>
              <strong>{selectedUser.telefono || '-'}</strong>
            </div>
            <div>
              <span>Estado</span>
              <strong>{selectedUser.activo ? 'Activo' : 'Inactivo'}</strong>
            </div>
          </div>
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
            <Button variant="danger" onClick={handleDeleteUser} disabled={actionLoading}>
              {actionLoading ? 'Eliminando...' : 'Si, eliminar'}
            </Button>
          </>
        }
      >
        {selectedUser && (
          <p className="users-delete-message">
            El usuario <strong>{selectedUser.username}</strong> sera desactivado y no podra iniciar sesion.
          </p>
        )}
      </Modal>
    </section>
  );
};

export default Users;
