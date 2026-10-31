import { Button, Drawer, Grid, Image, Paper, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { stickerTemplates, StickerTemplate } from "../../data/templates";
import { StickerObject } from "../../utils/createSticker";

interface TemplateGalleryProps {
    opened: boolean;
    onClose: () => void;
    onApply: (layers: StickerObject[]) => void;
}

// Shown when a template preview cannot be loaded, so the card never renders a
// broken-image glyph.
const TEMPLATE_PLACEHOLDER = `data:image/svg+xml;utf8,${encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="240" height="180"><rect width="100%" height="100%" fill="#2f2f37"/><text x="50%" y="50%" fill="#9096a3" font-family="sans-serif" font-size="15" text-anchor="middle" dominant-baseline="middle">No preview</text></svg>',
)}`;

function TemplateGallery({ opened, onClose, onApply }: TemplateGalleryProps) {
    const { t } = useTranslation();
    const [applyingId, setApplyingId] = useState<string | null>(null);

    const applyTemplate = async (template: StickerTemplate) => {
        setApplyingId(template.id);
        try {
            const layers = await template.createLayers();

            onApply(layers);
            onClose();
        } catch {
            notifications.show({
                title: t("Something went wrong"),
                message: t("Could not prepare this template. Please try again."),
                color: "red",
            });
        } finally {
            setApplyingId(null);
        }
    };

    return (
        <Drawer
            opened={opened}
            onClose={onClose}
            title={t("Starter templates")}
            position="bottom"
            size="70%"
            radius="md"
            closeButtonProps={{ "aria-label": t("Close templates") }}
        >
            <Grid>
                {stickerTemplates.map((template) => (
                    <Grid.Col key={template.id} span={{ base: 12, sm: 6, md: 4 }}>
                        <Paper withBorder p="md" radius="md">
                            <Image
                                src={template.thumbnail}
                                fallbackSrc={TEMPLATE_PLACEHOLDER}
                                alt={t(template.name)}
                                h={180}
                                fit="contain"
                            />
                            <Text fw={600} mt="sm">
                                {t(template.name)}
                            </Text>
                            <Text size="sm" c="dimmed" mih={42}>
                                {t(template.description)}
                            </Text>
                            <Button
                                fullWidth
                                mt="md"
                                loading={applyingId === template.id}
                                disabled={applyingId !== null && applyingId !== template.id}
                                onClick={() => {
                                    void applyTemplate(template);
                                }}
                            >
                                {t("Use template")}
                            </Button>
                        </Paper>
                    </Grid.Col>
                ))}
            </Grid>
        </Drawer>
    );
}

export default TemplateGallery;
