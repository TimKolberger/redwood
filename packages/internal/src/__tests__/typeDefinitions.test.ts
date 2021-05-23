import fs from 'fs'
import path from 'path'

import {
  generateCellTypesDefs,
  generateDirectoryNamedModuleTypeDefs,
  generateRouterPageImports,
  generateCurrentUserTypeDef,
  generateRouterRoutesTypeDef,
} from '../generate/typeDefinitions'
import { ensurePosixPath } from '../paths'

const FIXTURE_PATH = path.resolve(
  __dirname,
  '../../../../__fixtures__/example-todo-main'
)

beforeAll(() => {
  process.env.__REDWOOD__CONFIG_PATH = FIXTURE_PATH
})
afterAll(() => {
  delete process.env.__REDWOOD__CONFIG_PATH
})

test('generate the correct mirror types for cells', () => {
  const paths = generateCellTypesDefs()
  const p = paths.map((p) => p.replace(FIXTURE_PATH, '')).map(ensurePosixPath)

  expect(p).toMatchInlineSnapshot(`
    Array [
      "/.redwood/types/mirror/web/src/components/NumTodosCell/index.d.ts",
      "/.redwood/types/mirror/web/src/components/TodoListCell/index.d.ts",
    ]
  `)

  expect(fs.readFileSync(paths[0], 'utf-8')).toMatchInlineSnapshot(`
    "// This file was generated by RedwoodJS
    import { Success } from './NumTodosCell'
    type SuccessType = typeof Success
    export default function (): ReturnType<SuccessType>"
  `)
})

test('generate the correct mirror types for directory named modules', () => {
  const paths = generateDirectoryNamedModuleTypeDefs()
  const p = paths.map((p) => p.replace(FIXTURE_PATH, '')).map(ensurePosixPath)

  expect(p).toMatchInlineSnapshot(`
    Array [
      "/.redwood/types/mirror/api/src/services/todos/index.d.ts",
      "/.redwood/types/mirror/web/src/components/AddTodo/index.d.ts",
      "/.redwood/types/mirror/web/src/components/Check/index.d.ts",
      "/.redwood/types/mirror/web/src/components/TodoItem/index.d.ts",
      "/.redwood/types/mirror/web/src/layouts/SetLayout/index.d.ts",
    ]
  `)

  expect(fs.readFileSync(paths[0], 'utf-8')).toMatchInlineSnapshot(`
    "// This file was generated by RedwoodJS
    import { default as DEFAULT } from './todos'
    export default DEFAULT
    export * from './todos'
    "
  `)
})

test('generates global page imports', () => {
  const paths = generateRouterPageImports()
  const p = paths.map((p) => p.replace(FIXTURE_PATH, '')).map(ensurePosixPath)
  expect(p[0]).toEqual('/.redwood/types/includes/web-global-pages.d.ts')

  const c = fs.readFileSync(paths[0], 'utf-8')

  expect(c).toContain(`
declare global {
  const BarPage: typeof BarPageType
  const FatalErrorPage: typeof FatalErrorPageType
  const FooPage: typeof FooPageType
  const HomePage: typeof HomePageType
  const NotFoundPage: typeof NotFoundPageType
  const TypeScriptPage: typeof TypeScriptPageType
  const adminEditUserPage: typeof adminEditUserPageType
}`)
})

test('generate current user ', () => {
  const paths = generateCurrentUserTypeDef()
  const p = paths.map((p) => p.replace(FIXTURE_PATH, '')).map(ensurePosixPath)
  expect(p[0]).toEqual('/.redwood/types/includes/currentUser.d.ts')
  // The type definition output is static, so there's nothing to test.
})

test('generates the router routes', () => {
  const paths = generateRouterRoutesTypeDef()
  const p = paths.map((p) => p.replace(FIXTURE_PATH, '')).map(ensurePosixPath)
  expect(p[0]).toEqual('/.redwood/types/includes/routerRoutes.d.ts')

  const c = fs.readFileSync(paths[0], 'utf-8')
  expect(c).toContain(`
    home: (params?: RouteParams<"/"> & QueryParams) => "/"
    typescriptPage: (params?: RouteParams<"/typescript"> & QueryParams) => "/typescript"
    someOtherPage: (params?: RouteParams<"/somewhereElse"> & QueryParams) => "/somewhereElse"
    fooPage: (params?: RouteParams<"/foo"> & QueryParams) => "/foo"
    barPage: (params?: RouteParams<"/bar"> & QueryParams) => "/bar"
`)
})
