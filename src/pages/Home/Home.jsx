import {
  FiAlertTriangle,
  FiArchive,
  FiArrowRight,
  FiBarChart2,
  FiBell,
  FiCheckCircle,
  FiCpu,
  FiDatabase,
  FiFileText,
  FiGrid,
  FiSearch,
  FiShield,
  FiTrendingUp,
} from 'react-icons/fi';

import heroImage from '../../assets/home-ai-agent.png';
import './Home.css';

const painPoints = [
  {
    icon: FiAlertTriangle,
    title: 'Revisión manual de comprobantes',
    text: 'Horas perdidas validando facturas una por una contra registros tributarios.',
  },
  {
    icon: FiArchive,
    title: 'Declaraciones repetitivas',
    text: 'Carga constante de archivos, periodos y reportes mensuales sin asistencia inteligente.',
  },
  {
    icon: FiGrid,
    title: 'Información dispersa',
    text: 'Datos entre Excel, sistemas de facturación y portales tributarios sin una vista central.',
  },
];

const features = [
  {
    icon: FiFileText,
    title: 'Apoyo en facturación',
    text: 'Control automático de comprobantes electrónicos, estados y observaciones.',
  },
  {
    icon: FiArchive,
    title: 'Organización de archivos',
    text: 'Clasificación inteligente de XML, PDF y reportes por cliente y periodo.',
  },
  {
    icon: FiShield,
    title: 'Asistencia SIRE',
    text: 'Validación automatizada de compras y ventas para reducir inconsistencias.',
  },
  {
    icon: FiSearch,
    title: 'Revisión de inconsistencias',
    text: 'Detección proactiva de errores en IGV, retenciones y registros mensuales.',
  },
  {
    icon: FiDatabase,
    title: 'Resumen por cliente',
    text: 'Vista ejecutiva del estado tributario de toda la cartera contable.',
  },
  {
    icon: FiBell,
    title: 'Alertas de vencimientos',
    text: 'Recordatorios inteligentes basados en cronogramas y obligaciones SUNAT.',
  },
];

const steps = [
  ['01', 'Conecta datos', 'Sincroniza archivos, ventas, compras y reportes tributarios.'],
  ['02', 'IA analiza', 'El agente procesa la información con reglas contables.'],
  ['03', 'Detecta', 'Encuentra pendientes, riesgos y errores frecuentes.'],
  ['04', 'Ejecuta', 'Sugiere acciones y prepara el cierre mensual con orden.'],
];

const outcomes = [
  ['Ahorro de tiempo', 'Reduce tareas manuales de digitación y validación.'],
  ['Menos errores', 'Precisión técnica impulsada por modelos de IA especializados.'],
  ['Mejor control', 'Visibilidad del estado fiscal de cada cliente en tiempo real.'],
  ['Procesos ordenados', 'Flujo de trabajo estandarizado para todo el equipo contable.'],
  ['Mayor productividad', 'Atiende más clientes sin aumentar tu carga operativa.'],
  ['Atención más rápida', 'Respuestas y reportes inmediatos para clientes finales.'],
];

const audiences = [
  ['Contadores independientes', 'Gestiona clientes y cierres sin contratar personal adicional.'],
  ['Estudios contables', 'Ordena grandes carteras con procesos uniformes y trazabilidad.'],
  ['Empresas con volumen', 'Analiza conciliación, facturación y reportes SUNAT en menos tiempo.'],
  ['Asesores tributarios', 'Convierte datos operativos en alertas y criterios de revisión.'],
];

const insightItems = [
  'Clientes con comprobantes pendientes',
  'Inconsistencia detectada en ventas',
  'Declaración SIRE próxima a vencer',
];

const Home = () => {
  return (
    <main className="home-page">
      <header className="home-nav">
        <a className="home-brand" href="#inicio" aria-label="ContalA Agent inicio">
          ContalA Agent
        </a>
        <nav className="home-nav-links" aria-label="Navegación principal">
          <a href="#inicio">Inicio</a>
          <a href="#funciones">Funciones</a>
          <a href="#beneficios">Beneficios</a>
          <a href="#proceso">Cómo funciona</a>
          <a href="#contacto">Contacto</a>
        </nav>
        <a className="home-demo-button" href="#contacto">
          Solicitar demo
        </a>
      </header>

      <section className="home-hero home-section-grid" id="inicio">
        <div className="home-hero-content">
          <span className="home-kicker">
            <FiCpu aria-hidden="true" />
            Agente IA contable
          </span>
          <h1>Automatiza procesos contables con un agente de IA diseñado para contadores</h1>
          <p>
            Reduce tareas repetitivas, organiza información tributaria y agiliza procesos
            como facturación, SIRE y reportes para SUNAT desde una sola plataforma.
          </p>
          <div className="home-actions">
            <a className="home-primary-action" href="#contacto">Solicitar demo</a>
            <a className="home-secondary-action" href="#funciones">Ver funciones</a>
          </div>
        </div>
        <figure className="home-hero-visual">
          <img src={heroImage} alt="Dashboard oscuro de agente IA para procesos contables" />
        </figure>
      </section>

      <section className="home-section" aria-labelledby="problemas-title">
        <h2 id="problemas-title">Los procesos contables consumen demasiado tiempo</h2>
        <div className="home-card-grid home-card-grid-three">
          {painPoints.map((item) => {
            const Icon = item.icon;
            return (
              <article className="home-card home-pain-card" key={item.title}>
                <Icon aria-hidden="true" />
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="home-section home-section-panel" id="funciones" aria-labelledby="funciones-title">
        <div className="home-section-heading">
          <h2 id="funciones-title">Un agente de IA que trabaja como asistente contable</h2>
          <p>Centralizamos tu operación y automatizamos la detección de errores antes de que se conviertan en multas.</p>
        </div>
        <div className="home-card-grid home-feature-grid">
          {features.map((item) => {
            const Icon = item.icon;
            return (
              <article className="home-card home-feature-card" key={item.title}>
                <Icon aria-hidden="true" />
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="home-section" id="proceso" aria-labelledby="proceso-title">
        <h2 id="proceso-title">Simplicidad en cada paso</h2>
        <div className="home-steps">
          {steps.map(([number, title, text]) => (
            <article className="home-step" key={number}>
              <span>{number}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="home-section home-outcomes" id="beneficios" aria-label="Beneficios del agente IA">
        {outcomes.map(([title, text]) => (
          <article className="home-outcome" key={title}>
            <FiCheckCircle aria-hidden="true" />
            <div>
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          </article>
        ))}
      </section>

      <section className="home-section home-insights-section" aria-labelledby="insights-title">
        <form className="home-insight-form">
          <div className="home-form-title">
            <span />
            Generar Insight Contable
          </div>
          <div className="home-form-row">
            <label>
              Nombre del Cliente
              <input value="Importaciones S.A.C" readOnly />
            </label>
            <label>
              Tipo de Análisis
              <input value="Inconsistencia SIRE" readOnly />
            </label>
          </div>
          <label>
            ¿Qué deseas consultar con el Agente?
            <textarea value="Analiza las discrepancias en el registro de compras del periodo Octubre 2024." readOnly />
          </label>
          <div className="home-form-actions">
            <button type="button" className="home-ghost-button">Cancelar</button>
            <button type="button" className="home-light-button">Crear insight</button>
          </div>
        </form>

        <div className="home-insights-copy">
          <h2 id="insights-title">
            <FiBarChart2 aria-hidden="true" />
            Smart Insights
          </h2>
          <p>Nuestro agente identifica patrones críticos y sugiere acciones correctivas inmediatas para evitar contingencias.</p>
          <div className="home-insight-list">
            {insightItems.map((item) => (
              <a href="#contacto" key={item}>
                <span>{item}</span>
                <FiArrowRight aria-hidden="true" />
              </a>
            ))}
          </div>
          <a className="home-outline-action" href="#contacto">Explorar todos los insights</a>
        </div>
      </section>

      <section className="home-section" aria-labelledby="audiencia-title">
        <h2 id="audiencia-title">Pensado para contadores y estudios contables modernos</h2>
        <div className="home-card-grid home-audience-grid">
          {audiences.map(([title, text]) => (
            <article className="home-card home-audience-card" key={title}>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="home-cta" id="contacto">
        <FiTrendingUp aria-hidden="true" />
        <h2>Convierte tu gestión contable en un proceso más rápido, ordenado e inteligente</h2>
        <a className="home-primary-action" href="mailto:contacto@contalaagent.com">Solicitar una demo</a>
        <p>Empieza con una solución pensada para automatizar tareas contables reales del día a día.</p>
      </section>

      <footer className="home-footer">
        <div>
          <strong>ContalA Agent</strong>
          <p>Inteligencia de Vanguardia para el Sector Contable Peruano.</p>
          <small>© 2026 ContalA Agent. Todos los derechos reservados.</small>
        </div>
        <nav aria-label="Enlaces legales">
          <a href="#contacto">Privacidad</a>
          <a href="#contacto">Términos de Uso</a>
          <a href="#contacto">Seguridad</a>
          <a href="#contacto">Contacto</a>
        </nav>
      </footer>
    </main>
  );
};

export default Home;
