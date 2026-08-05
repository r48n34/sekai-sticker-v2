import { Button, Drawer, Grid, Image, Paper, Text } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { stickerTemplates } from "../../data/templates";
import { StickerObject } from "../../utils/createSticker";

interface TemplateGalleryProps {
    opened: boolean;
    onClose: () => void;
    onApply: (layers: StickerObject[]) => void;
}

function TemplateGallery({ opened, onClose, onApply }: TemplateGalleryProps) {
    const { t } = useTranslation();

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
                            <Image src={template.thumbnail} alt="" h={180} fit="contain" />
                            <Text fw={600} mt="sm">
                                {t(template.name)}
                            </Text>
                            <Text size="sm" c="dimmed" mih={42}>
                                {t(template.description)}
                            </Text>
                            <Button
                                fullWidth
                                mt="md"
                                onClick={() => {
                                    onApply(template.createLayers());
                                    onClose();
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
