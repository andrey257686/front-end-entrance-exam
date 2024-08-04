function setupWaveEffect() {
  document.querySelectorAll('.wave-effect').forEach(button =>
    button.addEventListener('mousedown', function (e) {
      const button = e.currentTarget;

      const ripple = document.createElement('span');
      ripple.classList.add('ripple-effect');

      const rect = button.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
      ripple.style.top = `${e.clientY - rect.top - size / 2}px`;

      button.appendChild(ripple);

      ripple.addEventListener('animationend', () => {
        ripple.remove();
      });
    })
  );
}

function makeWaveEffect(parentElement, event, color) {
  const ripple = document.createElement('span');
  if (color) {
    ripple.classList.add(`ripple-effect-${color}`);
  } else {
    ripple.classList.add('ripple-effect');
  }

  const rect = parentElement.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  ripple.style.width = ripple.style.height = `${size}px`;

  const left = event.clientX - rect.left - size / 2;
  const top = event.clientY - rect.top - size / 2;

  ripple.style.left = `${left}px`;
  ripple.style.top = `${top}px`;

  parentElement.appendChild(ripple);

  ripple.addEventListener('animationend', () => {
    ripple.remove();
  });
}

export { makeWaveEffect, setupWaveEffect };
