export default function UserAvatar({ user, size = 'lg' }) {
  const imageUrl = user?.avatar_url || user?.image_url || user?.photo_url || '';

  const sizes = {
    sm: 'h-10 w-10 text-sm rounded-xl',
    md: 'h-14 w-14 text-lg rounded-2xl',
    lg: 'h-20 w-20 text-2xl rounded-2xl',
  };

  const className = sizes[size] || sizes.lg;

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={user?.username || 'Usuario'}
        className={`${className} object-cover ring-1 ring-slate-700`}
      />
    );
  }

  const initial = user?.username?.charAt(0)?.toUpperCase() || 'U';

  return (
    <div
      className={`flex items-center justify-center bg-cyan-400/10 font-bold text-cyan-300 ring-1 ring-slate-700 ${className}`}
    >
      {initial}
    </div>
  );
}