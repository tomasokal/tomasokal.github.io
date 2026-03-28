const projects = [
  {
    id: 'PROJECT_001',
    title: 'FORTUNATO',
    description:
      'Tile-based game based on Cask of Amontillado. Escape as Fortunato in a procedural grid-based dungeon. Made with Three.js and R3F with collaboration with Will Bonnell.',
    url: 'https://tomasokal.com/fortunato',
    thumbnail: '/images/creations/fortunato.webp',
    icon: 'sports_esports',
    featured: true,
  },
  {
    id: 'PROJECT_002',
    title: 'TOGGLE_SWITCH',
    description:
      'Simple toggle switch made in Three.js using base geometric forms. Experiment in materiality, lighting, and interaction. Click to toggle state.',
    url: 'https://tomasokal.com/toggleSwitch',
    thumbnail: '/images/creations/toggleSwitch.webp',
    icon: 'toggle_on',
    featured: false,
  },
  {
    id: 'PROJECT_003',
    title: 'GRID_1',
    description:
      'Experiment in grid-based generation and interaction using Three.js. Click to change shape and spacing as well as interact with grid and surrounding grid cells.',
    url: 'https://tomasokal.com/grid-1',
    thumbnail: '/images/creations/grid-1.webp',
    icon: 'grid_view',
    featured: false,
  },
  {
    id: 'PROJECT_004',
    title: 'SCIFI_1',
    description:
      'Experiment with vehicle movement in Three.js. Use WASD to drift craft around scene.',
    url: 'https://tomasokal.com/scifi-1',
    thumbnail: '/images/creations/scifi-1.webp',
    icon: 'rocket_launch',
    featured: false,
  },
];

export default function Creations() {
  const featured = projects.find((p) => p.featured);
  const sidebar = projects.find((p) => p.id === 'PROJECT_002');
  const grid = projects.filter(
    (p) => !p.featured && p.id !== 'PROJECT_002'
  );

  return (
    <main className="creations-page">
      {/* Section Header */}
      <div className="creations-header">
        <div className="creations-header-left">
          <p className="creations-ref">INDEX_REF: 2024.CR.01</p>
          <h1 className="creations-title">CREATIONS</h1>
        </div>
        <div className="creations-header-right">
          <p>
            A recorded log of digital artifacts and personal projects.
          </p>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="creations-grid">
        {/* Featured project — spans 8 cols */}
        {featured && (
          <a
            href={featured.url}
            target="_blank"
            rel="noopener noreferrer"
            className="creation-card creation-featured"
          >
            <div className="creation-preview">
              <img
                src={featured.thumbnail}
                alt={featured.title}
                className="creation-preview-img"
                loading="lazy"
              />
              <div className="creation-preview-overlay">
                <span className="material-symbols-outlined">open_in_new</span>
              </div>
            </div>
            <div className="creation-featured-body">
              <div className="creation-featured-meta">
                <span className="creation-badge">{featured.id}</span>
                <span className="creation-divider" />
                <span className="creation-coord">THREE.JS / WEBGL</span>
              </div>
              <h3 className="creation-card-title creation-card-title--lg">
                {featured.title}
              </h3>
              <p className="creation-card-desc">{featured.description}</p>
              <span className="creation-explore">LAUNCH_EXPERIENCE</span>
            </div>
          </a>
        )}

        {/* Sidebar column — spans 4 cols */}
        <div className="creation-sidebar-col">
          {sidebar && (
            <a
              href={sidebar.url}
              target="_blank"
              rel="noopener noreferrer"
              className="creation-card creation-sidebar-card"
            >
              <div className="creation-grid-card-header">
                <span className="creation-badge">{sidebar.id}</span>
                {sidebar.icon && (
                  <span className="material-symbols-outlined creation-grid-icon">
                    {sidebar.icon}
                  </span>
                )}
              </div>
              <div className="creation-preview creation-preview--square">
                <img
                  src={sidebar.thumbnail}
                  alt={sidebar.title}
                  className="creation-preview-img"
                  loading="lazy"
                />
                <div className="creation-preview-overlay">
                  <span className="material-symbols-outlined">open_in_new</span>
                </div>
              </div>
              <h3 className="creation-card-title">{sidebar.title}</h3>
              <p className="creation-card-desc">{sidebar.description}</p>
            </a>
          )}

          <div className="creation-archive-block">
            <span className="material-symbols-outlined creation-archive-icon">
              architecture
            </span>
            <div>
              <h3 className="creation-archive-title">CODE REPOSITORY</h3>
              <p className="creation-archive-desc">
                Github catalog of software projects, scripts, and generative experiments.
              </p>
              <a
                href="https://github.com/tomasokal"
                target="_blank"
                rel="noopener noreferrer"
                className="creation-archive-btn"
              >
                ACCESS_CODE
              </a>
            </div>
          </div>
        </div>

        {/* Bottom row: equal-width cards */}
        {grid.map((project) => (
          <a
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            key={project.id}
            className="creation-card creation-grid-card"
          >
            <div className="creation-grid-card-header">
              <span className="creation-badge">{project.id}</span>
              {project.icon && (
                <span className="material-symbols-outlined creation-grid-icon">
                  {project.icon}
                </span>
              )}
            </div>
            <div className="creation-preview creation-preview--landscape">
              <img
                src={project.thumbnail}
                alt={project.title}
                className="creation-preview-img"
                loading="lazy"
              />
              <div className="creation-preview-overlay">
                <span className="material-symbols-outlined">open_in_new</span>
              </div>
            </div>
            <h3 className="creation-card-title">{project.title}</h3>
            <p className="creation-card-desc">{project.description}</p>
          </a>
        ))}
      </div>

    </main>
  );
}
