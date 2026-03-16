import { Tooltip, ActionIcon, Text } from "@mantine/core";
import { modals } from "@mantine/modals";
import { IconTrash } from "@tabler/icons-react";
import useHistoryStickerStore from "../../../store/historyStickerStore";

type RemoveOneToHistoryProps = {
  ind: number;
};

function RemoveOneToHistory({ ind }: RemoveOneToHistoryProps) {
  const clearOneStickerHistFunc = useHistoryStickerStore((state) => state.clearOneStickerHist);

  const openRemoveStickerModal = () =>
    modals.openConfirmModal({
      title: "Confirm delete message",
      children: <Text size="sm">Are you sure to delete this sticker?</Text>,
      labels: { confirm: "Confirm", cancel: "Cancel" },
      onCancel: () => {},
      onConfirm: () => {
        clearOneStickerHistFunc(ind);
      },
    });

  return (
    <Tooltip label="Remove Sticker">
      <ActionIcon
        variant="light"
        color="red"
        aria-label="Remove Sticker"
        onClick={() => openRemoveStickerModal()}
      >
        <IconTrash style={{ width: "70%", height: "70%" }} stroke={1.5} />
      </ActionIcon>
    </Tooltip>
  );
}

export default RemoveOneToHistory;
