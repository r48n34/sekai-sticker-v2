import { Button, Group, List, Modal, Text, ThemeIcon } from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";
import { IconHistory, IconLayersDifference, IconPointer } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";

function EditorOnboarding() {
    const { t } = useTranslation();
    const [completed, setCompleted] = useLocalStorage({
        key: "sekai-onboarding-complete",
        defaultValue: false,
    });

    return (
        <Modal
            opened={!completed}
            onClose={() => setCompleted(true)}
            title={t("Welcome to Sekai Sticker")}
            centered
            closeButtonProps={{ "aria-label": t("Close onboarding") }}
        >
            <Text c="dimmed" mb="md">
                {t("Create a sticker in three quick steps")}
            </Text>
            <List spacing="md" center>
                <List.Item
                    icon={
                        <ThemeIcon variant="light">
                            <IconPointer size={18} />
                        </ThemeIcon>
                    }
                >
                    {t("Insert a character, text, emoji, or your own image")}
                </List.Item>
                <List.Item
                    icon={
                        <ThemeIcon variant="light">
                            <IconLayersDifference size={18} />
                        </ThemeIcon>
                    }
                >
                    {t("Select layers to arrange, hide, lock, and style them")}
                </List.Item>
                <List.Item
                    icon={
                        <ThemeIcon variant="light">
                            <IconHistory size={18} />
                        </ThemeIcon>
                    }
                >
                    {t("Undo freely, then export or save a named project")}
                </List.Item>
            </List>
            <Group justify="flex-end" mt="xl">
                <Button onClick={() => setCompleted(true)}>{t("Start creating")}</Button>
            </Group>
        </Modal>
    );
}

export default EditorOnboarding;
