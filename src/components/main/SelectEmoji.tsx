import { useDisclosure } from "@mantine/hooks";
import { Drawer, NavLink, ThemeIcon } from "@mantine/core";
import { IconFileSmile } from "@tabler/icons-react";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";

interface SelectEmojiProps {
    title?: string;
    addEmojiCb: (emoji: EmojiClickData) => void;
}

function SelectEmoji({ title = "Add Emoji", addEmojiCb }: SelectEmojiProps) {
    const [opened, { open, close }] = useDisclosure(false);

    function selectAndClose(emoji: EmojiClickData) {
        addEmojiCb(emoji);
        close();
    }

    return (
        <>
            <Drawer
                offset={8}
                radius="md"
                opened={opened}
                onClose={close}
                title={title}
                position="bottom"
                size="50%"
            >
                <EmojiPicker width="100%" onEmojiClick={(emoji) => selectAndClose(emoji)} />
            </Drawer>

            <NavLink
                label={title}
                leftSection={
                    <ThemeIcon variant="light">
                        <IconFileSmile size="1rem" />
                    </ThemeIcon>
                }
                // rightSection={
                //     <IconChevronRight size="0.8rem" stroke={1.5} className="mantine-rotate-rtl" />
                // }
                onClick={(e) => {
                    e.preventDefault();
                    open();
                }}
            />
        </>
    );
}

export default SelectEmoji;
