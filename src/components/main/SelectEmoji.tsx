import { useDisclosure } from "@mantine/hooks";
import { Drawer, Menu, NavLink } from "@mantine/core";
import { IconFileSmile } from "@tabler/icons-react";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";

interface SelectEmojiProps {
    title?: string;
    openComp?: "NavLink" | "MenuItem" | "None";
    addEmojiCb: (emoji: EmojiClickData) => void;
    opened?: boolean;
    onOpen?: () => void;
    onClose?: () => void;
}

function SelectEmoji({
    title = "Add Emoji",
    openComp = "NavLink",
    addEmojiCb,
    opened: controlledOpened,
    onOpen,
    onClose,
}: SelectEmojiProps) {
    const [internalOpened, { open: openInternal, close: closeInternal }] = useDisclosure(false);
    const opened = controlledOpened ?? internalOpened;
    const open = onOpen ?? openInternal;
    const close = onClose ?? closeInternal;

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

            {openComp === "NavLink" && (
                <NavLink
                    label={title}
                    leftSection={<IconFileSmile size="1rem" />}
                    onClick={(e) => {
                        e.preventDefault();
                        open();
                    }}
                />
            )}

            {openComp === "MenuItem" && (
                <Menu.Item leftSection={<IconFileSmile size={14} />} onClick={() => open()}>
                    {title}
                </Menu.Item>
            )}
        </>
    );
}

export default SelectEmoji;
