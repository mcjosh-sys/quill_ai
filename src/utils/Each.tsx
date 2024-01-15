import { Children } from "react";

interface EachProps<T> {
    render: (item: T, index: number) => React.ReactNode
    of: T[]
}

export const Each = <T,> ({render, of}:EachProps<T>) => Children.toArray(of.map((item, index) => render(item, index)))