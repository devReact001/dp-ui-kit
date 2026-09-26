# dp-ui-kit

> A production-ready React + TypeScript component library built with Tailwind CSS — designed for scalable enterprise UI with full WCAG 2.1 AA accessibility compliance.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.3-38BDF8?logo=tailwindcss)](https://tailwindcss.com/)
[![WCAG 2.1 AA](https://img.shields.io/badge/WCAG-2.1%20AA-green)](https://www.w3.org/TR/WCAG21/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

---

## ✨ Components

| Component | Description |
|-----------|-------------|
| `Button` | 7 variants · 5 sizes · loading state · icon slots · ARIA |
| `Input` | Label · helper/error text · left/right addons · ARIA invalid |
| `Card` | Header · footer · shadow variants · hoverable · clickable |
| `Badge` | 6 colour schemes · dot indicator · rounded pill |
| `Modal` | Focus trap · Escape key · overlay dismiss · ARIA dialog |
| `Toast` | 4 types · auto-dismiss · container with positioning |
| `Tooltip` | 4 placements · keyboard accessible · ARIA describedby |
| `Dropdown` | Keyboard nav · ARIA listbox · danger items · alignment |
| `Spinner` | 5 sizes · ARIA status · screen-reader label |
| `Table` | Sortable columns · loading state · empty state · row click |

---

## 🚀 Quick Start

```bash
npm install @deepak-prasad/dp-ui-kit
# Tailwind CSS required as peer dependency
```

```tsx
import { Button, Input, Badge, Card } from '@deepak-prasad/dp-ui-kit';

function App() {
  return (
    <Card header="User Profile" shadow="md">
      <Input label="Full Name" placeholder="Deepak Prasad" />
      <div className="mt-4 flex gap-2">
        <Badge color="green" dot>Active</Badge>
        <Badge color="blue">Admin</Badge>
      </div>
      <Button variant="primary" className="mt-4" fullWidth>
        Save Changes
      </Button>
    </Card>
  );
}
```

---

## 🎨 Button Variants

```tsx
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="success">Success</Button>
<Button variant="danger">Danger</Button>
<Button variant="warning">Warning</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="outline">Outline</Button>

// With loading state
<Button variant="primary" loading>Saving...</Button>

// With icons
<Button leftIcon={<SaveIcon />}>Save</Button>
```

---

## ♿ Accessibility

Every component is built with accessibility first:

- **WCAG 2.1 AA** compliant colour contrast on all variants
- **ARIA roles** and attributes on all interactive elements
- **Focus management** — Modal traps focus; Tab key navigates Dropdown items
- **Screen reader support** — `sr-only` labels on icon-only controls and Spinner
- **Keyboard navigation** — all components fully operable without a mouse
- **`aria-live` regions** — Toast uses `aria-live="assertive"` for announcements
- **Semantic HTML** — `<button>`, `<label>`, `<th scope="col">`, `<caption>` used correctly

---

## 📁 Project Structure

```
src/
├── components/
│   ├── Button/     Button.tsx · Button.test.tsx
│   ├── Input/      Input.tsx
│   ├── Card/       Card.tsx
│   ├── Badge/      Badge.tsx
│   ├── Modal/      Modal.tsx
│   ├── Toast/      Toast.tsx
│   ├── Tooltip/    Tooltip.tsx
│   ├── Dropdown/   Dropdown.tsx
│   ├── Spinner/    Spinner.tsx
│   └── Table/      Table.tsx
├── types/          index.ts   (Size, Variant, ColorScheme, BaseProps)
├── utils/          cn.ts      (Tailwind class merger)
└── index.ts        (barrel exports)
```

---

## 🛠️ Development

```bash
npm install
npm run dev        # Vite dev server
npm run test       # Jest + React Testing Library
npm run storybook  # Component docs on :6006
npm run build      # Production build
npm run lint       # ESLint
```

---

## Author

**Deepak Prasad** — Senior Frontend Developer  
React · TypeScript · Micro-Frontends · WCAG/ADA  
[linkedin.com/in/deepak-prasad](https://linkedin.com/in/deepak-prasad)

---

## License

MIT
