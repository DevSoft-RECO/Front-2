export const getAvatarUrl = (path) => {
    if (!path) return null;

    // Si ya es una URL completa (http/https) o data URI (blob/base64), devolverla tal cual
    if (path.startsWith('http') || path.startsWith('data:') || path.startsWith('blob:')) {
        return path;
    }

    // Obtener URL base de la App Madre desde variables de entorno
    // IMPORTANTE: Asegurarse de quitar slash final si existe
    const baseUrl = (import.meta.env.VITE_MOTHER_API_URL || 'http://localhost:8000').replace(/\/+$/, '');

    // Limpiar el path para evitar dobles slashes
    const cleanPath = path.replace(/^\/+/, '');

    // Backend de Laravel suele guardar en 'storage/...', pero la URL pública suele requerir '/storage/'
    // Si el path ya viene con 'storage/', perfecto. Si no, y es algo como 'users/avatars/...',
    // dependerá de cómo el backend sirva los archivos.
    // Asumiremos que el backend devuelve un path relativo accesible (o que necesita ser prefijado si es 'public')
    // Ajuste común: Si la madre devuelve "users/avatars/x.jpg", y eso está en `public/storage`,
    // la URL real es `http://madre/storage/users/avatars/x.jpg`.

    // Verificamos si necesita 'storage'
    if (!cleanPath.startsWith('storage/')) {
        // Opción A: concatenar 'storage/' si sabemos que falta.
        // return `${baseUrl}/storage/${cleanPath}`;

        // Opción B (segura por ahora): Concatenar directo, a menos que el usuario note que falta.
        // La guía dice: return `${baseUrl}/${cleanPath}`;
        return `${baseUrl}/${cleanPath}`;
    }

    return `${baseUrl}/${cleanPath}`;
};
