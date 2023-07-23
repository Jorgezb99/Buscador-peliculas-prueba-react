import React, { useState, useEffect, useCallback } from 'react';
import './style/buscador.css';

export const Buscadorpeliculas = () => {
  const urlBase = 'https://api.themoviedb.org/3/search/movie';
  const API_KEY = '44aa1defe5a8285a7222fe42b5103452';

  const [busqueda, setBusqueda] = useState('');
  const [peliculas, setPeliculas] = useState([]);
  const [favoritos, setFavoritos] = useState([]);
  const [bloqueados, setBloqueados] = useState([]);

  // Cargar datos desde el almacenamiento local al cargar la página
  useEffect(() => {
    const storedFavorites = JSON.parse(localStorage.getItem('favoritos'));
    const storedBlocked = JSON.parse(localStorage.getItem('bloqueados'));

    if (storedFavorites) {
      setFavoritos(storedFavorites);
    }

    if (storedBlocked) {
      setBloqueados(storedBlocked);
    }
  }, []);

  // Guardar datos en el almacenamiento local al cambiar los listados de favoritos y bloqueados
  useEffect(() => {
    localStorage.setItem('favoritos', JSON.stringify(favoritos));
  }, [favoritos]);

  useEffect(() => {
    localStorage.setItem('bloqueados', JSON.stringify(bloqueados));
  }, [bloqueados]);

  const handleInputChange = (e) => {
    setBusqueda(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchPeliculas();
  };

  const fetchPeliculas = useCallback(async () => {
    try {
      const response = await fetch(`${urlBase}?query=${busqueda}&api_key=${API_KEY}&language=es`);
      const data = await response.json();
      const peliculasConEstado = data.results.map((pelicula) => ({
        ...pelicula,
        isFavorite: favoritos.some((fav) => fav.id === pelicula.id),
        isBlocked: bloqueados.some((blq) => blq.id === pelicula.id),
      }));
      setPeliculas(peliculasConEstado);
    } catch (error) {
      console.error('Ha ocurrido un error: ', error);
    }
  }, [busqueda, favoritos, bloqueados]);

  useEffect(() => {
    fetchPeliculas();
  }, [fetchPeliculas]);

  const toggleFavorite = (id) => {
    setFavoritos((prevFavorites) => {
      const updatedFavorites = prevFavorites.some((fav) => fav.id === id)
        ? prevFavorites.filter((fav) => fav.id !== id)
        : [...prevFavorites, peliculas.find((pelicula) => pelicula.id === id)];

      setPeliculas((prevPeliculas) =>
        prevPeliculas.map((pelicula) =>
          pelicula.id === id ? { ...pelicula, isFavorite: !pelicula.isFavorite } : pelicula
        )
      );

      return updatedFavorites;
    });
  };

  const toggleBlocked = (id) => {
    setBloqueados((prevBlocked) => {
      const updatedBlocked = prevBlocked.some((blq) => blq.id === id)
        ? prevBlocked.filter((blq) => blq.id !== id)
        : [...prevBlocked, peliculas.find((pelicula) => pelicula.id === id)];

      setPeliculas((prevPeliculas) =>
        prevPeliculas.map((pelicula) =>
          pelicula.id === id ? { ...pelicula, isBlocked: !pelicula.isBlocked } : pelicula
        )
      );

      return updatedBlocked;
    });
  };

  const removeFromFavorites = (id) => {
    setFavoritos((prevFavorites) => prevFavorites.filter((fav) => fav.id !== id));

    setPeliculas((prevPeliculas) =>
      prevPeliculas.map((pelicula) =>
        pelicula.id === id ? { ...pelicula, isFavorite: false } : pelicula
      )
    );
  };

  const removeFromBlocked = (id) => {
    setBloqueados((prevBlocked) => prevBlocked.filter((blq) => blq.id !== id));

    setPeliculas((prevPeliculas) =>
      prevPeliculas.map((pelicula) =>
        pelicula.id === id ? { ...pelicula, isBlocked: false } : pelicula
      )
    );
  };

  return (
    <div className="container">
      <h1 className="title">Buscador de Películas</h1>
      <form className="form-container" onSubmit={handleSubmit}>
        <div className="input-container">
          <input
            type="text"
            placeholder="Escribe el nombre de una película"
            value={busqueda}
            onChange={handleInputChange}
          />
          <button type="submit" className="search-button">
            Buscar
          </button>
        </div>
      </form>

      <div className="content">
        <div className="movie-list">
          {peliculas.map((pelicula) => (
            <div
              key={pelicula.id}
              className={`movie-card ${pelicula.isBlocked ? 'blocked' : ''}`}
              onMouseEnter={() => setPeliculas((prevPeliculas) =>
                prevPeliculas.map((p) => (p.id === pelicula.id ? { ...p, isHovered: true } : p))
              )}
              onMouseLeave={() => setPeliculas((prevPeliculas) =>
                prevPeliculas.map((p) => (p.id === pelicula.id ? { ...p, isHovered: false } : p))
              )}
              style={{
                boxShadow: pelicula.isHovered
                  ? '0 0 10px rgba(0, 0, 0, 0.5)'
                  : pelicula.isFavorite
                  ? '0 0 5px rgba(255, 0, 0, 0.8)'
                  : 'none',
              }}
            >
              <img src={`https://image.tmdb.org/t/p/w500${pelicula.poster_path}`} alt={pelicula.title} />
              <div className="movie-details">
                <h2>{pelicula.title}</h2>
                <p className="overview">{pelicula.overview}</p>
                <div className="buttons-container">
                  <button
                    className={`favorite-button ${pelicula.isFavorite ? 'favorited' : ''}`}
                    onClick={() => toggleFavorite(pelicula.id)}
                  >
                    {pelicula.isFavorite ? 'Quitar de favoritos' : 'Marcar como favorito'}
                  </button>
                  <button
                    className={`block-button ${pelicula.isBlocked ? 'blocked' : ''}`}
                    onClick={() => toggleBlocked(pelicula.id)}
                  >
                    {pelicula.isBlocked ? 'Desbloquear' : 'Bloquear'}
                  </button>
                  {pelicula.isFavorite && (
                    
                    <button
                      className="remove-button"
                      onClick={() => removeFromFavorites(pelicula.id)}
                    >
                      Eliminar de favoritos
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="sidebar">
          <div className="favorites-list">
            <h2>Favoritos</h2>
            {favoritos.map((pelicula) => (
              <div key={pelicula.id} className="favorite-card">
                <img src={`https://image.tmdb.org/t/p/w500${pelicula.poster_path}`} alt={pelicula.title} />
                <h3>{pelicula.title}</h3>
                <button className="remove-button" onClick={() => removeFromFavorites(pelicula.id)}>
                  Eliminar de favoritos
                </button>
              </div>
            ))}
          </div>

          <div className="blocked-list">
            <h2>Bloqueados</h2>
            {bloqueados.map((pelicula) => (
              <div key={pelicula.id} className="blocked-card">
                <img src={`https://image.tmdb.org/t/p/w500${pelicula.poster_path}`} alt={pelicula.title} />
                <h3>{pelicula.title}</h3>
                <button className="remove-button" onClick={() => removeFromBlocked(pelicula.id)}>
                  Eliminar de bloqueados 
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
