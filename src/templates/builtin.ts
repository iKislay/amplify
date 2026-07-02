import { PromptTemplate } from '../types';

/**
 * Built-in prompt templates organized by category.
 */
export const BUILTIN_TEMPLATES: PromptTemplate[] = [
    {
        id: 'api-rest-design',
        name: 'REST API Design',
        category: 'api-design',
        description: 'Design a RESTful API with endpoints, validation, and error handling',
        icon: '🌐',
        template: `Design a RESTful API for: {task}

Include:
- Resource endpoints (CRUD) with proper HTTP methods
- Request/response schemas with TypeScript interfaces
- Input validation rules
- Error response format (with HTTP status codes)
- Authentication/authorization requirements
- Pagination strategy
- Rate limiting considerations`,
    },
    {
        id: 'refactor-extract',
        name: 'Extract & Refactor',
        category: 'refactoring',
        description: 'Refactor code by extracting responsibilities into clean modules',
        icon: '🔧',
        template: `Refactor the following code: {task}

Requirements:
- Extract into single-responsibility modules/functions
- Maintain existing behavior (no functional changes)
- Add proper TypeScript types
- Follow SOLID principles
- Ensure testability of extracted units
- Preserve existing test coverage`,
    },
    {
        id: 'test-unit',
        name: 'Unit Test Suite',
        category: 'testing',
        description: 'Generate comprehensive unit tests with edge cases',
        icon: '🧪',
        template: `Write comprehensive unit tests for: {task}

Coverage requirements:
- Happy path scenarios
- Edge cases (empty inputs, boundaries, null/undefined)
- Error scenarios and exception handling
- Mocking of external dependencies
- Use describe/it blocks with descriptive names
- Follow AAA pattern (Arrange, Act, Assert)
- Include setup/teardown where needed`,
    },
    {
        id: 'debug-investigate',
        name: 'Debug Investigation',
        category: 'debugging',
        description: 'Systematic debugging approach for an issue',
        icon: '🐛',
        template: `Debug this issue: {task}

Approach:
1. Identify potential root causes (list 3-5 hypotheses)
2. For each hypothesis, suggest a diagnostic step
3. Provide the most likely fix with explanation
4. Suggest preventive measures (tests, validation)
5. Check for related issues that might have the same root cause`,
    },
    {
        id: 'migration-plan',
        name: 'Migration Plan',
        category: 'migration',
        description: 'Plan a technology or version migration with rollback strategy',
        icon: '🚀',
        template: `Plan a migration for: {task}

Include:
- Pre-migration checklist
- Step-by-step migration procedure
- Data migration strategy (if applicable)
- Rollback plan at each step
- Testing strategy (smoke tests, integration tests)
- Monitoring and success criteria
- Timeline estimate with dependencies`,
    },
    {
        id: 'doc-module',
        name: 'Module Documentation',
        category: 'documentation',
        description: 'Generate comprehensive documentation for a module',
        icon: '📝',
        template: `Document this module/component: {task}

Include:
- Overview and purpose
- Architecture diagram (mermaid)
- Public API reference with examples
- Configuration options
- Error handling behavior
- Usage examples (common and advanced)
- Known limitations`,
    },
    {
        id: 'arch-system',
        name: 'System Architecture',
        category: 'architecture',
        description: 'Design system architecture with components and data flow',
        icon: '🏗️',
        template: `Design the architecture for: {task}

Deliverables:
- High-level system diagram (describe components)
- Data flow between components
- Technology choices with justification
- Scalability considerations
- Security boundaries
- Error handling and resilience patterns
- Deployment topology`,
    },
    {
        id: 'arch-component',
        name: 'Component Design',
        category: 'architecture',
        description: 'Design a single component with interfaces and contracts',
        icon: '🧩',
        template: `Design this component: {task}

Include:
- Public interface/API contract
- Internal structure and data model
- Dependencies and their interfaces
- State management approach
- Error states and handling
- Performance considerations
- Extension points for future requirements`,
    },
];

/**
 * Get all available templates (built-in + user custom).
 */
export function getAllTemplates(): PromptTemplate[] {
    // In future: merge with user-defined templates from workspace
    return [...BUILTIN_TEMPLATES];
}

/**
 * Get templates filtered by category.
 */
export function getTemplatesByCategory(category: string): PromptTemplate[] {
    return BUILTIN_TEMPLATES.filter(t => t.category === category);
}

/**
 * Apply a template by replacing {task} placeholder.
 */
export function applyTemplate(template: PromptTemplate, task: string): string {
    return template.template.replace('{task}', task);
}
