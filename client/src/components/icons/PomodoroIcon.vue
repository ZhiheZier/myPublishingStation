<template>
  <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="g" cx="50%" cy="40%" r="60%">
        <stop offset="0%" stop-color="#ff7c7c"/>
        <stop offset="100%" stop-color="#ef4444"/>
      </radialGradient>
    </defs>
    <circle cx="32" cy="36" r="20" fill="url(#g)"/>
    <path d="M32 12c4 0 9 3 9 6 0 0-5-2-9-2s-9 2-9 2c0-3 5-6 9-6z" fill="#16a34a"/>
    <path d="M32 12c0 5-2 8-6 10" stroke="#0f766e" stroke-width="2" fill="none" />
  </svg>
</template>
<script>
export default { name: 'PomodoroIcon' }
</script>
