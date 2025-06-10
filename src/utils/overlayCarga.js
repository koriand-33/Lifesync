export function mostrarOverlayCarga() {
  const overlay = document.getElementById('overlay-subida-datos');
  if (overlay) overlay.style.display = 'block';
}

export function ocultarOverlayCarga() {
  const overlay = document.getElementById('overlay-subida-datos');
  if (overlay) overlay.style.display = 'none';
}
