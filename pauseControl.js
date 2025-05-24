export const isPausedRef = { value: false };
export let animationSpeedRef = { value: 50 }; // in ms

export function handlePause() {
  isPausedRef.value = !isPausedRef.value;
  document.getElementById('pauseBtn').innerText = isPausedRef.value ? 'Resume' : 'Pause';
}

export function getSpeed() {
  return animationSpeedRef.value;
}

//change- to main.js, min gen algo alter