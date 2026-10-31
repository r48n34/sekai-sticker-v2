import { Tooltip, ActionIcon } from "@mantine/core";
import { IconDeviceFloppy } from "@tabler/icons-react";
import useHistoryStickerStore from "../../../store/historyStickerStore";
import useCurrentStickerStore from "../../../store/currenStickerStore";
import { notifications } from "@mantine/notifications";
import { useTranslation } from "react-i18next";
import { MAX_SAVED_STICKERS } from "../../../utils/savedStickerLimit";

function SaveToHistory() {
    const { t } = useTranslation();

    const currentSticker = useCurrentStickerStore((state) => state.sticker);
    const savedStickerCount = useHistoryStickerStore((state) => state.histStickerArray.length);
    const saveStickerFunc = useHistoryStickerStore((state) => state.addStickerHist);

    function addStickerToHist() {
        const historyIsFull = savedStickerCount >= MAX_SAVED_STICKERS;

        saveStickerFunc(currentSticker);

        notifications.show({
            title: historyIsFull ? t("Saved sticker history is full") : t("Success"),
            color: historyIsFull ? "orange" : "green",
            message: historyIsFull
                ? t("The oldest saved sticker was removed to make room for the new one.")
                : t("Current Sticker saved to history"),
        });
    }

    return (
        <Tooltip label={t("Save current sticker to history")}>
            <ActionIcon
                variant="light"
                color="blue"
                aria-label={t("Save current sticker to history")}
                onClick={() => addStickerToHist()}
            >
                <IconDeviceFloppy style={{ width: "70%", height: "70%" }} stroke={1.5} />
            </ActionIcon>
        </Tooltip>
    );
}

export default SaveToHistory;
