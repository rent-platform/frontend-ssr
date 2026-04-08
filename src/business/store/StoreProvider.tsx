import { Provider } from "react-redux";
import { store } from "./index";
import { PropsWithChildren } from "react";

export default function StoreProvider({ children }: PropsWithChildren) {
  return <Provider store={store}>{children}</Provider>;
}
