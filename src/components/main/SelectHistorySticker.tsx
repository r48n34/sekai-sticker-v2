import { useDisclosure } from "@mantine/hooks";
import { Drawer, Grid, NavLink, Button, Box, Group, Text, ThemeIcon } from "@mantine/core";
import { IconAdjustments, IconSticker } from "@tabler/icons-react";
import useHistoryStickerStore from "../../store/historyStickerStore";
import { CONFIGS, StickerObject } from "../../utils/createSticker";
import { notifications } from "@mantine/notifications";
import RemoveOneToHistory from "./helper/RemoveOneToHistory";
import ViewCanvasComp from "./utils/ViewCanvasComp";
import RemoveAllHistory from "./helper/RemoveAllHistory";
import { useTranslation } from "react-i18next";

interface SelectHistoryStickerProps {
    title?: string;
    openComp?: "NavLink" | "Button";
    setStickerCb: (sticker: StickerObject[]) => void;
}

function SelectHistorySticker({
    title = "View Saved",
    openComp = "NavLink",
    setStickerCb,
}: SelectHistoryStickerProps) {
    const { t } = useTranslation();

    const [opened, { open, close }] = useDisclosure(false);
    const histStickerArray = useHistoryStickerStore((state) => state.histStickerArray);

    function selectAndClose(ind: number) {
        setStickerCb(histStickerArray[ind]);
        close();

        notifications.show({
            title: "Sticker loaded",
            message: "The saved sticker is loaded to your board.",
        });
    }

    return (
        <>
            <Drawer
                offset={8}
                radius="md"
                opened={opened}
                onClose={close}
                title={
                    <Group>
                        <Text>{t("View Saved Stickers")}</Text>

                        {histStickerArray.length >= 1 && <RemoveAllHistory />}
                    </Group>
                }
                position="bottom"
                size="65%"
            >
                {histStickerArray.length <= 0 && (
                    <Box>
                        <Text c="dimmed" ta="center" mt={160}>
                            {t("You have no saved sticker in history")}
                        </Text>
                    </Box>
                )}

                <Grid>
                    {histStickerArray.map((stickerContent, ind) => (
                        <Grid.Col span={{ base: 12, md: 6, lg: 3 }} key={ind}>
                            <Box
                                style={{
                                    minWidth: CONFIGS.stageWidth,
                                    minHeight: CONFIGS.stageHeight + 60,
                                }}
                            >
                                <Group justify="flex-end" mt={12}>
                                    <RemoveOneToHistory ind={ind} />
                                </Group>

                                <ViewCanvasComp
                                    stickerContent={stickerContent}
                                    clickCb={() => selectAndClose(ind)}
                                />
                            </Box>
                        </Grid.Col>
                    ))}
                </Grid>
            </Drawer>

            {openComp === "NavLink" && (
                <NavLink
                    label={title}
                    leftSection={
                        <ThemeIcon variant="light">
                            <IconSticker size="1rem" />
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
            )}

            {openComp === "Button" && (
                <Button leftSection={<IconAdjustments />} variant="light" onClick={() => open()}>
                    {t("View Saved Stickers")}
                </Button>
            )}
        </>
    );
}

export default SelectHistorySticker;
