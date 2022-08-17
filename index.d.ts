type RoidProps = {
  children: React.ReactNode
  defaults: { [key: string]: any }
  override: boolean
}

type Atoms = {
  key: string
  default: any
}

type InjectionProps = {
  _atoms: Atoms[] | string[] | undefined
  Component: React.ElementType<ComponentProps>
}

type GetKeysOf<TType> = TType extends Atoms[]
  ? Atoms[number]["key"]
  : TType extends string[]
  ? keyof RoidProps["defaults"]
  : never

type ComponentProps<T> = {
  $: any
  set: (val: any, key: GetKeysOf<T>) => void
  get: (key: GetKeysOf<T>) => Atoms | RecoilState<Atoms> | undefined
  fn: (func: Function) => (...args: any[]) => void
}
