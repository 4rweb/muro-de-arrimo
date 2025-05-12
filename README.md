# 🧱 Retaining‑Wall Calculator

**Next.js 14 + Tailwind CSS + shadcn/ui** – uma calculadora (didática) para dimensionamento de muros de arrimo em concreto armado ou gravidade. Inclui verificações de **empuxo**, **deslizamento**, **tombamento** e **pressão de apoio** num painel limpo, inspirado na interface clássica do Eberick.

> ⚠️  **Atenção**: os modelos de cálculo aqui são simplificados. Ajuste as fórmulas e fatores de segurança para atender às exigências da sua norma (NBR 11682 / NBR 6118, Eurocode 7, etc.). Use por sua conta e risco em projetos reais.

---

## ✨ Recursos

| 🧩                       | Descrição                                                                                       |
| ------------------------ | ----------------------------------------------------------------------------------------------- |
| **UI componentizada**    | shadcn/ui + Radix UI + Tailwind; código enxuto e reusável                                       |
| **App Router**           | Estrutura padrão do Next.js 14 (`/app/page.tsx`)                                                |
| **Três abas de entrada** | *Empuxo/Solo*, *Geometria* e *Capacidade*                                                       |
| **Checks instantâneos**  | Mostra **OK**/*ERRO* coloridos para deslizamento, tombamento e σ<sub>max</sub>                  |
| **Campos completos**     | Inclinação interna/externa, base interna/externa, dente, tipo de concreto, formato do muro etc. |
| **Pronto para CI**       | Scripts npm para *lint*, *test* e *build*                                                       |

---

## 🏁 Instalação rápida

### 1. Clone o repositório

```bash
git clone https://github.com/<seu‑user>/retaining-wall.git
cd retaining-wall
```

### 2. Instale as dependências

```bash
# dependências do projeto
npm install

# CLI & componentes shadcn (se ainda não estiverem)
npx shadcn-ui@latest init         # responde aos prompts
# adicione os componentes necessários (rode um por vez)
npx shadcn-ui add select
npx shadcn-ui add tabs
npx shadcn-ui add input
npx shadcn-ui add button
npx shadcn-ui add card
```

### 3. Execute em modo desenvolvimento

```bash
npm run dev
# 📡 http://localhost:3000
```

### 4. Build de produção

```bash
npm run build && npm start
```

---

## 🧮 Cálculos implementados

* **Empuxo ativo de Rankine** (solo horizontal):

  * `K_a = tan²(45° − φ/2)`
  * `P_a = ½·γ·H²·K_a + q·H·K_a`
* **Momento de tombamento**: `M_o = P_a·H/3`
* **Peso do muro** (base + fuste) → momento resistente `M_r`
* **Deslizamento**: `FS = (W·μ + c·B) / P_a`  (>= 1,50)
* **Tombamento**: `FS = M_r / M_o`  (>= 2,00)
* **Pressão de apoio**: `σ_max = (W/B)·[1 + 6e/B]` com |e| ≤ B/6; `σ_max ≤ σ_adm`

> Para adicionar pressão hidrostática, recalque ou outros efeitos, edite `components/RetainingWallCalculator/calcular()`.

---

## 📂 Estrutura

```
retaining-wall/
├─ app/
│  └─ page.tsx                         # carrega o componente
├─ src/
│  └─ components/
│     ├─ RetainingWallCalculator/
│     │  └─ index.tsx                  # componente principal da calculadora
│     └─ ui/                           # pasta gerada pelo shadcn (button, card…)
├─ public/
│  └─ …                                # imagens, ícones
├─ .github/workflows/                  # CI opcional
└─ README.md
```

---

## 🛠 Comandos úteis

| Script          | Ação                              |
| --------------- | --------------------------------- |
| `npm run dev`   | inicia Next.js em modo dev        |
| `npm run build` | gera build de produção (`.next`)  |
| `npm start`     | roda o build localmente           |
| `npm run lint`  | ESLint + Next.js rules            |
| `npm run test`  | (opcional) Jest + Testing Library |

---

## 🤝 Contribuindo

1. Faça um **fork** do projeto
2. Crie uma branch (`git checkout -b feat/minha-melhora`)
3. Commit suas mudanças (`git commit -m "feat: minha melhora legal"`)
4. Push para o fork (`git push origin feat/minha-melhora`)
5. Abra um **Pull Request**

---

## 📜 Licença

Distribuído sob a licença **MIT**. Veja `LICENSE` para mais detalhes.

---

<p align="center"><sub>Feito com 💡 e 🏗 por engenheiros que amam código bem‑feito.</sub></p>
