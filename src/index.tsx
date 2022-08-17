import * as React from "react"
import {
  RecoilRoot,
  atom,
  selector,
  useRecoilState,
  RecoilState,
  SetterOrUpdater
} from "recoil"
import { is, isNil, has } from "ramda"

const atoms: Map<string, RecoilState<Atoms>> = new Map()
let refs = {}

export const Roid = ({
  children,
  defaults = {},
  override = true
}: RoidProps) => {
  const Path = ({ children }: { children: RoidProps["children"] }) => {
    if (isNil(atoms)) {
      // TODO: might need to change how to treat atoms when they are null/undefined
      throw new Error("no state values")
    }

    for (const k in defaults) {
      if (isNil(atoms.get(k))) {
        atoms.set(
          k,
          atom<Atoms>({
            key: k,
            default: defaults[k as keyof Atoms]
          })
        )
      }
    }
    return <>{children}</>
  }
  return (
    <RecoilRoot {...{ override }}>
      <Path {...{ children }} />
    </RecoilRoot>
  )
}

const Injection = ({ _atoms, Component }: InjectionProps) => {
  const $: { [key: string]: Atoms } = {}
  const setters: { [key: string]: SetterOrUpdater<Atoms> } = {}
  let _ = {}
  const updated: Map<string, RecoilState<Atoms>> = new Map()

  for (const v of _atoms || []) {
    let key

    if (is(Object)(v) && has("get")(v)) {
      key = (v as Atoms).key

      const _get = v.get

      v.get = ({ get }: any) =>
        typeof _get === "function" &&
        _get({
          get: (v2: unknown) =>
            !isNil(atoms.get(v2 as string)) && is(String)(v2)
              ? get(atoms.get(v2))
              : get(v2)
        })

      // TODO: fix any
      if (isNil(atoms.get(key))) atoms.set(key, selector(v as any))

      // _atom = atoms.get(key);
    } else {
      const res: Atoms = is(Object)(v)
        ? (v as Atoms)
        : { key: v, default: null }

      key = res.key
      if (isNil(atoms.get(key))) {
        atoms.set(key, atom(res))
      }
      // _atom = atoms.get(key);
    }

    // TODO: remove [!]
    const [val, set] = useRecoilState(atoms.get(key)!)
    $[key] = val
    setters[key] = set
  }

  const get = (key: string) =>
    typeof updated.get(key) !== "undefined" ? updated.get(key) : $[key]

  const set = (val: any, key: string) => {
    updated.set(key, val)
    setters[key](val)
  }

  const fn =
    (func: Function) =>
    (...args: any[]) => {
      func({ args, val: args[0] || {}, get, set, refs, fn })
    }

  return <Component {...{ $, set, fn, get, refs }} />
}

export const inject = (atoms: any, Component: any) => () =>
  <Injection {...{ _atoms: atoms, Component }} />
