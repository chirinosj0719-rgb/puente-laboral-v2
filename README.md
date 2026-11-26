# Agéndalo

_Antes Puente Laboral._

App web para pedir trabajos informales de confianza: gasfiteros, niñeras, meseros, mudanzas y más.

- **Inmediato:** atención en minutos.
- **Programado:** eliges día y hora con anticipación, una vez o cada semana.
- **Mis trabajadores:** vuelves a contratar directo a quien te gustó.
- **Trabajadores (estilo Uber Driver):** registro con celular verificado y documentos, panel con mapa, solicitudes inmediatas, agenda y ganancias.
- **Empresas (estilo Rappi Aliados):** página `empresas.html` con registro por pasos y panel para asignar solicitudes a su equipo.
- **Cuenta:** ingresar y crear cuenta con celular (código SMS) o con correo y contraseña; menú con información personal, contraseña, historial, direcciones, favoritos, billetera, notificaciones, ajustes, información legal y Libro de Reclamaciones.
- **Mapa real de Lima:** la dirección se elige en el mapa (búsqueda, tu ubicación o mover el pin) y tiene que caer dentro de la zona de servicio. El trabajador llega por las calles reales.
- **Zona de servicio:** Lima central (Barranco, Breña, Cercado, Chorrillos, Jesús María, La Molina, La Victoria, Lince, Magdalena, Miraflores, Pueblo Libre, San Borja, San Isidro, San Luis, San Miguel, Surco y Surquillo) y las playas de Ancón, La Punta, Punta Hermosa, Punta Negra, Santa María del Mar y San Bartolo.

Es una **demo**: los trabajadores que aparecen al pedir son de ejemplo, no hay precios ni calificaciones inventadas, y los datos (también las cuentas) se guardan solo en el dispositivo de quien la usa. El código SMS se muestra en un aviso porque todavía no hay envío real. La ayuda es dentro de la app (emergencias y reportes); no hay atención por WhatsApp.

## Qué editar

- `js/data.js`: catálogo de oficios y distritos. No hay precios: los escribe cada cliente y cada trabajador.
- `js/zonas.js`: límites de los distritos de la zona de servicio (de OpenStreetMap). Para sumar un distrito hay que agregarlo aquí y en `js/data.js`.
- `SHEETS_URL` en `js/data.js`: URL de Apps Script para guardar pedidos, registros y reportes en Google Sheets.
- `GOOGLE_CLIENT_ID` en `js/data.js`: ID de cliente OAuth 2.0 de Google (tipo «Aplicación web»). Con él aparece «Continuar con Google» al ingresar y al crear cuenta. Orígenes autorizados: `https://chirinosj0719-rgb.github.io` y `http://localhost:8772` para probar en local.

## Estructura

- `index.html`: la landing, que explica qué es Agéndalo y lleva a la app (`js/landing.js`).
- `empresas.html`: página para empresas que se quieren unir (`js/aliados.js`).
- `app.html`: la app en sí (pedir, pedidos, trabajar, empresas, cuenta).
- `css/`: estilos (`app.css` base, `vistas.css` pantallas, `flujo.css` pedido y mapa).
- `js/`: `core.js` (estado y rutas), `acceso.js` (ingresar y crear cuenta), `cliente.js` (inicio, pedidos, mis trabajadores), `pedido.js` (pedir y elegir la dirección), `seguimiento.js` (ofertas, seguimiento, pago, calificación), `trabajador.js`, `cuenta.js`, `ajustes.js`, `empresas.js` (empresas con su equipo), `mapa.js` (mapas, direcciones y recorridos), `zonas.js`.
- `vendor/`: Leaflet y MapLibre, copiados para no depender de otro servidor.

Sin compilación: se abre `index.html` y funciona. Los mapas y las direcciones necesitan internet.

## Créditos

- Avatares 3D de los trabajadores de ejemplo: [Fluent Emoji](https://github.com/microsoft/fluentui-emoji) de Microsoft, licencia MIT (`img/av/`).
- Tipografía: Google Sans Flex (Google Fonts).
- Mapas: [Leaflet](https://leafletjs.com) (BSD-2) y [MapLibre GL JS](https://maplibre.org) (BSD-3), con el mapa de [OpenFreeMap](https://openfreemap.org) y datos de [OpenMapTiles](https://openmaptiles.org) y © colaboradores de [OpenStreetMap](https://www.openstreetmap.org/copyright) (ODbL). Límites de distritos tomados de OpenStreetMap con Nominatim.
- Direcciones: búsqueda con [Photon](https://photon.komoot.io) y dirección del punto con [Nominatim](https://nominatim.org), los dos sobre OpenStreetMap. Recorridos por calles con el servidor de demostración de [OSRM](https://project-osrm.org). Para uso real conviene un servidor propio o un servicio con contrato, porque estos servidores públicos son para poco tráfico.
