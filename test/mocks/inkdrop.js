import { useState } from "react";

export function useModal() {
  const [visible, setVisible] = useState(false);
  return {
    state: { visible },
    show: () => setVisible(true),
    close: () => setVisible(false),
  };
}
