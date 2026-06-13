import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    username: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);
      setError('');

      await login(form);

      navigate('/dashboard', { replace: true });
    } catch (error) {
      setError(error.response?.data?.message || 'Error al iniciar sesion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <div className="login-mark" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>

        <div className="login-heading">
          <h1>Account CRM</h1>
          <p>Ingresa tus credenciales para continuar</p>
        </div>

        <label className="login-field">
          <span className="login-field-icon" aria-hidden="true">
            @
          </span>
          <input
            type="text"
            name="username"
            value={form.username}
            onChange={handleChange}
            placeholder="Usuario"
            autoComplete="username"
          />
        </label>

        <label className="login-field">
          <span className="login-field-icon" aria-hidden="true">
            #
          </span>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Contraseña"
            autoComplete="current-password"
          />
        </label>

        {error && <div className="login-error">{error}</div>}

        <button type="submit" disabled={loading}>
          {loading ? 'Ingresando...' : 'Entrar'}
        </button>
      </form>
    </section>
  );
};

export default Login;
