import { JSX } from './jsx/jsx-namespace';
import { FunctionComponent } from './types';
export interface ReactContext<T> {
    Provider: FunctionComponent<{
        value: T;
        children: JSX.Element;
    }>;
    Injecter: FunctionComponent<{
        children: JSX.Element;
        [key: string]: any;
    }>;
    Consumer: FunctionComponent<{
        children: (value: T) => JSX.Element | null;
    }>;
}
export default function createContext<T>(defaultValue?: T): ReactContext<T>;
