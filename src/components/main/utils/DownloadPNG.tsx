import { Button } from "@mantine/core";
import { IconImageInPicture } from "@tabler/icons-react";
import { downloadFile } from "../../../utils/downloadUtils";

type DownloadPNGProps = {
    dataURL: string;
};

function DownloadPNG({ dataURL }: DownloadPNGProps) {
    return (
        <Button
            variant="light"
            leftSection={<IconImageInPicture size={16} />}
            onClick={() => {
                downloadFile(dataURL, `${new Date().getTime()}_stage.png`);
            }}
        >
            Download PNG
        </Button>
    );
}

export default DownloadPNG;
