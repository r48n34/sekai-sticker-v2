import { useDisclosure } from "@mantine/hooks";
import { Modal, ActionIcon, Tooltip, Group, Text } from "@mantine/core";
import { IconNotebook } from "@tabler/icons-react";
import LearnMoreContent from "./LearnMoreContent";
import { useTranslation } from "react-i18next";

type LearnMoreProps = {
    opened?: boolean;
    onOpen?: () => void;
    onClose?: () => void;
    hideTrigger?: boolean;
};

function LearnMore({
    opened: controlledOpened,
    onOpen,
    onClose,
    hideTrigger = false,
}: LearnMoreProps) {
    const { t } = useTranslation();
    const [internalOpened, { open: openInternal, close: closeInternal }] = useDisclosure(false);
    const opened = controlledOpened ?? internalOpened;
    const open = onOpen ?? openInternal;
    const close = onClose ?? closeInternal;

    return (
        <>
            <Modal opened={opened} onClose={close} title={t("General information")} size="85%">
                <LearnMoreContent />
            </Modal>

            {!hideTrigger && (
                <Group>
                    <Text c="dimmed" fz={12}>
                        v1.2.0
                    </Text>

                    <Tooltip label={t("General information")}>
                        <ActionIcon
                            variant="light"
                            aria-label={t("General information")}
                            onClick={open}
                        >
                            <IconNotebook style={{ width: "70%", height: "70%" }} stroke={1.5} />
                        </ActionIcon>
                    </Tooltip>
                </Group>
            )}
        </>
    );
}

export default LearnMore;
