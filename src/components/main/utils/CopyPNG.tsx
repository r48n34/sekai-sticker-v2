import { Button } from "@mantine/core";
import { IconPictureInPictureOn } from "@tabler/icons-react";
import { copyImages } from "../../../utils/copyUtils";
import { dataURLToBlob } from "../../../utils/downloadUtils";
import { notifications } from "@mantine/notifications";
import { useTranslation } from "react-i18next";

type CopyPNGProps = {
  dataURL: string;
};

function CopyPNG({ dataURL }: CopyPNGProps) {
  const { t } = useTranslation();

  return (
    <>
      <Button
        variant="light"
        onClick={async () => {
          try {
            const blobImage = await dataURLToBlob(dataURL);

            copyImages(blobImage, "image/png");

            notifications.show({
              title: t("Success"),
              message: "Image copied to your clipboard.",
            });
          } catch (error) {
            console.error(error);
            notifications.show({
              title: "Error",
              message: (error as Error).message,
            });
          }
        }}
        leftSection={<IconPictureInPictureOn size={16} />}
      >
        Copy PNG
      </Button>
    </>
  );
}

export default CopyPNG;
