const form = document.querySelector('#generate-form') as HTMLFormElement;

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(form);

  const prompt = formData.get('prompt') as string;

  alert(prompt);
});
