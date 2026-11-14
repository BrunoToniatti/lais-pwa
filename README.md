# Lais Platform — PWA

Painel administrativo da plataforma de gestão, governança e CRO da Laís.
Angular 17, instalável (PWA), responsivo e com animações.

## Telas

| Rota | O que tem |
|---|---|
| `/login` | Login real contra a API (sem senha ou token no código) |
| `/painel` | Indicadores animados, gráfico de exibições e cliques, campanhas em destaque |
| `/campanhas` | Lista com filtros, ativar/pausar, editar e excluir |
| `/campanhas/nova` · `/campanhas/:id` | Formulário com pré-visualização do modal (celular e computador) |
| `/historico` | Linha do tempo de auditoria (somente leitura) |

## Responsivo (celular, tablet e computador)

- **Celular:** barra superior e abas na parte de baixo, com área segura do iPhone.
- **Tablet (≥ 768px):** menu lateral compacto só com ícones.
- **Computador (≥ 1100px):** menu lateral completo.

## PWA

- Instalável pelo botão **Instalar app** (aparece quando o navegador permite).
- Aviso quando há uma nova versão e quando o aparelho está sem conexão.
- O service worker só roda no build de produção.
- Respeita `prefers-reduced-motion` e o modo escuro do sistema.

## Rodando

```bash
npm install
npm start              # http://localhost:4200  (API em http://localhost:8000/api)
npm run build          # produção (usa src/environments/environment.ts)
```

A URL da API fica em `src/environments/`. **Nunca coloque tokens ou senhas nesses arquivos.**
Para testar a instalação e o modo offline, rode o build de produção e sirva `dist/lais-pwa/browser`
com HTTPS ou `localhost`.

## Publicar na Netlify

O `netlify.toml` já traz tudo: comando de build, pasta publicada (`dist/lais-pwa/browser`), Node 20 e o
redirecionamento de todas as rotas para o `index.html` (sem ele, recarregar `/login` dá 404).
Basta conectar o repositório. A URL da API de produção fica em `src/environments/environment.ts`.
