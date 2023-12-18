import { openai } from './openai';

const form = document.querySelector('#generate-form') as HTMLFormElement;
const iframe = document.querySelector('#generated-code') as HTMLIFrameElement;

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(form);

  const prompt = formData.get('prompt') as string;

  const response = await openai.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: `Tu crées des sites web avec Tailwind.
Ta tâche est généré du code html avec tailwind en fonction du prompt de l'utilisateur.
Tu renvoie uniquement du HTML sans aucun text avant ou après.
Tu renvoie du HTML valide.
Tu n'ajoutes jamais de syntaxe markdown.`,
      },
      { role: 'user', content: prompt },
    ],
    model: 'gpt-3.5-turbo',
    stream: true,
  });

  let code = '';
  const onNewChunk = createTimedUpdateIframe();

  for await (const message of response) {
    const isDone = message.choices[0].finish_reason === 'stop';
    const token = message.choices[0].delta.content;
    code += token;

    if (isDone) {
      break;
    }

    onNewChunk(code);
  }
});

const createTimedUpdateIframe = () => {
  let date = new Date();
  let timeout: any = null;

  return (code: string) => {
    // only call updateIframe if last call was more than 1 second ago
    if (new Date().getTime() - date.getTime() > 1000) {
      updateIframe(code);
      date = new Date();
    }

    // clear previous timeout
    if (timeout) {
      clearTimeout(timeout);
    }

    // set new timeout
    timeout = setTimeout(() => {
      updateIframe(code);
    }, 1000);
  };
};

const updateIframe = (code: string) => {
  iframe.srcdoc = `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Generated Code</title>
      <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body>
      ${code}
    </body>
  </html>`;
};
