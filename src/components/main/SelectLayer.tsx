import { Group, Tooltip, Text, Box } from "@mantine/core";
import { StickerObject } from "../../utils/createSticker";
import { Pagination } from "@mantine/core";
import { IconLayersDifference } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";

type SelectLayerProps = {
  data: StickerObject[];
  selectCb: (id: string) => void;
};

function SelectLayer({ data, selectCb }: SelectLayerProps) {
  const { t } = useTranslation();

  return (
    <Box>
      {/* <Card padding="lg" radius="md" withBorder> */}
      <Group justify="center">
        <Text ta="center" c="dimmed" fz={12}>
          <IconLayersDifference size={16} /> {t("Layer Select")}
        </Text>

        <Tooltip label={t("Layer Select")}>
          <Pagination
            color="gray"
            onChange={(ind) => {
              const targetId = data.find((_, i) => i === ind - 1);
              selectCb(targetId!.id);
            }}
            total={data.length}
            size={"xs"}
          />
        </Tooltip>
      </Group>
      {/* </Card> */}
    </Box>
  );
}

export default SelectLayer;
