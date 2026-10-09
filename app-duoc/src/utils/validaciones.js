// Validaciones de formularios de autenticación.
// Cada función retorna un mensaje de error, o cadena vacía si el valor es válido.

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const NOMBRE_REGEX = /^[A-Za-zÀ-ÖØ-öø-ÿÑñ\s'.-]+$/;
const TELEFONO_REGEX = /^(\+?56)?\s?9\s?\d{4}\s?\d{4}$/;

export function validarNombre(valor) {
  const nombre = valor.trim();
  if (!nombre) return 'El nombre es obligatorio.';
  if (nombre.length < 3) return 'El nombre debe tener al menos 3 caracteres.';
  if (nombre.length > 50) return 'El nombre no puede superar los 50 caracteres.';
  if (!NOMBRE_REGEX.test(nombre)) return 'El nombre solo puede contener letras y espacios.';
  return '';
}

export function validarCorreo(valor) {
  const correo = valor.trim();
  if (!correo) return 'El correo electrónico es obligatorio.';
  if (!EMAIL_REGEX.test(correo)) return 'Ingresa un correo electrónico válido (ej: nombre@correo.cl).';
  return '';
}

export function validarConfirmacionCorreo(valor, correo) {
  if (!valor.trim()) return 'Debes confirmar tu correo electrónico.';
  if (valor.trim().toLowerCase() !== correo.trim().toLowerCase()) {
    return 'Los correos electrónicos no coinciden.';
  }
  return '';
}

export function validarContrasena(valor) {
  if (!valor) return 'La contraseña es obligatoria.';
  if (valor.length < 8) return 'La contraseña debe tener al menos 8 caracteres.';
  if (!/[A-Z]/.test(valor)) return 'La contraseña debe incluir al menos una mayúscula.';
  if (!/[a-z]/.test(valor)) return 'La contraseña debe incluir al menos una minúscula.';
  if (!/\d/.test(valor)) return 'La contraseña debe incluir al menos un número.';
  if (!/[^A-Za-z0-9]/.test(valor)) return 'La contraseña debe incluir al menos un símbolo.';
  return '';
}

export function validarConfirmacionContrasena(valor, contrasena) {
  if (!valor) return 'Debes confirmar tu contraseña.';
  if (valor !== contrasena) return 'Las contraseñas no coinciden.';
  return '';
}

export function validarTelefono(valor) {
  const telefono = valor.trim();
  if (!telefono) return ''; // Es opcional.
  if (!TELEFONO_REGEX.test(telefono)) {
    return 'Formato inválido. Usa +56 9 XXXX XXXX o 9XXXXXXXX.';
  }
  return '';
}

export function validarRegion(valor) {
  if (!valor) return 'Debes seleccionar tu región.';
  return '';
}

export function validarComuna(valor) {
  if (!valor) return 'Debes seleccionar tu comuna.';
  return '';
}
