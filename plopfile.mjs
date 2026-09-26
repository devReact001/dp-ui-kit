export default function (plop) {
  plop.setGenerator('component', {
    description: 'Scaffold a new dp-ui-kit component (component + story + test + barrel export), wired to the shared design tokens.',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Component name (PascalCase, e.g. Alert):',
        validate: (value) =>
          /^[A-Z][A-Za-z0-9]*$/.test(value) || 'Use PascalCase, e.g. Alert, DatePicker',
      },
    ],
    actions: [
      {
        type: 'add',
        path: 'src/components/{{name}}/{{name}}.tsx',
        templateFile: 'plop-templates/Component.tsx.hbs',
      },
      {
        type: 'add',
        path: 'src/components/{{name}}/{{name}}.stories.tsx',
        templateFile: 'plop-templates/Component.stories.tsx.hbs',
      },
      {
        type: 'add',
        path: 'src/components/{{name}}/{{name}}.test.tsx',
        templateFile: 'plop-templates/Component.test.tsx.hbs',
      },
      {
        type: 'add',
        path: 'src/components/{{name}}/index.ts',
        templateFile: 'plop-templates/index.ts.hbs',
      },
      (answers) =>
        `\nGenerated src/components/${answers.name}/ — component, story, test, and barrel export.\nNext: implement the component, then run "npm run storybook" to see it appear automatically under Components/${answers.name}.`,
    ],
  });
}
