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
  _atoms: Atoms[] | string[]
  Component: React.ComponentElement
}
