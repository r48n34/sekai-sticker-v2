import { Text, Divider } from "@mantine/core";
import { IconClipboard } from "@tabler/icons-react";
import Markdown from "markdown-to-jsx";
import { useTranslation } from "react-i18next";

const contentOne = `
*(English Only)*

# 🐙 Github
https://github.com/r48n34/sekai-sticker-v2    


# 🙏 Special Thanks
This version is base on:   
https://github.com/atnightcord/sekai-stickers    
https://github.com/TheOriginalAyaka/sekai-stickers    

## 👏 Contributes from:
- @akiyamamizuki (Focked version)    
- @ayaka (Original)   

`;

function GeneralInformations() {
    const { t } = useTranslation();
    return (
        <>
            <Text fz={32} fw={600} ta="left" mb={8}>
                <IconClipboard /> {t("General information")}
            </Text>

            <Divider my="md" />

            <Markdown>{contentOne}</Markdown>
        </>
    );
}

export default GeneralInformations;
