import { Affix, Button, Group, Notification, Text } from "@mantine/core";
import { IconRefresh } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { useRegisterSW } from "virtual:pwa-register/react";

function PwaUpdatePrompt() {
    const { t } = useTranslation();
    const {
        needRefresh: [needRefresh, setNeedRefresh],
        offlineReady: [offlineReady, setOfflineReady],
        updateServiceWorker,
    } = useRegisterSW({
        onRegisterError(error) {
            console.error("Unable to register the service worker", error);
        },
    });

    const closePrompt = () => {
        setOfflineReady(false);
        setNeedRefresh(false);
    };

    if (!offlineReady && !needRefresh) {
        return null;
    }

    return (
        <Affix position={{ bottom: 16, right: 16 }} zIndex={1000}>
            <Notification
                onClose={closePrompt}
                title={t(needRefresh ? "New version available" : "App ready to work offline")}
                withBorder
                w="min(28rem, calc(100vw - 2rem))"
            >
                <Text size="sm">
                    {t(
                        needRefresh
                            ? "Refresh Sekai Sticker to use the latest version."
                            : "Sekai Sticker is now available without an internet connection.",
                    )}
                </Text>
                {needRefresh && (
                    <Group justify="flex-end" mt="sm">
                        <Button
                            leftSection={<IconRefresh size={16} />}
                            onClick={() => void updateServiceWorker(true)}
                            size="xs"
                        >
                            {t("Refresh")}
                        </Button>
                    </Group>
                )}
            </Notification>
        </Affix>
    );
}

export default PwaUpdatePrompt;
