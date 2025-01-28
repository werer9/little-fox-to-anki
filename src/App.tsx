import "./App.css";
import { Checkbox } from "@/components/ui/checkbox.tsx";
import { useState } from "react";
import { ThemeProvider } from "@/components/theme-provider.tsx";
import SendToAnkiButton from "@/components/SendToAnkiButton.tsx";
import CreateAPKGButton from "@/components/CreateAPKGButton.tsx";

function App() {
  const [isSelected, setIsSelected] = useState<boolean>(false);
  return (
    <>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <div className="block space-y-1">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="exportSelected"
              onCheckedChange={(checked) => {
                setIsSelected(checked === "indeterminate" ? false : checked);
              }}
            />
            <label
              htmlFor="exportSelected"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Only export selected vocabulary
            </label>
          </div>
          <div className="grid grid-cols-1 space-y-2">
            {import.meta.env.CREATE_APKG_ENABLED && <CreateAPKGButton />}
            <SendToAnkiButton isSelected={isSelected} />
          </div>
        </div>
      </ThemeProvider>
    </>
  );
}

export default App;
