import { Text, Divider } from "@mantine/core";
import { IconTableShortcut } from "@tabler/icons-react";
import Markdown from "markdown-to-jsx";

const contentOne = `
*(English Only)*

# 🔍 When a layer is selected

- **Delete**:   
Delete current layer

- **Ctrl + D**:   
Copy and paster current layer

- **⌘+S (macOS) OR Ctrl+S (Windows)**:   
Save Sticker to clipboard
`;

function Shortcuts() {
  return (
    <>
      <Text fz={32} fw={600} ta="left" mb={8}>
        <IconTableShortcut /> Shortcuts
      </Text>

      <Divider my="md" />

      <Markdown>{contentOne}</Markdown>
    </>
  );
}

export default Shortcuts;
