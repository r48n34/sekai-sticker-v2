import { Group, Text, rem } from "@mantine/core";
import { IconUpload, IconPhoto, IconX } from "@tabler/icons-react";
import { Dropzone, IMAGE_MIME_TYPE } from "@mantine/dropzone";
import { useTranslation } from "react-i18next";

type DropZoneFullScreenProps = {
  callBackImageURL: (imageURL: string) => void;
};

function DropZoneFullScreen({ callBackImageURL }: DropZoneFullScreenProps) {
  const { t } = useTranslation();

  async function submitForm(imageFile: File) {
    const arrayBuffer = await imageFile!.arrayBuffer();
    const fileUrl = URL.createObjectURL(new Blob([arrayBuffer]));
    callBackImageURL(fileUrl);
  }

  return (
    <>
      <Dropzone.FullScreen
        active={true}
        accept={IMAGE_MIME_TYPE}
        onDrop={(files) => {
          console.log(files);
          for (const v of files) {
            submitForm(v);
          }
        }}
      >
        <Group justify="center" gap="xl" mih={220} style={{ pointerEvents: "none" }}>
          <Dropzone.Accept>
            <IconUpload
              style={{ width: rem(52), height: rem(52), color: "var(--mantine-color-blue-6)" }}
              stroke={1.5}
            />
          </Dropzone.Accept>
          <Dropzone.Reject>
            <IconX
              style={{ width: rem(52), height: rem(52), color: "var(--mantine-color-red-6)" }}
              stroke={1.5}
            />
          </Dropzone.Reject>
          <Dropzone.Idle>
            <IconPhoto
              style={{ width: rem(52), height: rem(52), color: "var(--mantine-color-dimmed)" }}
              stroke={1.5}
            />
          </Dropzone.Idle>

          <div>
            <Text size="xl" inline>
              {t("Drag images here or click to select files")}
            </Text>
            <Text size="sm" c="dimmed" inline mt={7}>
              {t("Attach as many files as you like, each file should not exceed")} 5mb
            </Text>
          </div>
        </Group>
      </Dropzone.FullScreen>
    </>
  );
}

export default DropZoneFullScreen;
