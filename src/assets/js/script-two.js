setInterval(() => {
  const body = document.querySelector('body');
  if (body) {
    body.style.backgroundColor = body.style.backgroundColor === 'lightblue' ? '#f0f0f0' : 'lightblue';
  }
}, 1000);
